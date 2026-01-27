import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // パスワードをハッシュ化
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  // 受講生1: ログイン成功（active）
  const user1 = await prisma.user.upsert({
    where: { student_id: 'STU001' },
    update: {},
    create: {
      student_id: 'STU001',
      name: '山田太郎',
      password_hash: hashedPassword,
      contract_status: 'active',
    },
  })
  console.log('Created user:', user1.student_id, '-', user1.name, '(active)')

  // 受講生2: ログイン失敗（expired）
  const user2 = await prisma.user.upsert({
    where: { student_id: 'STU002' },
    update: {},
    create: {
      student_id: 'STU002',
      name: '佐藤花子',
      password_hash: hashedPassword,
      contract_status: 'expired',
    },
  })
  console.log('Created user:', user2.student_id, '-', user2.name, '(expired)')

  console.log('Seed complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
