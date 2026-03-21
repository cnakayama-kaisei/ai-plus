import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireStudentPageSession } from '@/lib/auth/session'
import { getContentById } from '@/lib/db/contents'
import VideoPlayer from '@/components/video/VideoPlayer'

interface ContentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ContentPage({ params }: ContentPageProps) {
  await requireStudentPageSession()
  const { id } = await params
  const content = await getContentById(id)

  if (!content) {
    notFound()
  }

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
      case 'audio':
        return '音声'
      case 'pdf':
        return 'PDF'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            href="/home"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            ホームに戻る
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded">
                {content.category.name}
              </span>
              <span className="text-sm text-gray-500">
                {getTypeLabel(content.type)}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {content.title}
            </h1>

            <div className="text-sm text-gray-500 mb-6">
              公開日: {formatDate(content.published_at)}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-lg text-gray-700 mb-6">
                {content.description}
              </p>

              {content.type === 'video' && content.video_url && (
                <VideoPlayer url={content.video_url} />
              )}

              {content.type === 'pdf' && (
                <div className="mb-6">
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 text-center">
                    <svg
                      className="w-12 h-12 text-yellow-600 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      PDF表示機能
                    </p>
                    <p className="text-sm text-gray-600">
                      PDFの表示機能は準備中です
                    </p>
                  </div>
                </div>
              )}

              {content.type === 'audio' && (
                <div className="mb-6">
                  <div className="bg-purple-50 border border-purple-300 rounded-lg p-6 text-center">
                    <svg
                      className="w-12 h-12 text-purple-600 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      音声再生機能
                    </p>
                    <p className="text-sm text-gray-600">
                      音声の再生機能は準備中です
                    </p>
                  </div>
                </div>
              )}

              {content.body && (
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    詳細内容
                  </h3>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {content.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
