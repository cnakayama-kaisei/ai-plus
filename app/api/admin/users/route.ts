import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { createStudent, getStudents } from '@/lib/db/users'
import { generateSecurePassword } from '@/lib/auth/password-generator'
import { hashPassword } from '@/lib/auth/password'

/**
 * POST /api/admin/users - Create a new student account
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

    // Parse request body
    const body = await request.json()
    const { student_id, name, contract_status } = body

    // Validate student_id
    if (!student_id || typeof student_id !== 'string' || student_id.trim() === '') {
      return NextResponse.json(
        { success: false, message: '生徒IDは必須です' },
        { status: 400 }
      )
    }

    // Generate password
    const plainPassword = generateSecurePassword()
    const passwordHash = await hashPassword(plainPassword)

    // Create student
    const user = await createStudent({
      studentId: student_id.trim(),
      name: name?.trim(),
      passwordHash,
      contractStatus: contract_status || 'active',
    })

    // Return created user with plain password (only shown once)
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
      password: plainPassword, // Only returned once on creation
    })
  } catch (error: unknown) {
    console.error('Error creating student:', error)

    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'この生徒IDは既に使用されています' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: '生徒アカウントの作成に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/users - List/search student accounts
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

    // Get query parameter for search
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || undefined

    // Fetch students
    const students = await getStudents(query)

    return NextResponse.json({
      success: true,
      users: students,
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, message: '生徒一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
