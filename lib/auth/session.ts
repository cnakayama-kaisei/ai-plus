import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isActiveContract } from '@/lib/db/users'
import { JWTPayload } from '@/types/auth'
import { verifyToken } from './jwt'

async function getPayloadFromCookie(cookieName: string): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(cookieName)?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function getStudentSession(): Promise<JWTPayload | null> {
  const payload = await getPayloadFromCookie('student_auth_token')

  if (!payload || payload.role !== 'student' || !isActiveContract(payload.contractStatus)) {
    return null
  }

  return payload
}

export async function getAdminSession(): Promise<JWTPayload | null> {
  const payload = await getPayloadFromCookie('admin_auth_token')

  if (!payload || payload.role !== 'admin') {
    return null
  }

  return payload
}

export async function requireStudentPageSession(): Promise<JWTPayload> {
  const payload = await getStudentSession()

  if (!payload) {
    redirect('/login')
  }

  return payload
}

export async function requireAdminPageSession(): Promise<JWTPayload> {
  const payload = await getAdminSession()

  if (!payload) {
    redirect('/admin/login')
  }

  return payload
}
