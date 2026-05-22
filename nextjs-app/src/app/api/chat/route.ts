import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { validateBaseUrl, validateModelName, checkRateLimit } from '@/lib/ai/validation'
import { callAiService, type AiServiceConfig, type AiMessage } from '@/lib/ai/service'

// 速率限制：每用户每分钟最多 20 条
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 1000

const SYSTEM_PROMPT = '你是一个可爱的柯基旅行助手，名叫柯基小助手。你擅长帮助用户规划旅行，提供旅行建议。请用友好、活泼的语气回答问题。'

interface RequestBody {
  provider?: string
  model?: string
  apiKey: string
  baseUrl?: string
  messages: AiMessage[]
}

export async function POST(request: NextRequest) {
  // 鉴权
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 速率限制
  const rateKey = `chat:${user.id}`
  const rateResult = checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rateResult.allowed) {
    const retryAfterSec = Math.ceil((rateResult.retryAfterMs ?? 0) / 1000)
    return NextResponse.json(
      { error: `请求过于频繁，请 ${retryAfterSec} 秒后重试` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    )
  }

  // 解析请求体
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式无效' }, { status: 400 })
  }

  const { provider, model, apiKey, baseUrl, messages } = body

  if (!apiKey || !messages?.length) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  // 校验
  if (baseUrl) {
    const urlCheck = validateBaseUrl(baseUrl)
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 })
    }
  }

  if (model) {
    const modelCheck = validateModelName(model)
    if (!modelCheck.valid) {
      return NextResponse.json({ error: modelCheck.error }, { status: 400 })
    }
  }

  // 构建配置
  const config: AiServiceConfig = {
    apiKey,
    baseUrl,
    model,
    provider: provider || 'openai'
  }

  // 添加system prompt
  const fullMessages: AiMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.filter(m => m.role !== 'system')
  ]

  try {
    const response = await callAiService(config, fullMessages, {
      timeout: 60000
    })

    return NextResponse.json({ text: response.text })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '未知错误'

    if (errorMsg.includes('API Key')) {
      return NextResponse.json({ error: errorMsg }, { status: 401 })
    }
    if (errorMsg.includes('无权限')) {
      return NextResponse.json({ error: errorMsg }, { status: 403 })
    }
    if (errorMsg.includes('不存在')) {
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }
    if (errorMsg.includes('频率')) {
      return NextResponse.json({ error: errorMsg }, { status: 429 })
    }
    if (errorMsg.includes('超时')) {
      return NextResponse.json({ error: errorMsg }, { status: 504 })
    }

    console.error('[Chat API] 错误:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 502 })
  }
}
