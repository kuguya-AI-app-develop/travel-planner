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

export interface ChatBotProps {
  avatarUrl?: string
}

export type ChatStatus = 'idle' | 'loading' | 'error'
