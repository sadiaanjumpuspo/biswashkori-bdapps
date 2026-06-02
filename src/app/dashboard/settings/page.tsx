'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, Lock } from 'lucide-react'

export default function SettingsPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Form validations
    if (password.length < 6) {
      setError('পাসওয়ার্ডটি অবশ্যই অন্তত ৬ অক্ষরের হতে হবে।')
      return
    }

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড দুটি মিলছে না। অনুগ্রহ করে আবার যাচাই করুন।')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      console.error(err)
      setError('পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">পাসওয়ার্ড পরিবর্তন</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নতুন পাসওয়ার্ড সেট করুন।
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
          <span className="font-medium">পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!</span>
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
        
        {/* New Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-bold text-[var(--color-text-secondary)]">
            নতুন পাসওয়ার্ড / New Password *
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150"
            placeholder="কমপক্ষে ৬টি অক্ষর"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-[var(--color-text-secondary)]">
            পাসওয়ার্ড নিশ্চিত করুন / Confirm Password *
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150"
            placeholder="পাসওয়ার্ডটি পুনরায় টাইপ করুন"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
