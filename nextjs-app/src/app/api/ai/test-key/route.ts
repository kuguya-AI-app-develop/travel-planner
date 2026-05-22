import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { validateBaseUrl, validateModelName } from '@/lib/ai/validation'
import { testApiConnection, type AiServiceConfig } from '@/lib/ai/service'

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 支持请求头和请求体两种方式
  let config: AiServiceConfig

  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    // 从请求体读取
    try {
      const body = await request.json()
      config = {
        apiKey: body.apiKey || request.headers.get('X-Api-Key') || '',
        baseUrl: body.baseUrl || request.headers.get('X-Api-Base-Url') || '',
        model: body.model || request.headers.get('X-Model') || '',
        provider: body.provider || 'openai'
      }
    } catch {
      // fallback到请求头
      config = {
        apiKey: request.headers.get('X-Api-Key') || '',
        baseUrl: request.headers.get('X-Api-Base-Url') || '',
        model: request.headers.get('X-Model') || '',
        provider: 'openai'
      }
    }
  } else {
    // 从请求头读取
    config = {
      apiKey: request.headers.get('X-Api-Key') || '',
      baseUrl: request.headers.get('X-Api-Base-Url') || '',
      model: request.headers.get('X-Model') || '',
      provider: 'openai'
    }
  }

  if (!config.apiKey) {
    return NextResponse.json({ error: '缺少 API Key' }, { status: 400 })
  }

  // 校验
  const urlCheck = validateBaseUrl(config.baseUrl || '')
  if (!urlCheck.valid) {
    return NextResponse.json({ error: urlCheck.error }, { status: 400 })
  }

  const modelCheck = validateModelName(config.model || '')
  if (!modelCheck.valid) {
    return NextResponse.json({ error: modelCheck.error }, { status: 400 })
  }

  try {
    const ok = await testApiConnection(config)
    if (ok) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: '连接失败' }, { status: 502 })
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

    console.error('[AI test-key] 错误:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 502 })
  }
}
