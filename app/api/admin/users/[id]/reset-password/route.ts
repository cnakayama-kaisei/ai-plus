import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { resetUserPassword } from '@/lib/db/users'
import { logAdminAction } from '@/lib/db/admin-logs'
import { generateSecurePasswordWithoutAmbiguous } from '@/lib/auth/password-generator'
import { hashPassword } from '@/lib/auth/password'

/**
 * POST /api/admin/users/[id]/reset-password - Reset user password
 */
export async function POST(
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

    // Generate new password (16 characters, without ambiguous characters)
    const newPassword = generateSecurePasswordWithoutAmbiguous(16)
    const newPasswordHash = await hashPassword(newPassword)

    // Update user password
    const user = await resetUserPassword(id, newPasswordHash)

    // Log admin action
    await logAdminAction(payload.userId, 'RESET_PASSWORD', id)

    return NextResponse.json({
      success: true,
      message: 'パスワードを再発行しました',
      newPassword, // Return plain password (only this once)
      user: {
        id: user.id,
        student_id: user.student_id,
        name: user.name,
      },
    })
  } catch (error: unknown) {
    console.error('Error resetting user password:', error)

    // Check for record not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'パスワードの再発行に失敗しました' },
      { status: 500 }
    )
  }
}
