import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { getAllContentsForAdmin, createContent, getAllCategories } from '@/lib/db/contents'
import { z } from 'zod'

// Validation schema for content creation
const createContentSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().min(1, '説明を入力してください'),
  body: z.string().optional().nullable(),
  type: z.enum(['video', 'text']),
  video_url: z.string().url('有効なURLを入力してください').optional().nullable().or(z.literal('')),
  status: z.enum(['draft', 'published']),
  published_at: z.string().optional().nullable(),
  category_id: z.string().min(1, 'カテゴリを選択してください'),
})

/**
 * GET - Get all contents for admin (with optional status filter)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: '認証が必要です（トークンなし）' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '認証トークンが無効です' },
        { status: 401 }
      )
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: '管理者権限がありません' },
        { status: 403 }
      )
    }

    // Get status filter from query params
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined

    // Fetch contents
    const contents = await getAllContentsForAdmin(status)

    // Fetch categories for filter
    const categories = await getAllCategories()

    return NextResponse.json({
      success: true,
      contents,
      categories,
    })
  } catch (error) {
    console.error('Admin get contents error:', error)
    return NextResponse.json(
      { success: false, message: 'コンテンツの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new content
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: '認証が必要です（トークンなし）' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '認証トークンが無効です' },
        { status: 401 }
      )
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: '管理者権限がありません' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createContentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: '入力内容を確認してください',
          errors: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create content
    const content = await createContent({
      title: data.title,
      description: data.description,
      body: data.body || null,
      type: data.type,
      video_url: data.video_url || null,
      status: data.status,
      published_at: data.published_at ? new Date(data.published_at) : null,
      category_id: data.category_id,
    })

    return NextResponse.json(
      {
        success: true,
        content,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin create content error:', error)
    return NextResponse.json(
      { success: false, message: 'コンテンツの作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
