import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { buildSystemPrompt, buildUserPrompt, type AiPlanRequest } from '@/lib/ai/prompt'
import { validatePlanJson, sanitizePlanData } from '@/lib/ai/schema'
import { validateBaseUrl, validateModelName, checkRateLimit, safeJsonParse } from '@/lib/ai/validation'
import { callAiService, type AiServiceConfig, type AiMessage } from '@/lib/ai/service'

// 最大重试次数
const MAX_RETRIES = 2

// 速率限制：每用户每 5 分钟最多 5 次
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 5 * 60 * 1000

export async function POST(request: NextRequest) {
  // 1. 鉴权
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 2. 速率限制
  const rateKey = `generate-plan:${user.id}`
  const rateResult = checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rateResult.allowed) {
    const retryAfterSec = Math.ceil((rateResult.retryAfterMs ?? 0) / 1000)
    return NextResponse.json(
      { error: `请求过于频繁，请 ${retryAfterSec} 秒后重试` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    )
  }

  // 3. 读取配置（支持请求头和请求体）
  let apiKey: string
  let baseUrl: string
  let model: string
  let provider: string

  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      const body = await request.json()
      apiKey = body.apiKey || request.headers.get('X-Api-Key') || ''
      baseUrl = body.baseUrl || request.headers.get('X-Api-Base-Url') || ''
      model = body.model || request.headers.get('X-Model') || ''
      provider = body.provider || 'openai'
      // 重新构建request对象，因为body已经被读取
      // 这里需要特殊处理，先保存body
    } catch {
      apiKey = request.headers.get('X-Api-Key') || ''
      baseUrl = request.headers.get('X-Api-Base-Url') || ''
      model = request.headers.get('X-Model') || ''
      provider = 'openai'
    }
  } else {
    apiKey = request.headers.get('X-Api-Key') || ''
    baseUrl = request.headers.get('X-Api-Base-Url') || ''
    model = request.headers.get('X-Model') || ''
    provider = 'openai'
  }

  if (!apiKey) {
    return NextResponse.json({ error: '缺少 API Key，请在设置中配置' }, { status: 400 })
  }

  // 4. 校验
  const urlCheck = validateBaseUrl(baseUrl)
  if (!urlCheck.valid) {
    return NextResponse.json({ error: urlCheck.error }, { status: 400 })
  }

  const modelCheck = validateModelName(model)
  if (!modelCheck.valid) {
    return NextResponse.json({ error: modelCheck.error }, { status: 400 })
  }

  // 5. 读取用户需求（需要重新读取，因为前面可能已经读取过了）
  // 为了避免重复读取，我们需要重构这部分逻辑
  // 由于这个端点主要是POST请求，我们需要重新获取body
  let body: AiPlanRequest
  try {
    // 重新构造request（这是一个简化处理，实际可能需要更复杂的逻辑）
    const clonedRequest = request.clone()
    body = await clonedRequest.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  // 5.5 输入长度限制
  if (Array.isArray(body.destinations)) {
    for (const d of body.destinations) {
      if (typeof d === 'string' && d.length > 200) {
        return NextResponse.json({ error: '目的地名称过长' }, { status: 400 })
      }
    }
  }
  if (body.specialRequests && body.specialRequests.length > 2000) {
    return NextResponse.json({ error: '特殊要求内容过长（最多 2000 字）' }, { status: 400 })
  }

  // 6. 校验必填字段
  if (!Array.isArray(body.destinations) || body.destinations.filter((d: string) => d?.trim()).length === 0) {
    return NextResponse.json({ error: '至少需要一个目的地' }, { status: 400 })
  }
  if (!body.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) {
    return NextResponse.json({ error: '出发日期格式错误，应为 YYYY-MM-DD' }, { status: 400 })
  }
  if (!body.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.endDate)) {
    return NextResponse.json({ error: '返回日期格式错误，应为 YYYY-MM-DD' }, { status: 400 })
  }
  if (body.startDate >= body.endDate) {
    return NextResponse.json({ error: '返回日期必须晚于出发日期' }, { status: 400 })
  }

  // 清理目的地数组
  body.destinations = body.destinations.filter((d: string) => d?.trim())

  // 7. 构建配置和服务调用
  const config: AiServiceConfig = {
    apiKey,
    baseUrl: baseUrl || 'https://api.openai.com/v1',
    model: model || 'gpt-4o-mini',
    provider
  }

  // 8. 调用 LLM API（带重试）
  let lastError: string = ''
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 构造 Prompt
      const systemPrompt = buildSystemPrompt()
      const userPrompt = buildUserPrompt(body)

      const messages: AiMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]

      const response = await callAiService(config, messages, {
        temperature: 0.7,
        maxTokens: 8000,
        responseFormat: 'json',
        timeout: 120000
      })

      const content = response.text

      // 9. 解析 JSON
      let planData: Record<string, unknown>
      try {
        planData = safeJsonParse(content) as Record<string, unknown>
      } catch {
        // 尝试提取 JSON
        const firstBrace = content.indexOf('{')
        const lastBrace = content.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          try {
            planData = safeJsonParse(content.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>
          } catch {
            lastError = 'LLM 返回的 JSON 格式无法解析'
            continue
          }
        } else {
          lastError = 'LLM 返回内容中未找到 JSON'
          continue
        }
      }

      // 10. Schema 校验
      const validation = validatePlanJson(planData)
      if (!validation.valid) {
        lastError = `数据校验失败: ${validation.errors.join('; ')}`
        continue
      }

      // 11. 清理和补全数据
      const sanitized = sanitizePlanData(planData)
      sanitized.aiGenerated = true
      sanitized.aiGeneratedAt = new Date().toISOString()

      // 12. 保存到数据库
      const savedPlan = await prisma.plan.create({
        data: {
          userId: user.id,
          name: (sanitized.name as string) || body.destinations[0] + '旅行计划',
          status: 'draft',
          startDate: sanitized.startDate as string,
          endDate: sanitized.endDate as string,
          data: JSON.stringify(sanitized)
        }
      })

      // 13. 返回结果
      return NextResponse.json({
        plan: {
          id: savedPlan.id,
          name: savedPlan.name,
          status: savedPlan.status,
          startDate: savedPlan.startDate,
          endDate: savedPlan.endDate,
          data: sanitized
        }
      })

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误'

      if (errorMsg.includes('超时')) {
        lastError = 'LLM API 请求超时，请稍后重试'
        continue
      }
      if (errorMsg.includes('频率')) {
        lastError = 'API 调用频率超限，请稍后重试'
        continue
      }

      console.error('[AI generate-plan] 请求异常:', errorMsg)
      lastError = errorMsg
      continue
    }
  }

  // 所有重试都失败
  return NextResponse.json(
    { error: `AI 生成失败: ${lastError}` },
    { status: 500 }
  )
}
