'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { AlertTriangle, X } from 'lucide-react'
import { useLocale } from 'next-intl'

interface FlagDialogProps {
  reviewId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function FlagDialog({ reviewId, isOpen, onClose, onSuccess }: FlagDialogProps) {
  const { user } = useUser()
  const locale = useLocale()
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError(locale === 'bn' ? 'রিপোর্ট করতে লগইন করুন।' : 'Please log in to report.')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: flagError } = await supabase.from('flags').insert({
      review_id: reviewId,
      flagged_by: user.id,
      reason,
      details,
      status: 'open'
    })

    setSubmitting(false)
    if (flagError) {
      setError(flagError.message)
    } else {
      onSuccess()
      onClose()
    }
  }

  const isBn = locale === 'bn'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-[var(--color-danger)] mb-4">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <h3 className="font-brand font-bold text-lg text-[var(--color-text-primary)]">
            {isBn ? 'রিভিউটি রিপোর্ট করুন' : 'Report this Review'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-brand">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              {isBn ? 'রিপোর্টের কারণ' : 'Reason for Report'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--color-danger)]/30 focus:border-[var(--color-danger)]"
            >
              <option value="spam">{isBn ? 'স্প্যাম বা বিজ্ঞাপন' : 'Spam or Advertisement'}</option>
              <option value="fake">{isBn ? 'ভুয়া বা ভেইক রিভিউ' : 'Fake or Fabricated Review'}</option>
              <option value="harassment">{isBn ? 'অপব্যবহার বা হ্যারাসমেন্ট' : 'Harassment or Abuse'}</option>
              <option value="inappropriate">{isBn ? 'অনুপযুক্ত ভাষা' : 'Inappropriate Language'}</option>
              <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              {isBn ? 'বিস্তারিত বর্ণনা (ঐচ্ছিক)' : 'Additional Details (Optional)'}
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={isBn ? 'কেন এই রিভিউটি রিপোর্ট করছেন তা বিস্তারিত লিখুন...' : 'Please describe why this review violates policies...'}
              className="w-full px-3.5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--color-danger)]/30 focus:border-[var(--color-danger)]"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-[var(--color-danger)]">{error}</p>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? (isBn ? 'সাবমিট হচ্ছে...' : 'Submitting...') : (isBn ? 'রিপোর্ট সাবমিট করুন' : 'Submit Report')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
