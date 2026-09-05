'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { AlertCircle, CheckCircle, ArrowLeft, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react'
import { useBdapps } from '@/lib/bdapps-context'

/**
 * ReviewForm Props Interface
 */
interface ReviewFormProps {
  businessId: string
  businessName: string
  businessSlug: string
  userId?: string
}

/**
 * ReviewForm Component
 * Renders verified customer review submission form with BDApps subscription guards.
 */
export default function ReviewForm({ businessId, businessName, businessSlug }: ReviewFormProps) {
  const { user, openSubscribeModal, checkStatus, isLoading } = useBdapps()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [language, setLanguage] = useState<'en' | 'bn'>('bn')
  const [isVerifiedPurchase, setIsVerifiedPurchase] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Guard 1: Unregistered Subscriber (Must subscribe via BDApps carrier billing first)
  if (!user || user.subscriptionStatus === 'UNREGISTERED') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 text-white border border-emerald-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">BDApps Subscription Required</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Writing verified reviews for <strong>{businessName}</strong> requires an active Robi / Cirkle BDApps subscription (2.78 BDT / day).
          </p>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1 text-left">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Subscriber Privileges:</span>
          </div>
          <p>• Write verified customer reviews for any Bangladeshi business</p>
          <p>• Access AI Trust Score breakdown & credibility reports</p>
          <p>• Claim business profiles & answer customer feedback</p>
        </div>

        <button
          onClick={() => openSubscribeModal()}
          className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Subscribe via BDApps (2.78 BDT/day)</span>
        </button>
      </div>
    )
  }

  // Guard 2: Pending Payment Status (Registered profile, but daily carrier charge pending)
  if (user.subscriptionStatus === 'PENDING_CHARGE') {
    return (
      <div className="max-w-xl mx-auto bg-amber-950/90 text-amber-100 border border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-5 font-brand">
        <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Subscription Payment Pending</h2>
          <p className="text-amber-200 text-sm leading-relaxed">
            Your profile (<strong>{user.phone}</strong>) is registered, but your daily carrier billing payment (2.78 BDT/day) is currently pending processing.
          </p>
        </div>

        <div className="p-4 bg-black/20 rounded-2xl border border-amber-500/20 text-xs text-amber-200 space-y-1 text-left">
          <p>• Profile creation & browsing are active for your account.</p>
          <p>• Paid features (writing reviews, business claims, AI trust analytics) will unlock automatically once carrier charge clears.</p>
        </div>

        <button
          onClick={() => checkStatus(user.phone)}
          disabled={isLoading}
          className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-check Carrier Payment Status</span>
        </button>
      </div>
    )
  }

  /**
   * Handle Review Form Submission
   * Inserts new review record into Supabase with 'pending' status for moderation.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('দয়া করে একটি স্টার রেটিং নির্বাচন করুন।')
      return
    }

    if (body.trim().length < 10) {
      setError('রিভিউয়ের বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে।')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Ensure user profile exists in database
      await supabase.from('profiles').upsert({
        phone: user.phone,
        full_name: user.fullName || 'BDApps Subscriber',
        subscription_status: 'REGISTERED',
      })

      // Insert review record into moderation queue ('pending' status)
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          business_id: businessId,
          user_phone: user.phone,
          rating,
          title: title.trim(),
          body: body.trim(),
          language,
          is_verified_purchase: isVerifiedPurchase,
          status: 'pending'
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/business/${businessSlug}`)
          router.refresh()
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      setError('রিভিউ সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-2xl shadow-xs text-center space-y-4 max-w-xl mx-auto font-brand">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          ধন্যবাদ! আপনার রিভিউটি জমা দেওয়া হয়েছে।
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          অ্যাডমিন কর্তৃক যাচাই ও অনুমোদনের পর রিভিউটি প্রোফাইলে প্রকাশ পাবে।
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-sm font-brand">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>পেছনে ফিরে যান</span>
      </button>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
        {businessName}-এর জন্য রিভিউ লিখুন
      </h1>
      <p className="text-xs text-[var(--color-text-secondary)] mb-6">
        আপনার বাস্তব কেনাকাটা বা সেবা গ্রহণের অভিজ্ঞতা শেয়ার করুন।
      </p>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            আপনার স্টার রেটিং *
          </label>
          <div className="flex items-center gap-2">
            <StarRating rating={rating} interactive onChange={(r) => setRating(r)} />
            <span className="text-sm font-bold text-amber-500 ml-2">
              {rating > 0 ? `${rating} / 5` : 'রেটিং নির্বাচন করুন'}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            রিভিউয়ের শিরোনাম *
          </label>
          <input
            type="text"
            placeholder="যেমন: চমৎকার সেবা ও দ্রুত ডেলিভারি"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium"
          />
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            রিভিউয়ের ভাষা
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 text-xs cursor-pointer font-medium">
              <input
                type="radio"
                name="language"
                checked={language === 'bn'}
                onChange={() => setLanguage('bn')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>বাংলা</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer font-medium">
              <input
                type="radio"
                name="language"
                checked={language === 'en'}
                onChange={() => setLanguage('en')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>English</span>
            </label>
          </div>
        </div>

        {/* Review Body */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            বিস্তারিত অভিজ্ঞতা *
          </label>
          <textarea
            rows={5}
            placeholder="পণ্য বা সেবার মান, ডেলিভারির সময়সূচী ও কাস্টমার সাপোর্টের অভিজ্ঞতা বিস্তারিত লিখুন..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium"
          />
        </div>

        {/* Verified Purchase Checkbox */}
        <div className="flex items-center space-x-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <input
            type="checkbox"
            id="verified"
            checked={isVerifiedPurchase}
            onChange={(e) => setIsVerifiedPurchase(e.target.checked)}
            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded cursor-pointer"
          />
          <label htmlFor="verified" className="text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer">
            আমি এই প্রতিষ্ঠান থেকে প্রামাণিক কেনাকাটা বা সেবাগ্রহণ করেছি (Verified Purchase)
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span>রিভিউ সাবমিট করুন</span>
          )}
        </button>
      </form>
    </div>
  )
}
