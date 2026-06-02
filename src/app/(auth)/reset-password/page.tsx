'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password: password,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      console.error(err)
      setError('পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-brand font-bold text-[var(--color-text-primary)]">
          নতুন পাসওয়ার্ড সেট করুন
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
          আপনার অ্যাকাউন্টের জন্য একটি নতুন পাসওয়ার্ড প্রবেশ করান।
        </p>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-primary)] text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! আপনাকে লগইন পেজে রিডাইরেক্ট করা হচ্ছে...</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)]">
            নতুন পাসওয়ার্ড / New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-sm transition duration-150"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {loading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড নিশ্চিত করুন'}
        </button>
      </form>
    </div>
  )
}
