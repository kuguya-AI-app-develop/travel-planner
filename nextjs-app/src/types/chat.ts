export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface ApiConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  model: string
  apiKey: string
  baseUrl?: string
}

export type ChatStatus = 'idle' | 'loading' | 'error'

export interface ChatApiResponse {
  text?: string
  error?: string
}

export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: { role: string; content: string }
    finish_reason: string
  }>
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export interface AnthropicResponse {
  id: string
  type: string
  role: string
  content: Array<{ type: string; text: string }>
  model: string
  stop_reason: string
  usage: { input_tokens: number; output_tokens: number }
}
