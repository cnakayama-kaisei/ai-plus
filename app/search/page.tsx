import SearchPageClient from '@/components/search/SearchPageClient'
import { requireStudentPageSession } from '@/lib/auth/session'

export default async function SearchPage() {
  await requireStudentPageSession()

  return <SearchPageClient />
}
