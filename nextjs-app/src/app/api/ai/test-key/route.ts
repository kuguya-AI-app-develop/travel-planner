import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { validateBaseUrl, validateModelName } from '@/lib/ai/validation'

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const apiKey = request.headers.get('X-Api-Key')
  if (!apiKey) {
    return NextResponse.json({ error: '缺少 API Key' }, { status: 400 })
  }

  const rawBaseUrl = request.headers.get('X-Api-Base-Url') || ''
  const rawModel = request.headers.get('X-Model') || ''

  const urlCheck = validateBaseUrl(rawBaseUrl)
  if (!urlCheck.valid) {
    return NextResponse.json({ error: urlCheck.error }, { status: 400 })
  }

  const modelCheck = validateModelName(rawModel)
  if (!modelCheck.valid) {
    return NextResponse.json({ error: modelCheck.error }, { status: 400 })
  }

  const baseUrl = rawBaseUrl || 'https://api.openai.com/v1'
  const model = rawModel || 'gpt-4o-mini'

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(15000)
    })

    if (res.ok) {
      return NextResponse.json({ ok: true })
    }

    const errorText = await res.text().catch(() => '')
    if (res.status === 401) {
      return NextResponse.json({ error: 'API Key 无效' }, { status: 401 })
    }
    if (res.status === 403) {
      return NextResponse.json({ error: 'API Key 无权限访问该模型' }, { status: 403 })
    }
    if (res.status === 404) {
      return NextResponse.json({ error: '模型不存在，请检查模型名称' }, { status: 404 })
    }
    if (res.status === 429) {
      return NextResponse.json({ error: 'API 调用频率超限' }, { status: 429 })
    }
    console.error(`[AI test-key] 上游 API 返回 ${res.status}:`, errorText.slice(0, 200))
    return NextResponse.json(
      { error: `API 返回错误 (${res.status})，请检查配置` },
      { status: 502 }
    )
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: '连接超时，请检查 Base URL' }, { status: 504 })
    }
    console.error('[AI test-key] 网络错误:', err)
    return NextResponse.json(
      { error: '网络错误，请检查 Base URL 是否正确' },
      { status: 502 }
    )
  }
}
