'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { AlertCircle, CheckCircle, ArrowLeft, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react'
import { useBdapps } from '@/lib/bdapps-context'

interface ReviewFormProps {
  businessId: string
  businessName: string
  businessSlug: string
  userId?: string
}

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

  // Guard 1: Unregistered Subscriber
  if (!user || user.subscriptionStatus === 'UNREGISTERED') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 text-white border border-emerald-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">BDApps Subscription Required</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Writing verified reviews for <strong>{businessName}</strong> requires an active Robi / Airtel BDApps subscription (2.78 BDT / day).
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
          className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Subscribe via BDApps (2.78 BDT/day)</span>
        </button>
      </div>
    )
  }

  // Guard 2: Pending Payment Status (Registered profile, but payment pending)
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
          className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-check Carrier Payment Status</span>
        </button>
      </div>
    )
  }

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
          ধন্যবাদ! আপনার রিভিউটি প্রকাশিত হয়েছে।
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          আপনার মূল্যবান মতামত কোম্পানিটির ট্রাস্ট স্কোর বৃদ্ধিতে সহায়তা করবে।
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto font-brand">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ফিরে যান</span>
      </button>

      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            BDApps Verified Subscriber ({user.phone})
          </span>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
            {businessName}-এর জন্য আপনার সতস্ফূর্ত মতামত শেয়ার করুন
          </h1>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating Select */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
              রেটিং দিন (১ থেকে ৫ স্টার) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl border transition ${
                    rating >= star
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                      : 'border-[var(--color-border)] text-slate-400'
                  }`}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
              সংক্ষিপ্ত শিরোনাম
            </label>
            <input
              type="text"
              placeholder="উদাহরণ: দারুণ সার্ভিস ও দ্রুত ডেলিভারি!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
              বিস্তারিত অভিজ্ঞতা *
            </label>
            <textarea
              rows={4}
              placeholder="কোম্পানিটির ভালো এবং মন্দ দিকগুলো বিস্তারিত লিখুন..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'সাবমিট করা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
          </button>
        </form>
      </div>
    </div>
  )
}
