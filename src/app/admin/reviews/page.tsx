'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { AlertCircle, CheckCircle, Clock, XCircle, Check, Ban } from 'lucide-react'

export default function ReviewModerationPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{ [reviewId: string]: boolean }>({})
  const [rejectionReasons, setRejectionReasons] = useState<{ [reviewId: string]: string }>({})
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const fetchPendingReviews = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*, businesses(name, name_bn)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (fetchError) {
        console.error(fetchError)
        setError('পেন্ডিং রিভিউ লোড করতে ত্রুটি হয়েছে। RLS পলিসি চেক করুন।')
      } else {
        setReviews(data || [])
      }
    } catch (err) {
      console.error(err)
      setError('অজানা ডাটাবেজ ত্রুটি।')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingReviews()
  }, [])

  const handleApprove = async (review: any) => {
    const reviewId = review.id
    setActionLoading(prev => ({ ...prev, [reviewId]: true }))
    setError(null)
    setSuccess(null)

    try {
      const { error: approveError } = await supabase
        .from('reviews')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (approveError) {
        setError(approveError.message)
      } else {
        // Recalculate business trust score
        if (review.business_id) {
          const { data: allApproved } = await supabase
            .from('reviews')
            .select('rating')
            .eq('business_id', review.business_id)
            .eq('status', 'approved')

          if (allApproved && allApproved.length > 0) {
            const avg = allApproved.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / allApproved.length
            await supabase
              .from('businesses')
              .update({
                trust_score: parseFloat(avg.toFixed(1)),
                total_reviews: allApproved.length,
                updated_at: new Date().toISOString()
              })
              .eq('id', review.business_id)
          }
        }

        setSuccess('রিভিউটি সফলভাবে অনুমোদন করা হয়েছে এবং ব্যবসার ট্রাস্ট স্কোর আপডেট করা হয়েছে!')
        await fetchPendingReviews()
      }
    } catch (err) {
      console.error(err)
      setError('রিভিউ অনুমোদন ব্যর্থ হয়েছে।')
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  const handleRejectConfirm = async (reviewId: string) => {
    const reason = rejectionReasons[reviewId]?.trim()
    if (!reason) {
      setError('অনুগ্রহ করে রিভিউটি প্রত্যাখ্যানের সঠিক কারণ উল্লেখ করুন।')
      return
    }

    setActionLoading(prev => ({ ...prev, [reviewId]: true }))
    setError(null)
    setSuccess(null)

    try {
      const { error: rejectError } = await supabase
        .from('reviews')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (rejectError) {
        setError(rejectError.message)
      } else {
        setSuccess('রিভিউটি প্রত্যাখ্যান করা হয়েছে।')
        setRejectingId(null)
        setRejectionReasons(prev => {
          const updated = { ...prev }
          delete updated[reviewId]
          return updated
        })
        await fetchPendingReviews()
      }
    } catch (err) {
      console.error(err)
      setError('রিভিউ প্রত্যাখ্যান প্রক্রিয়া ব্যর্থ হয়েছে।')
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Clock className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">রিভিউ মডারেশন কিউ</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          সিস্টেমের সকল অনিষ্পন্ন ও অপেক্ষমান রিভিউ অনুমোদন বা বাতিল করার কিউ।
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
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Moderation Queue List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl space-y-4 hover:shadow-xs transition duration-150"
            >
              
              {/* Review Submitter and Target business info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">ব্যবসার নাম:</span>
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">
                    {rev.businesses?.name_bn || rev.businesses?.name}
                  </span>
                </div>
                
                <div className="sm:text-right">
                  <span className="text-[10px] text-[var(--color-text-muted)] block">লিখেছেন:</span>
                  <span className="font-bold text-xs text-[var(--color-text-secondary)]">
                    {rev.user_phone || 'Subscriber'}
                  </span>
                </div>
              </div>

              {/* Rating and date */}
              <div className="flex items-center space-x-3">
                <StarRating rating={rev.rating} size="sm" />
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                  {new Date(rev.created_at).toLocaleDateString('bn-BD')}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                  ({rev.language === 'bn' ? 'বাংলা' : 'English'})
                </span>
                {rev.is_verified_purchase && (
                  <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[9px] px-1.5 py-0.2 rounded font-semibold">
                    ভেরিফাইড ক্রয়
                  </span>
                )}
              </div>

              {/* Review content */}
              <div className="bg-[var(--color-surface-2)]/50 p-4 rounded-lg border border-[var(--color-border)]/50">
                {rev.title && (
                  <h4 className="font-bold text-xs text-[var(--color-text-primary)] mb-1">{rev.title}</h4>
                )}
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {rev.body}
                </p>
              </div>

              {/* Rejecting Option Area */}
              {rejectingId === rev.id ? (
                <div className="bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/10 p-4 rounded-lg space-y-3">
                  <label htmlFor={`reject-reason-${rev.id}`} className="block text-xs font-bold text-[var(--color-danger)]">
                    প্রত্যাখ্যানের কারণ লিখুন / Rejection Reason *
                  </label>
                  <textarea
                    id={`reject-reason-${rev.id}`}
                    rows={2}
                    value={rejectionReasons[rev.id] || ''}
                    onChange={(e) => setRejectionReasons(prev => ({ ...prev, [rev.id]: e.target.value }))}
                    className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-danger)]/30 focus:border-[var(--color-danger)] sm:text-xs transition duration-150"
                    placeholder="যেমন: অপশব্দ ব্যবহার, ভুয়া রিভিউ বা তথ্যগত অমিল..."
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      disabled={actionLoading[rev.id] || !rejectionReasons[rev.id]?.trim()}
                      onClick={() => handleRejectConfirm(rev.id)}
                      className="inline-flex items-center space-x-1 bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>প্রত্যাখ্যান নিশ্চিত করুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(null)
                        setError(null)
                      }}
                      className="inline-flex items-center space-x-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition duration-150"
                    >
                      <span>বাতিল</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Moderation CTA buttons
                <div className="flex items-center space-x-2 pt-1.5">
                  <button
                    type="button"
                    disabled={actionLoading[rev.id]}
                    onClick={() => handleApprove(rev)}
                    className="inline-flex items-center space-x-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>অনুমোদন করুন</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading[rev.id]}
                    onClick={() => setRejectingId(rev.id)}
                    className="inline-flex items-center space-x-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-danger)]/15 border border-[var(--color-border)] hover:border-[var(--color-danger)]/20 text-[var(--color-text-primary)] hover:text-[var(--color-danger)] px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>প্রত্যাখ্যান করুন</span>
                  </button>
                </div>
              )}

            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-2">
            <CheckCircle className="w-10 h-10 text-[var(--color-primary)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">মডারেশনের জন্য কোনো নতুন রিভিউ নেই!</p>
            <p className="text-xs text-[var(--color-text-secondary)]">সকল রিভিউ বর্তমানে অনুমোদিত বা প্রত্যাখ্যান করা হয়েছে।</p>
          </div>
        )}
      </div>

    </div>
  )
}
