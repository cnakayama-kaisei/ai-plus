import { redirect } from 'next/navigation'
import { getAdminSession, getStudentSession } from '@/lib/auth/session'

export default async function Home() {
  const [studentSession, adminSession] = await Promise.all([
    getStudentSession(),
    getAdminSession(),
  ])

  if (studentSession) {
    redirect('/home')
  }

  if (adminSession) {
    redirect('/admin/contents')
  }

  redirect('/login')
}
