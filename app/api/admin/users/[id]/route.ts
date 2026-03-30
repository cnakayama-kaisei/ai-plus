import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { updateUserContractStatus } from '@/lib/db/users'

/**
 * PATCH /api/admin/users/[id] - Update user contract status
 */
export async function PATCH(
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

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '認証トークンが無効です' },
        { status: 401 }
      )
    }

    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    // Get user ID from params
    const { id } = await params

    // Parse request body
    const body = await request.json()
    const { contract_status } = body

    // Validate contract_status
    const validStatuses = ['active', 'suspended']
    if (!contract_status || !validStatuses.includes(contract_status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ステータスは active または suspended のいずれかを指定してください',
        },
        { status: 400 }
      )
    }

    // Update contract status
    const user = await updateUserContractStatus(id, contract_status)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        student_id: user.student_id,
        name: user.name,
        role: user.role,
        contract_status: user.contract_status,
        created_at: user.created_at,
      },
    })
  } catch (error: unknown) {
    console.error('Error updating user contract status:', error)

    // Check for record not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: '契約ステータスの更新に失敗しました' },
      { status: 500 }
    )
  }
}
