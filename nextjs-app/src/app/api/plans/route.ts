import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const plans = await prisma.plan.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  })

  return NextResponse.json({ plans })
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await request.json()
  const plan = await prisma.plan.create({
    data: {
      userId: user.id,
      name: body.name || '新计划',
      status: body.status || 'draft',
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      data: body.data ? JSON.stringify(body.data) : null
    }
  })

  return NextResponse.json({ plan })
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: '缺少计划ID' }, { status: 400 })

  // Verify ownership
  const existing = await prisma.plan.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: '计划不存在' }, { status: 404 })

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.startDate !== undefined && { startDate: updates.startDate }),
      ...(updates.endDate !== undefined && { endDate: updates.endDate }),
      ...(updates.data !== undefined && { data: typeof updates.data === 'string' ? updates.data : JSON.stringify(updates.data) })
    }
  })

  return NextResponse.json({ plan })
}

export async function DELETE(request: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))

  if (!id) return NextResponse.json({ error: '缺少计划ID' }, { status: 400 })

  const existing = await prisma.plan.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: '计划不存在' }, { status: 404 })

  await prisma.plan.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
