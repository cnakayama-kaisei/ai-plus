'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  published_at: Date | null
  category: {
    id: string
    name: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function SearchPageClient() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return '動画'
      case 'text':
        return 'テキスト'
      default:
        return type
    }
  }

  const handleSearch = async (page: number = 1) => {
    if (!keyword.trim()) return

    setError('')
    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(keyword)}&page=${page}&limit=20`
      )
      const data = await response.json()

      if (response.ok && data.success) {
        setResults(data.results || [])
        setPagination(data.pagination)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError(data.message || '検索中にエラーが発生しました')
        setResults([])
        setPagination(null)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('検索中にエラーが発生しました')
      setResults([])
      setPagination(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(1)
  }

  const handlePrevPage = () => {
    if (pagination && pagination.page > 1) {
      handleSearch(pagination.page - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      handleSearch(pagination.page + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">コンテンツ検索</h1>
          <p className="text-gray-600">キーワードでコンテンツを検索できます</p>
        </div>

        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="検索キーワードを入力"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !keyword.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSearching ? '検索中...' : '検索'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {hasSearched && !isSearching && pagination && (
          <div className="mb-4">
            <p className="text-gray-600">
              {pagination.total > 0
                ? `${pagination.total}件の結果が見つかりました（${pagination.page}/${pagination.totalPages}ページ）`
                : '検索結果が見つかりませんでした'}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((content) => (
              <Link
                key={content.id}
                href={`/content/${content.id}`}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {content.category.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getTypeLabel(content.type)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {content.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {formatDate(content.published_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={pagination.page === 1 || isSearching}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              前へ
            </button>
            <span className="text-gray-700 font-medium">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pagination.page === pagination.totalPages || isSearching}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              次へ
            </button>
          </div>
        )}

        {hasSearched && !isSearching && results.length === 0 && !error && (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-600 mb-4">
              「{keyword}」に一致するコンテンツが見つかりませんでした
            </p>
            <p className="text-sm text-gray-500">
              別のキーワードで検索してみてください
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
