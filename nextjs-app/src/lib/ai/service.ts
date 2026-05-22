/**
 * 统一AI服务层
 * 提供一致的API调用接口，支持多种AI提供商
 */

import type { OpenAIResponse, AnthropicResponse } from '@/types/chat'

// ============================================================
// 类型定义
// ============================================================

export interface AiServiceConfig {
  apiKey: string
  baseUrl?: string
  model?: string
  provider?: string
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

export interface AiCallOptions {
  temperature?: number
  maxTokens?: number
  responseFormat?: 'json' | 'text'
  timeout?: number
}

// ============================================================
// URL解析
// ============================================================

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  deepseek: 'deepseek-chat',
  qwen: 'qwen-turbo',
  moonshot: 'moonshot-v1-8k',
  zhipu: 'glm-4-flash',
  baichuan: 'Baichuan4',
}

const DEFAULT_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  moonshot: 'https://api.moonshot.cn/v1/chat/completions',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  baichuan: 'https://api.baichuan-ai.com/v1/chat/completions',
}

/**
 * 解析API URL，支持智能补全路径
 */
export function resolveApiUrl(provider: string = 'openai', baseUrl?: string): string {
  if (!baseUrl) {
    return DEFAULT_URLS[provider] || DEFAULT_URLS.openai
  }

  // 如果已包含完整路径，直接使用
  if (baseUrl.includes('/chat/completions') || baseUrl.includes('/messages')) {
    return baseUrl
  }

  // 根据提供商补全路径
  if (provider === 'anthropic') {
    return baseUrl.replace(/\/$/, '') + '/messages'
  }

  // 默认按OpenAI兼容格式处理
  return baseUrl.replace(/\/$/, '') + '/chat/completions'
}

// ============================================================
// 请求构建
// ============================================================

function buildOpenAIRequest(messages: AiMessage[], options: AiCallOptions = {}) {
  return {
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
    stream: false,
    ...(options.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
  }
}

function buildAnthropicRequest(messages: AiMessage[], options: AiCallOptions = {}) {
  // Anthropic要求user/assistant严格交替，合并连续同角色消息
  const merged = mergeConsecutiveMessages(messages)

  // 提取system消息
  const systemMessage = merged.find(m => m.role === 'system')
  const nonSystemMessages = merged.filter(m => m.role !== 'system')

  return {
    max_tokens: options.maxTokens ?? 2048,
    system: systemMessage?.content,
    messages: nonSystemMessages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content
    }))
  }
}

function mergeConsecutiveMessages(messages: AiMessage[]): AiMessage[] {
  const merged: AiMessage[] = []
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

function buildHeaders(provider: string = 'openai', apiKey: string): Record<string, string> {
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

// ============================================================
// 响应解析
// ============================================================

function extractResponseText(provider: string = 'openai', data: OpenAIResponse | AnthropicResponse): string {
  if (provider === 'anthropic') {
    const anthropicData = data as AnthropicResponse
    return anthropicData.content?.[0]?.text || ''
  }

  const openaiData = data as OpenAIResponse
  return openaiData.choices?.[0]?.message?.content || ''
}

function extractUsage(provider: string = 'openai', data: OpenAIResponse | AnthropicResponse): AiResponse['usage'] {
  if (provider === 'anthropic') {
    const anthropicData = data as AnthropicResponse
    if (anthropicData.usage) {
      return {
        promptTokens: anthropicData.usage.input_tokens,
        completionTokens: anthropicData.usage.output_tokens
      }
    }
  } else {
    const openaiData = data as OpenAIResponse
    if (openaiData.usage) {
      return {
        promptTokens: openaiData.usage.prompt_tokens,
        completionTokens: openaiData.usage.completion_tokens
      }
    }
  }
  return undefined
}

// ============================================================
// 主要服务函数
// ============================================================

/**
 * 统一的AI服务调用函数
 */
const MAX_RETRIES = 2
const RETRY_BASE_DELAY = 1000

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600)
}

export async function callAiService(
  config: AiServiceConfig,
  messages: AiMessage[],
  options: AiCallOptions = {}
): Promise<AiResponse> {
  const { apiKey, provider = 'openai' } = config
  const url = resolveApiUrl(config.provider, config.baseUrl)
  const model = config.model || DEFAULT_MODELS[provider] || 'gpt-4o-mini'

  if (!apiKey) {
    throw new Error('缺少 API Key')
  }

  if (!url) {
    throw new Error('无法解析 API URL')
  }

  // 构建请求体
  const callOptions = { ...options }
  if (provider === 'anthropic' && callOptions.responseFormat === 'json') {
    // Anthropic不支持response_format，在system消息中追加JSON指令
    const systemIdx = messages.findIndex(m => m.role === 'system')
    const jsonHint = '\n\n请以有效的JSON格式回复。'
    if (systemIdx >= 0) {
      messages = messages.map((m, i) =>
        i === systemIdx ? { ...m, content: m.content + jsonHint } : m
      )
    } else {
      messages = [{ role: 'system', content: '请以有效的JSON格式回复。' }, ...messages]
    }
    delete callOptions.responseFormat
  }

  let requestBody: Record<string, unknown>
  if (provider === 'anthropic') {
    const anthropicReq = buildAnthropicRequest(messages, callOptions)
    requestBody = { ...anthropicReq, model }
  } else {
    requestBody = {
      model,
      ...buildOpenAIRequest(messages, callOptions)
    }
  }

  const headers = buildHeaders(provider, apiKey)
  const timeout = options.timeout ?? 60000

  // 带指数退避的重试循环
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_BASE_DELAY * Math.pow(2, attempt - 1))
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(timeout)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error(`[AI Service] 上游返回 ${response.status}:`, errorText.slice(0, 300))

      // 可重试的状态码且还有重试次数
      if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
        console.warn(`[AI Service] 第 ${attempt + 1} 次重试，状态码 ${response.status}`)
        continue
      }

      if (response.status === 401) {
        throw new Error('API Key 无效')
      }
      if (response.status === 403) {
        throw new Error('API Key 无权限')
      }
      if (response.status === 404) {
        throw new Error('API 端点不存在，请检查 Base URL')
      }
      if (response.status === 429) {
        throw new Error('API 调用频率超限，请稍后重试')
      }
      throw new Error(`上游 API 返回错误 (${response.status})`)
    }

    // 解析响应
    const data: OpenAIResponse | AnthropicResponse = await response.json()
    const text = extractResponseText(provider, data)
    const usage = extractUsage(provider, data)

    if (!text) {
      throw new Error('AI 返回内容为空')
    }

    return { text, usage }
  }

  throw new Error('请求失败，已达最大重试次数')
}

/**
 * 测试API连接
 */
export async function testApiConnection(config: AiServiceConfig): Promise<boolean> {
  try {
    await callAiService(
      config,
      [{ role: 'user', content: 'Hi' }],
      { maxTokens: 5, timeout: 15000 }
    )
    return true
  } catch (err) {
    console.error('[AI Service] 连接测试失败:', err instanceof Error ? err.message : err)
    return false
  }
}
