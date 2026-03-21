import Link from 'next/link'
import { requireStudentPageSession } from '@/lib/auth/session'
import { getLatestPublishedContents } from '@/lib/db/contents'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  await requireStudentPageSession()
  const contents = await getLatestPublishedContents(5)

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AIプラス受講生専用サイト
          </h1>
          <p className="text-gray-600">
            キャリドラAIプラスのコンテンツをご覧いただけます
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">新着コンテンツ</h2>
        </div>

        {contents.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600">
              現在、公開されているコンテンツはありません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
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
      </div>
    </div>
  )
}
