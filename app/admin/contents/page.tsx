'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Content {
  id: string
  title: string
  description: string
  type: string
  status: string
  published_at: Date | null
  category: {
    id: string
    name: string
  }
  created_at: Date
}

export default function AdminContentsPage() {
  const router = useRouter()
  const [contents, setContents] = useState<Content[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchContents = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const url =
        statusFilter === 'all'
          ? '/api/admin/contents'
          : `/api/admin/contents?status=${statusFilter}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.status === 403) {
        router.push('/admin/login')
        return
      }

      if (response.ok && data.success) {
        setContents(data.contents || [])
      } else {
        setError(data.message || 'コンテンツの取得に失敗しました')
      }
    } catch (err) {
      console.error('Fetch contents error:', err)
      setError('コンテンツの取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [router, statusFilter])

  useEffect(() => {
    fetchContents()
  }, [fetchContents])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return '動画'
      case 'text':
        return 'テキスト'
      case 'audio':
        return '音声'
      case 'pdf':
        return 'PDF'
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
          公開中
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded">
        下書き
      </span>
    )
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AIプラス CMS</h1>
              <p className="text-sm text-gray-600">コンテンツ管理</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">絞り込み:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="published">公開中</option>
              <option value="draft">下書き</option>
            </select>
          </div>

          <Link
            href="/admin/contents/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            新規作成
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">コンテンツがありません</p>
            <Link
              href="/admin/contents/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              最初のコンテンツを作成
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公開日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contents.map((content) => (
                  <tr key={content.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {content.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {content.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{content.category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTypeLabel(content.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(content.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(content.published_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/contents/${content.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
