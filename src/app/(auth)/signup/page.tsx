'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'business_owner'>('user')
  const [language, setLanguage] = useState<'en' | 'bn'>('bn')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            preferred_language: language,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
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



  if (success) {
    return (
      <div className="text-center space-y-4 py-4 font-brand">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          রেজিস্ট্রেশন সফল হয়েছে!
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          আপনার অ্যাকাউন্টটি সফলভাবে তৈরি করা হয়েছে। আপনি এখন আপনার অ্যাকাউন্ট দিয়ে লগইন করতে পারেন।
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-sm font-medium text-[var(--color-text-secondary)] transition duration-150"
          >
            লগইন করুন
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-brand font-bold text-[var(--color-text-primary)]">
          নতুন অ্যাকাউন্ট তৈরি করুন
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
          অথবা{' '}
          <Link
            href="/login"
            className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition duration-150"
          >
            ইতিমধ্যে অ্যাকাউন্ট থাকলে লগইন করুন
          </Link>
        </p>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-secondary)]">
            সম্পূর্ণ নাম / Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-sm transition duration-150"
            placeholder="রহমান কবির"
          />
        </div>

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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-sm transition duration-150"
            placeholder="•••••••• (কমপক্ষে ৬ ডিজিট)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[var(--color-text-secondary)]">
              অ্যাকাউন্ট টাইপ / Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'business_owner')}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-sm transition duration-150"
            >
              <option value="user">সাধারণ ব্যবহারকারী (User)</option>
              <option value="business_owner">ব্যবসা প্রতিষ্ঠান (Owner)</option>
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-[var(--color-text-secondary)]">
              ভাষা / Language
            </label>
            <select
              id="language"
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'bn')}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-sm transition duration-150"
            >
              <option value="bn">বাংলা</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
        </button>
      </form>


    </div>
  )
}
