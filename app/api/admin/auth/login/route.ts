import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByStudentId } from '@/lib/db/users'
import { verifyPassword } from '@/lib/auth/password'
import { generateToken } from '@/lib/auth/jwt'

// Validation schema for admin login
const loginSchema = z.object({
  student_id: z.string().min(1, 'IDを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: '入力内容を確認してください' },
        { status: 400 }
      )
    }

    const { student_id, password } = validationResult.data

    // Find user by student ID
    const user = await findUserByStudentId(student_id)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'IDまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'IDまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: '管理者権限がありません' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      studentId: user.student_id,
      name: user.name,
      role: user.role as 'admin',
      contractStatus: user.contract_status as 'active',
    })

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          student_id: user.student_id,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    )

    // Set HTTP-only cookie with token (admin-specific cookie name)
    response.cookies.set('admin_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
