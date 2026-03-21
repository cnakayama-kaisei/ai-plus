import { NextRequest, NextResponse } from 'next/server'
import { getStudentSession } from '@/lib/auth/session'
import { searchPublishedContentsWithPagination } from '@/lib/db/contents'

export async function GET(request: NextRequest) {
  try {
    const session = await getStudentSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!query?.trim()) {
      return NextResponse.json(
        { success: false, message: '検索キーワードを入力してください' },
        { status: 400 }
      )
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: '無効なページネーションパラメータです' },
        { status: 400 }
      )
    }

    const result = await searchPublishedContentsWithPagination(query, page, limit)

    return NextResponse.json({
      success: true,
      results: result.contents,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { success: false, message: '検索中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
