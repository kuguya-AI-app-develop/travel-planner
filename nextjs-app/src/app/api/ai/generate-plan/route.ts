import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { buildSystemPrompt, buildUserPrompt, type AiPlanRequest } from '@/lib/ai/prompt'
import { validatePlanJson, sanitizePlanData } from '@/lib/ai/schema'

// 最大重试次数
const MAX_RETRIES = 2

export async function POST(request: NextRequest) {
  // 1. 鉴权
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 2. 读取 API Key（从请求头）
  const apiKey = request.headers.get('X-Api-Key')
  if (!apiKey) {
    return NextResponse.json({ error: '缺少 API Key，请在设置中配置' }, { status: 400 })
  }

  // 3. 读取可选的 Base URL 和模型名称
  const baseUrl = request.headers.get('X-Api-Base-Url') || 'https://api.openai.com/v1'
  const model = request.headers.get('X-Model') || 'gpt-4o-mini'

  // 4. 读取用户需求
  let body: AiPlanRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  // 5. 校验必填字段
  if (!body.destination?.trim()) {
    return NextResponse.json({ error: '目的地不能为空' }, { status: 400 })
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

  // 6. 构造 Prompt
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(body)

  // 7. 调用 LLM API（带重试）
  let lastError: string = ''
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const llmResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 8000,
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(120000) // 2 分钟超时
      })

      if (!llmResponse.ok) {
        const errorText = await llmResponse.text().catch(() => '未知错误')
        if (llmResponse.status === 401) {
          return NextResponse.json({ error: 'API Key 无效，请检查设置' }, { status: 401 })
        }
        if (llmResponse.status === 429) {
          lastError = 'API 调用频率超限，请稍后重试'
          continue
        }
        return NextResponse.json(
          { error: `LLM API 错误 (${llmResponse.status}): ${errorText}` },
          { status: 502 }
        )
      }

      const llmData = await llmResponse.json()
      const content = llmData.choices?.[0]?.message?.content

      if (!content) {
        lastError = 'LLM 返回内容为空'
        continue
      }

      // 8. 解析 JSON
      let planData: Record<string, unknown>
      try {
        // 尝试直接解析
        planData = JSON.parse(content)
      } catch {
        // 尝试提取 JSON（处理 LLM 可能包裹 markdown 的情况）
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            planData = JSON.parse(jsonMatch[0])
          } catch {
            lastError = 'LLM 返回的 JSON 格式无法解析'
            continue
          }
        } else {
          lastError = 'LLM 返回内容中未找到 JSON'
          continue
        }
      }

      // 9. Schema 校验
      const validation = validatePlanJson(planData)
      if (!validation.valid) {
        lastError = `数据校验失败: ${validation.errors.join('; ')}`
        // 校验失败也继续重试
        continue
      }

      // 10. 清理和补全数据
      const sanitized = sanitizePlanData(planData)

      // 11. 保存到数据库
      const savedPlan = await prisma.plan.create({
        data: {
          userId: user.id,
          name: (sanitized.name as string) || body.destination + '旅行计划',
          status: 'draft',
          startDate: sanitized.startDate as string,
          endDate: sanitized.endDate as string,
          data: JSON.stringify(sanitized)
        }
      })

      // 12. 返回结果
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
      if (err instanceof Error && err.name === 'TimeoutError') {
        lastError = 'LLM API 请求超时，请稍后重试'
        continue
      }
      lastError = `请求异常: ${err instanceof Error ? err.message : '未知错误'}`
      continue
    }
  }

  // 所有重试都失败
  return NextResponse.json(
    { error: `AI 生成失败: ${lastError}` },
    { status: 500 }
  )
}
