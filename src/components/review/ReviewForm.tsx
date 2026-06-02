'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

interface ReviewFormProps {
  businessId: string
  businessName: string
  businessSlug: string
  userId: string
}

export default function ReviewForm({ businessId, businessName, businessSlug, userId }: ReviewFormProps) {
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
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          business_id: businessId,
          user_id: userId,
          rating,
          title: title.trim(),
          body: body.trim(),
          language,
          is_verified_purchase: isVerifiedPurchase,
          status: 'pending' // Initial status is pending review
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/business/${businessSlug}`)
          router.refresh()
        }, 4000)
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
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          রিভিউ জমা দেওয়ার জন্য ধন্যবাদ!
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          আপনার রিভিউটি সফলভাবে সাবমিট করা হয়েছে এবং আমাদের মডারেটর দলের পর্যালোচনার অধীনে রয়েছে। মডারেশন সম্পন্ন হওয়া মাত্রই এটি কোম্পানির প্রোফাইলে প্রকাশিত হবে।
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          আপনাকে ৪ সেকেন্ডের মধ্যে প্রোফাইল পেজে ফিরিয়ে নিয়ে যাওয়া হচ্ছে...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
      
      {/* Form Title & Back Link */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-xl font-brand font-bold text-[var(--color-text-primary)]">
            রিভিউ লিখুন: {businessName}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] font-brand mt-0.5">
            অনুগ্রহ করে আপনার অভিজ্ঞতা সম্পর্কে সত্য তথ্য প্রদান করুন।
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-brand"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm font-brand">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Star Rating Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--color-text-secondary)] font-brand">
            আপনার রেটিং দিন / Your Rating *
          </label>
          <div className="flex items-center space-x-3 bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)] w-fit">
            <StarRating rating={rating} size="lg" interactive={true} onChange={setRating} />
            {rating > 0 && (
              <span className="text-sm font-bold font-brand text-[var(--color-primary)]">
                {rating} স্টার
              </span>
            )}
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--color-text-secondary)] font-brand">
            রিভিউয়ের ভাষা / Review Language
          </label>
          <div className="flex space-x-4 font-brand">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="lang"
                checked={language === 'bn'}
                onChange={() => setLanguage('bn')}
                className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span>বাংলা</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="lang"
                checked={language === 'en'}
                onChange={() => setLanguage('en')}
                className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span>English</span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-sm font-bold text-[var(--color-text-secondary)] font-brand">
            শিরোনাম / Review Title (ঐচ্ছিক)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="রিভিউয়ের মূল অংশ এক কথায় লিখুন"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-sm transition duration-150 font-brand"
          />
        </div>

        {/* Body Description */}
        <div className="space-y-1.5">
          <label htmlFor="body" className="block text-sm font-bold text-[var(--color-text-secondary)] font-brand">
            আপনার অভিজ্ঞতা বিস্তারিত লিখুন / Your Experience *
          </label>
          <textarea
            id="body"
            required
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="আপনার অভিজ্ঞতা বিস্তারিত শেয়ার করুন যাতে অন্যরা উপকৃত হতে পারে।"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-sm transition duration-150 font-brand leading-relaxed"
          />
        </div>

        {/* Verified Purchase Checkbox */}
        <div className="flex items-center space-x-2 py-1 font-brand">
          <input
            id="verified"
            type="checkbox"
            checked={isVerifiedPurchase}
            onChange={(e) => setIsVerifiedPurchase(e.target.checked)}
            className="h-4 w-4 rounded-sm border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label htmlFor="verified" className="text-xs text-[var(--color-text-secondary)] font-medium cursor-pointer">
            এটি একটি ভেরিফাইড কেনাকাটা (আমি কোম্পানির একজন প্রকৃত ক্রেতা)
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-3 font-brand">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'সাবমিট হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
          </button>
        </div>

      </form>
    </div>
  )
}
