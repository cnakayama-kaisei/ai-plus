'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CreatedUser {
  id: string
  student_id: string
  name: string
  role: string
  contract_status: string
  password: string
}

export default function NewUserPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [contractStatus, setContractStatus] = useState('active')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId.trim(),
          name: name.trim() || undefined,
          role,
          contract_status: contractStatus,
        }),
      })

      const data = await response.json()

      if (response.status === 403) {
        router.push('/admin/login')
        return
      }

      if (response.ok && data.success) {
        setCreatedUser({
          id: data.user.id,
          student_id: data.user.student_id,
          name: data.user.name,
          role: data.user.role,
          contract_status: data.user.contract_status,
          password: data.password,
        })
      } else {
        setError(data.message || '生徒アカウントの作成に失敗しました')
      }
    } catch (err) {
      console.error('Create student error:', err)
      setError('生徒アカウントの作成中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPassword = async () => {
    if (createdUser) {
      try {
        await navigator.clipboard.writeText(createdUser.password)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy password:', err)
        alert('パスワードのコピーに失敗しました')
      }
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const handleContinueAdding = () => {
    setStudentId('')
    setName('')
    setRole('student')
    setContractStatus('active')
    setError('')
    setCopied(false)
    setCreatedUser(null)
  }

  if (createdUser) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AIプラス CMS</h1>
                <p className="text-sm text-gray-600">生徒アカウント作成完了</p>
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
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-8">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {createdUser.role === 'admin'
                    ? '管理者アカウントを作成しました'
                    : '生徒アカウントを作成しました'}
                </h2>
                <p className="text-gray-600">
                  以下の情報を対象ユーザーに共有してください。
                  <br />
                  <span className="text-red-600 font-semibold">
                    パスワードはこの画面でのみ表示されます。
                  </span>
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">生徒ID:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {createdUser.student_id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">名前:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {createdUser.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">ロール:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {createdUser.role === 'admin' ? '管理者' : '生徒'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      ステータス:
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {createdUser.contract_status === 'active' ? '有効' : createdUser.contract_status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      初回ログインパスワード:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white border border-yellow-300 rounded px-4 py-3 font-mono text-lg text-gray-900">
                        {createdUser.password}
                      </code>
                      <button
                        onClick={handleCopyPassword}
                        className="px-4 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        {copied ? 'コピー済み' : 'コピー'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>注意事項:</strong>
                  <br />
                  • このパスワードは自動生成されたものです
                  <br />
                  • セキュリティのため、この画面を閉じると二度と表示されません
                  <br />
                  • 生徒にログイン情報を安全に共有してください
                  <br />• 生徒は初回ログイン後、パスワードを変更することを推奨します
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/admin/users"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ユーザー管理に戻る
                </Link>
                <button
                  type="button"
                  onClick={handleContinueAdding}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  続けて追加
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AIプラス CMS</h1>
              <p className="text-sm text-gray-600">生徒アカウント作成</p>
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/admin/users"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
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
              ユーザー管理に戻る
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              新しいユーザーを追加
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="role"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  ロール <span className="text-red-600">*</span>
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="student">生徒</option>
                  <option value="admin">管理者</option>
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="studentId"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  ログインID <span className="text-red-600">*</span>
                </label>
                <input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={role === 'admin' ? '例: ADMIN002' : '例: STU001'}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600 mt-1">
                  ログイン時に使用する一意の識別子です
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  名前 <span className="text-gray-500 text-xs">(任意)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 山田太郎"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600 mt-1">
                  空欄の場合はログインIDが使用されます
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="contractStatus"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  ステータス
                </label>
                <select
                  id="contractStatus"
                  value={contractStatus}
                  onChange={(e) => setContractStatus(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="active">有効</option>
                  <option value="expired">期限切れ</option>
                  <option value="cancelled">キャンセル</option>
                  <option value="suspended">停止中</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>パスワードについて:</strong>
                  <br />
                  パスワードは自動生成されます（12〜16文字、英数字混合）。
                  <br />
                  作成後の画面で一度だけ表示されますので、必ず控えてください。
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/admin/users"
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 text-center rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? '作成中...'
                    : role === 'admin'
                      ? '管理者を追加'
                      : '生徒を追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
