'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message === 'Invalid login credentials' 
          ? 'ভুল ইমেইল বা পাসওয়ার্ড। দয়া করে আবার চেষ্টা করুন।' 
          : authError.message)
      } else {
        router.push('/')
        router.refresh()
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
          অ্যাকাউন্টে লগইন করুন
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
          অথবা{' '}
          <Link
            href="/signup"
            className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition duration-150"
          >
            নতুন অ্যাকাউন্ট তৈরি করুন
          </Link>
        </p>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)]">
            পাসওয়ার্ড / Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-sm transition duration-150"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded-sm border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-2"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-[var(--color-text-secondary)]">
              মনে রাখুন
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition duration-150"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
        </button>
      </form>


    </div>
  )
}
