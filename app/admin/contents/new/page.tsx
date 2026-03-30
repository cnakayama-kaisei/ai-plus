'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

function toApiDateTime(value: string) {
  if (!value) return null
  return new Date(value).toISOString()
}

export default function NewContentPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    type: 'text',
    video_url: '',
    status: 'draft',
    published_at: '',
    category_id: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/contents')
      const data = await response.json()

      if (response.ok && data.success) {
        setCategories(data.categories || [])
        if (data.categories.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: data.categories[0].id }))
        }
      }
    } catch (err) {
      console.error('Fetch categories error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          body: formData.body || null,
          video_url: formData.video_url || null,
          published_at: toApiDateTime(formData.published_at),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/admin/contents')
      } else {
        setError(data.message || 'コンテンツの作成に失敗しました')
      }
    } catch (err) {
      console.error('Create content error:', err)
      setError('コンテンツの作成中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">コンテンツ作成</h1>
              <p className="text-sm text-gray-600">新しいコンテンツを作成します</p>
            </div>
            <Link
              href="/admin/contents"
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-vertical"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Body */}
              <div className="mb-6">
                <label
                  htmlFor="body"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  本文
                </label>
                <textarea
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  rows={10}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-vertical"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  テキストコンテンツの場合は本文を入力してください
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Type */}
                <div>
                  <label
                    htmlFor="type"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    タイプ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="text">テキスト</option>
                    <option value="video">動画</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category_id"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    カテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    disabled={isSubmitting}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Video URL */}
              <div className="mb-6">
                <label
                  htmlFor="video_url"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  動画URL
                </label>
                <input
                  id="video_url"
                  name="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://youtu.be/VIDEO_ID または https://example.com/video.mp4"
                  disabled={isSubmitting}
                />
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    対応している動画URL形式:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                    <li>
                      <strong>YouTube:</strong> https://youtu.be/VIDEO_ID （共有URLを推奨）
                    </li>
                    <li>
                      <strong>YouTube:</strong> https://www.youtube.com/watch?v=VIDEO_ID
                    </li>
                    <li>
                      <strong>Vimeo:</strong> https://vimeo.com/VIDEO_ID
                    </li>
                    <li>
                      <strong>直リンク:</strong> https://example.com/video.mp4 (.mp4, .mov, .webm)
                    </li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    Google DriveやDropboxのURLは直接再生できません。YouTubeまたはVimeoへのアップロードを推奨します。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    ステータス <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                  </select>
                </div>

                {/* Published At */}
                <div>
                  <label
                    htmlFor="published_at"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    公開日
                  </label>
                  <input
                    id="published_at"
                    name="published_at"
                    type="datetime-local"
                    value={formData.published_at}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '作成中...' : '作成'}
                </button>
                <Link
                  href="/admin/contents"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:shadow-outline text-center"
                >
                  キャンセル
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
