'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const shouldHideHeader = pathname === '/' || pathname.startsWith('/admin')

  if (shouldHideHeader) {
    return null
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home" className="flex items-center space-x-3">
            <Image
              src="/brand/carridra/logo.png"
              alt="キャリドラ"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="text-xl font-bold text-gray-800">AIプラス</span>
          </Link>

          {pathname !== '/login' && (
            <nav>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ログアウト
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
