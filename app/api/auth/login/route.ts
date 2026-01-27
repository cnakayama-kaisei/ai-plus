import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByStudentId, isActiveContract } from '@/lib/db/users'
import { verifyPassword } from '@/lib/auth/password'
import { generateToken } from '@/lib/auth/jwt'
import { LoginResponse } from '@/types/auth'

// Validation schema for login request
const loginSchema = z.object({
  student_id: z.string().min(1, '生徒IDを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      const response: LoginResponse = {
        success: false,
        message: '入力内容を確認してください',
      }
      return NextResponse.json(response, { status: 400 })
    }

    const { student_id, password } = validationResult.data

    // Find user by student ID
    const user = await findUserByStudentId(student_id)

    if (!user) {
      const response: LoginResponse = {
        success: false,
        message: '生徒IDまたはパスワードが正しくありません',
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      const response: LoginResponse = {
        success: false,
        message: '生徒IDまたはパスワードが正しくありません',
      }
      return NextResponse.json(response, { status: 401 })
    }

    // Check contract status
    if (!isActiveContract(user.contract_status)) {
      let message = 'ログインできません'

      switch (user.contract_status) {
        case 'expired':
          message = '契約が終了しています。ログインできません。'
          break
        case 'cancelled':
          message = '契約がキャンセルされています。ログインできません。'
          break
        case 'suspended':
          message = 'アカウントが一時停止されています。ログインできません。'
          break
      }

      const response: LoginResponse = {
        success: false,
        message,
      }
      return NextResponse.json(response, { status: 403 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      studentId: user.student_id,
      name: user.name,
      contractStatus: user.contract_status as 'active',
    })

    // Create response
    const response: LoginResponse = {
      success: true,
      user: {
        id: user.id,
        student_id: user.student_id,
        name: user.name,
        contract_status: user.contract_status,
      },
    }

    // Set HTTP-only cookie with token
    const nextResponse = NextResponse.json(response, { status: 200 })
    nextResponse.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return nextResponse
  } catch (error) {
    console.error('Login error:', error)
    const response: LoginResponse = {
      success: false,
      message: 'ログイン処理中にエラーが発生しました',
    }
    return NextResponse.json(response, { status: 500 })
  }
}
