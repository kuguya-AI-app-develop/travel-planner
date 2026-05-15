import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest, hashPassword } from '@/lib/auth'

async function requireAdmin() {
  const user = await getUserFromRequest()
  if (!user || user.role !== 'admin') return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, status: true, expireAt: true, note: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ users })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })

  const { username, password, role, expireAt, note } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: '请填写用户名和密码' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: '用户名已存在' }, { status: 409 })
  }

  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: { username, password: hashed, role: role || 'user', expireAt: expireAt || null, note: note || null }
  })

  return NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } })
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })

  const body = await request.json()
  const { id, action, ...data } = body

  if (!id) return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  if (action === 'toggle-status') {
    const newStatus = target.status === 'active' ? 'disabled' : 'active'
    await prisma.user.update({ where: { id }, data: { status: newStatus } })
    return NextResponse.json({ ok: true, status: newStatus })
  }

  if (action === 'reset-password') {
    if (!data.password || data.password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 })
    }
    const hashed = await hashPassword(data.password)
    await prisma.user.update({ where: { id }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
  }

  // General update
  const updateData: Record<string, unknown> = {}
  if (data.role !== undefined) updateData.role = data.role
  if (data.expireAt !== undefined) updateData.expireAt = data.expireAt
  if (data.note !== undefined) updateData.note = data.note
  if (data.status !== undefined) updateData.status = data.status

  await prisma.user.update({ where: { id }, data: updateData })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))

  if (!id) return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  // Check if this is the last admin
  if (target.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: '至少保留一个管理员账号' }, { status: 400 })
    }
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
