import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies, headers } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string }
  } catch {
    return null
  }
}

export async function getUserFromRequest() {
  const headerStore = await headers()
  const authHeader = headerStore.get('authorization')
  let token: string | undefined

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    const cookieStore = await cookies()
    token = cookieStore.get('token')?.value
  }

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, role: true, status: true }
  })

  if (!user || user.status !== 'active') return null
  return user
}
