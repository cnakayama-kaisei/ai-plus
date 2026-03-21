import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { getContentByIdForAdmin, updateContent } from '@/lib/db/contents'
import { z } from 'zod'

// Validation schema for content update
const updateContentSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').optional(),
  description: z.string().min(1, '説明を入力してください').optional(),
  body: z.string().optional().nullable(),
  type: z.enum(['video', 'text']).optional(),
  video_url: z.string().url('有効なURLを入力してください').optional().nullable().or(z.literal('')),
  status: z.enum(['draft', 'published']).optional(),
  published_at: z.string().optional().nullable(),
  category_id: z.string().optional(),
})

/**
 * GET - Get single content by ID (for editing)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const content = await getContentByIdForAdmin(id)

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'コンテンツが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      content,
    })
  } catch (error) {
    console.error('Admin get content error:', error)
    return NextResponse.json(
      { success: false, message: 'コンテンツの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update content
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const validationResult = updateContentSchema.safeParse(body)

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
    const { id } = await params

    // Update content
    const content = await updateContent(id, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.body !== undefined && { body: data.body || null }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.video_url !== undefined && { video_url: data.video_url || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.published_at !== undefined && {
        published_at: data.published_at ? new Date(data.published_at) : null,
      }),
      ...(data.category_id !== undefined && { category_id: data.category_id }),
    })

    return NextResponse.json({
      success: true,
      content,
    })
  } catch (error) {
    console.error('Admin update content error:', error)
    return NextResponse.json(
      { success: false, message: 'コンテンツの更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
