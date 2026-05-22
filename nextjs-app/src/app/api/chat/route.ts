import { NextRequest, NextResponse } from 'next/server'
import { validateBaseUrl, validateModelName, checkRateLimit } from '@/lib/ai/validation'
import { getUserFromRequest } from '@/lib/auth'
import type { OpenAIResponse, AnthropicResponse } from '@/types/chat'

const SYSTEM_PROMPT = '你是一个可爱的柯基旅行助手，名叫柯基小助手。你擅长帮助用户规划旅行，提供旅行建议。请用友好、活泼的语气回答问题。'

// 速率限制：每用户每分钟最多 20 条
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 1000

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface RequestBody {
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
  messages: ChatMessage[]
}

// 合并连续同角色消息（Anthropic 要求 user/assistant 严格交替）
function mergeConsecutiveMessages(messages: ChatMessage[]): ChatMessage[] {
  const merged: ChatMessage[] = []
  for (const msg of messages) {
    const last = merged[merged.length - 1]
    if (last && last.role === msg.role) {
      last.content += '\n\n' + msg.content
    } else {
      merged.push({ ...msg })
    }
  }
  return merged
}

function buildOpenAICompatibleRequest(body: RequestBody) {
  const { model, messages } = body
  return {
    model,
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.filter(m => m.role !== 'system')
    ],
    stream: false
  }
}

function buildAnthropicRequest(body: RequestBody) {
  const { model, messages } = body
  const nonSystemMessages = messages.filter(m => m.role !== 'system')
  const merged = mergeConsecutiveMessages(nonSystemMessages)
  return {
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: merged.map(m => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content
    }))
  }
}

function getApiUrl(provider: string, baseUrl?: string): string {
  // 如果有自定义 baseUrl，优先使用
  if (baseUrl) return baseUrl

  // 各提供商的默认 API 地址
  const defaultUrls: Record<string, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    moonshot: 'https://api.moonshot.cn/v1/chat/completions',
    zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    baichuan: 'https://api.baichuan-ai.com/v1/chat/completions',
  }

  return defaultUrls[provider] || ''
}

function buildHeaders(provider: string, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`
  }
  return headers
}

function extractResponseText(provider: string, data: OpenAIResponse | AnthropicResponse): string {
  if (provider === 'anthropic') {
    const anthropicData = data as AnthropicResponse
    return anthropicData.content?.[0]?.text || '抱歉，我没能理解你的问题。'
  }
  const openaiData = data as OpenAIResponse
  return openaiData.choices?.[0]?.message?.content || '抱歉，我没能理解你的问题。'
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

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式无效' }, { status: 400 })
  }

  const { provider, model, apiKey, baseUrl, messages } = body

  if (!apiKey || !model || !messages?.length) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
  }

  // 校验 Base URL（防 SSRF）
  if (baseUrl) {
    const urlCheck = validateBaseUrl(baseUrl)
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 })
    }
  }

  // 校验模型名称
  const modelCheck = validateModelName(model)
  if (!modelCheck.valid) {
    return NextResponse.json({ error: modelCheck.error }, { status: 400 })
  }

  const url = getApiUrl(provider, baseUrl)
  if (!url) {
    return NextResponse.json({ error: '缺少 API 地址' }, { status: 400 })
  }

  const headers = buildHeaders(provider, apiKey)
  const requestBody = provider === 'anthropic'
    ? buildAnthropicRequest(body)
    : buildOpenAICompatibleRequest(body)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error(`[Chat API] 上游返回 ${response.status}:`, errorText.slice(0, 300))

      if (response.status === 401) {
        return NextResponse.json({ error: 'API Key 无效' }, { status: 401 })
      }
      if (response.status === 403) {
        return NextResponse.json({ error: 'API Key 无权限' }, { status: 403 })
      }
      if (response.status === 429) {
        return NextResponse.json({ error: '上游 API 频率超限，请稍后重试' }, { status: 429 })
      }
      return NextResponse.json(
        { error: `上游 API 返回错误 (${response.status})` },
        { status: 502 }
      )
    }

    const data: OpenAIResponse | AnthropicResponse = await response.json()
    const text = extractResponseText(provider, data)
    return NextResponse.json({ text })
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: '请求超时，请稍后重试' }, { status: 504 })
    }
    console.error('[Chat API] 网络错误:', err)
    return NextResponse.json({ error: '网络错误，请检查 API 配置' }, { status: 502 })
  }
}
