'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { AlertCircle, CheckCircle, Clock, Check, XCircle, ShieldCheck } from 'lucide-react'

export default function FlagsModerationPage() {
  const [flags, setFlags] = useState<any[]>([])
  const [filter, setFilter] = useState<'open' | 'resolved' | 'dismissed'>('open')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{ [flagId: string]: boolean }>({})
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const fetchFlags = async () => {
    setLoading(true)
    setError(null)
    try {
      // Query the flags table and join reviews & businesses safely
      const { data, error: fetchError } = await supabase
        .from('flags')
        .select(`
          *,
          reviews (
            *,
            businesses (name, name_bn)
          )
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error(fetchError)
        setError('রিপোর্ট লোড করতে ত্রুটি হয়েছে। RLS পলিসি বা ডাটাবেজ চেক করুন।')
      } else {
        setFlags(data || [])
      }
    } catch (err) {
      console.error(err)
      setError('অজানা ডাটাবেজ ত্রুটি।')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlags()
  }, [filter])

  const handleDismiss = async (flagId: string) => {
    setActionLoading(prev => ({ ...prev, [flagId]: true }))
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('flags')
        .update({
          status: 'dismissed'
        })
        .eq('id', flagId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess('রিপোর্টটি বাতিল (Dismiss) করা হয়েছে।')
        await fetchFlags()
      }
    } catch (err) {
      console.error(err)
      setError('রিপোর্ট বাতিল করতে ত্রুটি হয়েছে।')
    } finally {
      setActionLoading(prev => ({ ...prev, [flagId]: false }))
    }
  }

  const handleResolveAndReject = async (flagId: string, reviewId: string, reason: string) => {
    setActionLoading(prev => ({ ...prev, [flagId]: true }))
    setError(null)
    setSuccess(null)

    try {
      // 1. Update flag status to resolved
      const { error: flagError } = await supabase
        .from('flags')
        .update({
          status: 'resolved'
        })
        .eq('id', flagId)

      if (flagError) {
        setError(flagError.message)
        setActionLoading(prev => ({ ...prev, [flagId]: false }))
        return
      }

      // 2. Reject the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .update({
          status: 'rejected',
          rejection_reason: `ব্যবহারকারী রিপোর্টের কারণে বাতিল: ${reason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (reviewError) {
        setError(reviewError.message)
      } else {
        setSuccess('রিভিউটি সফলভাবে বাতিল করা হয়েছে এবং রিপোর্টটি নিষ্পত্তি (Resolved) করা হয়েছে!')
        await fetchFlags()
      }
    } catch (err) {
      console.error(err)
      setError('রিভিউ বাতিল ও রিপোর্ট নিষ্পত্তি করতে ত্রুটি হয়েছে।')
    } finally {
      setActionLoading(prev => ({ ...prev, [flagId]: false }))
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'spam': return 'স্প্যাম / ভুয়া রিভিউ'
      case 'harassment': return 'হ্যারাসমেন্ট / অপশব্দ'
      case 'abuse': return 'অপব্যবহার / গালাগালি'
      case 'language': return 'অনুপযুক্ত ভাষা'
      default: return reason
    }
  }

  return (
    <div className="space-y-6 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">রিপোর্ট ও ফ্ল্যাগ ব্যবস্থাপনা</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          ব্যবহারকারীদের দ্বারা রিপোর্ট করা আপত্তিজনক বা সন্দেহভাজন রিভিউগুলোর মডারেশন কিউ।
        </p>
      </div>

      {/* Tabs / Filters */}
      <div className="flex border-b border-[var(--color-border)]">
        {(['open', 'resolved', 'dismissed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition duration-150 capitalize cursor-pointer ${
              filter === tab
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {tab === 'open' ? 'অনিষ্পন্ন রিপোর্ট' : tab === 'resolved' ? 'নিষ্পত্তিকৃত' : 'বাতিলকৃত'}
          </button>
        ))}
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
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Flagged Items Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Clock className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : flags.length > 0 ? (
          flags.map((flag) => (
            <div
              key={flag.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl space-y-4 hover:shadow-xs transition duration-150"
            >
              
              {/* Top Meta info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--color-border)] pb-3 text-xs">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">রিপোর্টকারী:</span>
                  <span className="font-bold text-[var(--color-text-primary)] font-mono">
                    {flag.flagged_by_phone || 'Subscriber'}
                  </span>
                </div>
                
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">রিপোর্টের কারণ:</span>
                  <span className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-[10px] px-2 py-0.5 rounded font-bold">
                    {getReasonLabel(flag.reason)}
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] text-[var(--color-text-muted)] block">তারিখ:</span>
                  <span className="font-mono text-[var(--color-text-secondary)]">
                    {new Date(flag.created_at).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* Report Description */}
              {flag.details && (
                <div className="bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/10 p-3 rounded-lg text-xs text-[var(--color-text-secondary)]">
                  <span className="font-bold text-[var(--color-danger)] block mb-1">রিপোর্টের অতিরিক্ত বিবরণ:</span>
                  {flag.details}
                </div>
              )}

              {/* Targeted Review Card */}
              <div className="bg-[var(--color-surface-2)]/50 p-4 rounded-xl border border-[var(--color-border)]/50 space-y-3">
                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">অভিযুক্ত রিভিউ</span>
                
                {flag.reviews ? (
                  <>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">ব্যবসা:</span>
                        <span className="font-bold text-xs text-[var(--color-text-primary)]">
                          {flag.reviews.businesses?.name_bn || flag.reviews.businesses?.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--color-text-muted)] block">রিভিউ দাতা:</span>
                        <span className="font-semibold text-xs text-[var(--color-text-secondary)] font-mono">
                          {flag.reviews.user_phone || 'User'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <StarRating rating={flag.reviews.rating} size="sm" />
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {new Date(flag.reviews.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic bg-[var(--color-surface)] p-2.5 rounded border border-[var(--color-border)]/40">
                      "{flag.reviews.body}"
                    </p>
                  </>
                ) : (
                  <div className="text-xs text-[var(--color-text-muted)] italic">
                    এই রিভিউটি ইতিমধ্যে সিস্টেম থেকে মুছে ফেলা হয়েছে।
                  </div>
                )}
              </div>

              {/* Action Buttons (Only for open flags) */}
              {filter === 'open' && flag.reviews && (
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    disabled={actionLoading[flag.id]}
                    onClick={() => handleResolveAndReject(flag.id, flag.reviews.id, flag.reason)}
                    className="inline-flex items-center space-x-1 bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>রিভিউ বাতিল ও রিপোর্ট নিষ্পত্তি করুন</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading[flag.id]}
                    onClick={() => handleDismiss(flag.id)}
                    className="inline-flex items-center space-x-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>রিপোর্টটি খারিজ করুন (Dismiss)</span>
                  </button>
                </div>
              )}

            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-2">
            <ShieldCheck className="w-10 h-10 text-[var(--color-primary)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">মডারেশনের জন্য কোনো রিপোর্ট পাওয়া যায়নি!</p>
            <p className="text-xs text-[var(--color-text-secondary)]">বর্তমানে সকল রিপোর্ট নিষ্পত্তি বা বাতিল করা হয়েছে।</p>
          </div>
        )}
      </div>

    </div>
  )
}
