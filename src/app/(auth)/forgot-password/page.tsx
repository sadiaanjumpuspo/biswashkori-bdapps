'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setError('একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-brand font-bold text-[var(--color-text-primary)]">
          পাসওয়ার্ড রিসেট করুন
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
          আপনার অ্যাকাউন্টের ইমেইল দিন, আমরা একটি রিসেট লিঙ্ক পাঠাবো।
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
          <span className="font-medium">পাসওয়ার্ড রিসেট লিঙ্ক সফলভাবে পাঠানো হয়েছে! ইমেইল চেক করুন।</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)]">
            ইমেইল এড্রেস / Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-sm transition duration-150"
            placeholder="example@mail.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিঙ্ক পাঠান'}
        </button>
      </form>

      <div className="text-center text-sm pt-2">
        <Link
          href="/login"
          className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition duration-150"
        >
          লগইন পেজে ফিরে যান
        </Link>
      </div>
    </div>
  )
}
