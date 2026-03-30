'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  student_id: string
  name: string
  role: string
  contract_status: string
  created_at: Date
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null)
  const [resetPasswordData, setResetPasswordData] = useState<{
    studentId: string
    name: string
    newPassword: string
  } | null>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)

  const fetchStudents = useCallback(async (query?: string) => {
    setIsLoading(true)
    setError('')

    try {
      const url = query
        ? `/api/admin/users?query=${encodeURIComponent(query)}&role=${roleFilter}`
        : `/api/admin/users?role=${roleFilter}`

      const response = await fetch(url, {
        credentials: 'include',
      })
      const data = await response.json()

      if (response.status === 403) {
        router.push('/admin/login')
        return
      }

      if (response.ok && data.success) {
        setStudents(data.users || [])
      } else {
        setError(data.message || '生徒一覧の取得に失敗しました')
      }
    } catch (err) {
      console.error('Fetch students error:', err)
      setError('生徒一覧の取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, router])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStudents(searchQuery)
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setUpdatingId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contract_status: newStatus }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update local state
        setStudents(
          students.map((s) =>
            s.id === userId ? { ...s, contract_status: newStatus } : s
          )
        )
      } else {
        alert(data.message || '契約ステータスの更新に失敗しました')
      }
    } catch (err) {
      console.error('Update status error:', err)
      alert('契約ステータスの更新中にエラーが発生しました')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleResetPasswordClick = (userId: string) => {
    setResetPasswordUserId(userId)
  }

  const handleResetPasswordConfirm = async () => {
    if (!resetPasswordUserId) return

    setIsResettingPassword(true)
    try {
      const response = await fetch(
        `/api/admin/users/${resetPasswordUserId}/reset-password`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        // Show password modal
        const student = students.find((s) => s.id === resetPasswordUserId)
        setResetPasswordData({
          studentId: student?.student_id || '',
          name: student?.name || '',
          newPassword: data.newPassword,
        })
        setResetPasswordUserId(null)
      } else {
        alert(data.message || 'パスワードの再発行に失敗しました')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      alert('パスワードの再発行中にエラーが発生しました')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleCopyPassword = async () => {
    if (resetPasswordData) {
      try {
        await navigator.clipboard.writeText(resetPasswordData.newPassword)
        setPasswordCopied(true)
        setTimeout(() => setPasswordCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy password:', err)
        alert('パスワードのコピーに失敗しました')
      }
    }
  }

  const handleClosePasswordModal = () => {
    setResetPasswordData(null)
    setPasswordCopied(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
            有効
          </span>
        )
      case 'expired':
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded">
            期限切れ
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded">
            キャンセル
          </span>
        )
      case 'suspended':
        return (
          <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded">
            停止中
          </span>
        )
      default:
        return <span>{status}</span>
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? '管理者' : '生徒'
  }

  return (
    <>
      {/* Password Reset Confirmation Dialog */}
      {resetPasswordUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              パスワード再発行の確認
            </h3>
            <p className="text-gray-700 mb-6">
              このユーザーのパスワードを再発行しますか？
              <br />
              <span className="text-red-600 font-semibold">
                新しいパスワードは次の画面でのみ表示されます。
              </span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setResetPasswordUserId(null)}
                disabled={isResettingPassword}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleResetPasswordConfirm}
                disabled={isResettingPassword}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {isResettingPassword ? '再発行中...' : '再発行する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Password Display Modal */}
      {resetPasswordData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                パスワードを再発行しました
              </h3>
              <p className="text-sm text-gray-600">
                生徒ID: <strong>{resetPasswordData.studentId}</strong>
                <br />
                名前: <strong>{resetPasswordData.name}</strong>
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                新しいパスワード:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-yellow-300 rounded px-4 py-3 font-mono text-lg text-gray-900 break-all">
                  {resetPasswordData.newPassword}
                </code>
                <button
                  onClick={handleCopyPassword}
                  className="px-4 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 whitespace-nowrap"
                >
                  {passwordCopied ? 'コピー済み' : 'コピー'}
                </button>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>重要:</strong>
                <br />
                このパスワードはこの画面でのみ表示されます。
                <br />
                必ずコピーして生徒に安全に共有してください。
              </p>
            </div>

            <button
              onClick={handleClosePasswordModal}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AIプラス CMS</h1>
              <p className="text-sm text-gray-600">ユーザー管理</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/contents"
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                コンテンツ管理
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center">
          <form onSubmit={handleSearch} className="flex gap-4 items-center">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="student">生徒</option>
              <option value="admin">管理者</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ログインIDまたは名前で検索"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              検索
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  fetchStudents()
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                クリア
              </button>
            )}
          </form>

          <Link
            href="/admin/users/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ユーザーを追加
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
        ) : students.length === 0 ? (
              <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? '該当するユーザーが見つかりませんでした'
                : 'ユーザーが登録されていません'}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/users/new"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                最初のユーザーを追加
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ログインID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ロール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.student_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getRoleLabel(student.role)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={student.contract_status}
                        onChange={(e) =>
                          handleStatusChange(student.id, e.target.value)
                        }
                        disabled={updatingId === student.id}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="active">有効</option>
                        <option value="expired">期限切れ</option>
                        <option value="cancelled">キャンセル</option>
                        <option value="suspended">停止中</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(student.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(student.contract_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleResetPasswordClick(student.id)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        パスワード再発行
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
