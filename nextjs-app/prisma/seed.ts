import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db'
})

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      status: 'active',
      note: '默认管理员'
    }
  })

  const demoPassword = await bcrypt.hash('demo123', 10)
  await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      password: demoPassword,
      role: 'user',
      status: 'active',
      note: '演示账号'
    }
  })

  console.log('Default accounts created:')
  console.log('  admin / admin123 (管理员)')
  console.log('  demo  / demo123  (普通用户)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
