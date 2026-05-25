import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Debug: log response info
  console.log(`[API] ${options.method || 'GET'} ${API_URL}${endpoint} -> status: ${response.status}`)
  console.log(`[API] content-type: ${response.headers.get('content-type')}`)

  if (!response.ok) {
    const text = await response.text()
    console.log(`[API] error body (first 200 chars): ${text.slice(0, 200)}`)
    let errorMsg = '请求失败'
    try {
      const error = JSON.parse(text)
      errorMsg = error.error || errorMsg
    } catch {
      // response is not JSON
    }
    throw new Error(errorMsg || `HTTP ${response.status}`)
  }

  const text = await response.text()
  console.log(`[API] response body (first 200 chars): ${text.slice(0, 200)}`)
  return JSON.parse(text)
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}

export interface User {
  id: number
  username: string
  role: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface MeResponse {
  user: User
}
