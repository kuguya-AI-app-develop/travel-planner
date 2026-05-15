import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  return NextResponse.json({ user })
}
