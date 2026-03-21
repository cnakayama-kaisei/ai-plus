import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

// Note: In seed.ts, we create a new PrismaClient instance
// because this runs outside the Next.js application context
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // パスワードをハッシュ化
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  // 管理者: システム管理用
  const admin = await prisma.user.upsert({
    where: { student_id: 'ADMIN001' },
    update: {},
    create: {
      student_id: 'ADMIN001',
      name: '管理者',
      password_hash: hashedPassword,
      role: 'admin',
      contract_status: 'active',
    },
  })
  console.log('Created admin:', admin.student_id, '-', admin.name, '(admin)')

  // 受講生1: ログイン成功（active）
  const user1 = await prisma.user.upsert({
    where: { student_id: 'STU001' },
    update: {},
    create: {
      student_id: 'STU001',
      name: '山田太郎',
      password_hash: hashedPassword,
      role: 'student',
      contract_status: 'active',
    },
  })
  console.log('Created user:', user1.student_id, '-', user1.name, '(student, active)')

  // 受講生2: ログイン失敗（expired）
  const user2 = await prisma.user.upsert({
    where: { student_id: 'STU002' },
    update: {},
    create: {
      student_id: 'STU002',
      name: '佐藤花子',
      password_hash: hashedPassword,
      role: 'student',
      contract_status: 'expired',
    },
  })
  console.log('Created user:', user2.student_id, '-', user2.name, '(student, expired)')

  // カテゴリ作成
  const category1 = await prisma.category.upsert({
    where: { id: 'cat-001' },
    update: {},
    create: {
      id: 'cat-001',
      name: 'キャリア戦略',
      sort_order: 1,
    },
  })
  console.log('Created category:', category1.name)

  const category2 = await prisma.category.upsert({
    where: { id: 'cat-002' },
    update: {},
    create: {
      id: 'cat-002',
      name: '面接対策',
      sort_order: 2,
    },
  })
  console.log('Created category:', category2.name)

  const category3 = await prisma.category.upsert({
    where: { id: 'cat-003' },
    update: {},
    create: {
      id: 'cat-003',
      name: '職務経歴書',
      sort_order: 3,
    },
  })
  console.log('Created category:', category3.name)

  // コンテンツ作成（公開済み5件）
  const content1 = await prisma.content.upsert({
    where: { id: 'content-001' },
    update: {},
    create: {
      id: 'content-001',
      title: 'キャリア設計の基本',
      description: '長期的なキャリアプランを立てるための基礎知識を学びます',
      body: 'キャリア設計は人生の重要な要素です。このコンテンツでは、自己分析から始まり、目標設定、アクションプランの立て方までを体系的に学びます。',
      type: 'video',
      video_url: 'https://example.com/videos/career-basics.mp4',
      status: 'published',
      published_at: new Date('2024-01-15'),
      category_id: category1.id,
    },
  })
  console.log('Created content:', content1.title, `(${content1.type})`)

  const content2 = await prisma.content.upsert({
    where: { id: 'content-002' },
    update: {},
    create: {
      id: 'content-002',
      title: '効果的な自己PRの作り方',
      description: '面接官に響く自己PRの構成と実践的なテクニックを解説します',
      body: '自己PRは面接の要です。STARメソッド（Situation, Task, Action, Result）を使った効果的な自己PRの作り方を、実例とともに詳しく解説します。',
      type: 'text',
      video_url: null,
      status: 'published',
      published_at: new Date('2024-01-20'),
      category_id: category2.id,
    },
  })
  console.log('Created content:', content2.title, `(${content2.type})`)

  const content3 = await prisma.content.upsert({
    where: { id: 'content-003' },
    update: {},
    create: {
      id: 'content-003',
      title: '職務経歴書の書き方完全ガイド',
      description: '採用担当者に選ばれる職務経歴書の作成方法を徹底解説',
      body: '職務経歴書は、実績と再現性を読み手に伝える資料です。成果を数字で示し、役割と行動を具体化すると評価されやすくなります。',
      type: 'text',
      video_url: null,
      status: 'published',
      published_at: new Date('2024-01-25'),
      category_id: category3.id,
    },
  })
  console.log('Created content:', content3.title, `(${content3.type})`)

  const content4 = await prisma.content.upsert({
    where: { id: 'content-004' },
    update: {},
    create: {
      id: 'content-004',
      title: '面接での質問対策',
      description: 'よくある面接質問への回答例と対策のポイント',
      body: '「あなたの強みは？」「なぜ当社を志望したのですか？」など、面接でよく聞かれる質問への効果的な回答方法を学びます。',
      type: 'video',
      video_url: 'https://example.com/videos/interview-questions.mp4',
      status: 'published',
      published_at: new Date('2024-02-01'),
      category_id: category2.id,
    },
  })
  console.log('Created content:', content4.title, `(${content4.type})`)

  const content5 = await prisma.content.upsert({
    where: { id: 'content-005' },
    update: {},
    create: {
      id: 'content-005',
      title: '転職市場の最新トレンド2024',
      description: '2024年の転職市場の動向と求められるスキルセット',
      body: '2024年の転職市場は大きく変化しています。AIやDXの進展により、求められるスキルも変わってきました。このビデオでは最新のトレンドを分析します。',
      type: 'video',
      video_url: 'https://example.com/videos/market-trends-2024.mp4',
      status: 'published',
      published_at: new Date('2024-02-05'),
      category_id: category1.id,
    },
  })
  console.log('Created content:', content5.title, `(${content5.type})`)

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
