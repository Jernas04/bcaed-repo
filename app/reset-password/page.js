'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // IMPORTANT: ensure session is loaded from email link
  useEffect(() => {
    const handleSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setMessage('Invalid or expired reset link.')
      }
    }

    handleSession()
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Password updated successfully. You can now log in.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleUpdatePassword}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-4">
          Reset Password
        </h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded mb-3"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {message && (
          <p className="text-sm mt-3 text-center text-gray-700">
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
