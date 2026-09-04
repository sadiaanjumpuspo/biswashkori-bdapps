'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { AlertCircle, CheckCircle, Clock, MessageSquare, CornerDownRight, Send } from 'lucide-react'

export default function BusinessReviewsPage() {
  const { user } = useUser()
  const [business, setBusiness] = useState<any | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState<{ [reviewId: string]: string }>({})
  const [replyLoading, setReplyLoading] = useState<{ [reviewId: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const supabase = createClient()

  const fetchBusinessAndReviews = async () => {
    if (!user) return
    try {
      // Fetch claimed business
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('claimed_by_phone', user.phone)
        .eq('is_active', true)
        .maybeSingle()

      if (bizError) {
        console.error('Error fetching business:', bizError)
        setError('ব্যবসার তথ্য লোড করা সম্ভব হয়নি।')
      } else if (bizData) {
        setBusiness(bizData)

        // Fetch reviews with their nested business replies and user profiles
        const { data: revData, error: revError } = await supabase
          .from('reviews')
          .select('*, profiles(full_name, avatar_url), business_replies(*, profiles(full_name))')
          .eq('business_id', bizData.id)
          .order('created_at', { ascending: false })

        if (revError) {
          console.error('Error fetching reviews:', revError)
          setError('রিভিউর তালিকা লোড করা সম্ভব হয়নি।')
        } else {
          setReviews(revData || [])
        }
      }
    } catch (err) {
      console.error(err)
      setError('একটি অজানা ত্রুটি ঘটেছে।')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinessAndReviews()
  }, [user])

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyText[reviewId]?.trim()
    if (!text) return

    setReplyLoading(prev => ({ ...prev, [reviewId]: true }))
    setError(null)
    setSuccessMsg(null)

    try {
      const { error: replyError } = await supabase
        .from('business_replies')
        .insert({
          review_id: reviewId,
          business_id: business.id,
          replied_by_phone: user!.phone,
          body: text
        })

      if (replyError) {
        setError(replyError.message)
      } else {
        setSuccessMsg('রিভিউটির উত্তর সফলভাবে প্রকাশ করা হয়েছে!')
        setReplyText(prev => ({ ...prev, [reviewId]: '' }))
        // Refresh reviews list to show new reply
        await fetchBusinessAndReviews()
      }
    } catch (err) {
      console.error(err)
      setError('উত্তর পোস্ট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।')
    } finally {
      setReplyLoading(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  const handleTextChange = (reviewId: string, val: string) => {
    setReplyText(prev => ({ ...prev, [reviewId]: val }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Clock className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4 font-brand">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)] mx-auto" />
        <h2 className="font-bold text-lg text-[var(--color-text-primary)]">কোনো সচল ব্যবসা পাওয়া যায়নি</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">আপনার প্রোফাইলের সাথে ভেরিফাইড কোনো ব্যবসা যুক্ত নেই।</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">রিভিউসমূহ ও উত্তর (Reviews & Replies)</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          এখানে গ্রাহকরা আপনার ব্যবসা সম্পর্কে কী লিখছেন তা দেখতে পাবেন এবং তাদের রিভিউতে অফিশিয়াল উত্তর প্রদান করতে পারবেন।
        </p>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-primary)] text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((rev) => {
            const hasReply = rev.business_replies && rev.business_replies.length > 0
            const currentReply = hasReply ? rev.business_replies[0] : null

            return (
              <div
                key={rev.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl space-y-4 hover:shadow-xs transition duration-150"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[var(--color-text-primary)]">
                        {rev.profiles?.full_name || 'বেনামী ব্যবহারকারী'}
                      </span>
                      {rev.is_verified_purchase && (
                        <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[9px] px-2 py-0.5 rounded font-semibold">
                          ভেরিফাইড ক্রয়
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarRating rating={rev.rating} size="sm" />
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {new Date(rev.created_at).toLocaleDateString('bn-BD')}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        ({rev.language === 'bn' ? 'বাংলা' : 'English'})
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    rev.status === 'approved'
                      ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                      : rev.status === 'pending'
                      ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                      : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                  }`}>
                    {rev.status === 'approved' ? 'অনুমোদিত' : rev.status === 'pending' ? 'মডারেশনে আছে' : 'প্রত্যাখ্যাত'}
                  </span>
                </div>

                {/* Review Body */}
                <div className="bg-[var(--color-surface-2)]/40 p-4 rounded-lg border border-[var(--color-border)]/50">
                  {rev.title && (
                    <h4 className="font-bold text-xs text-[var(--color-text-primary)] mb-1">{rev.title}</h4>
                  )}
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {rev.body}
                  </p>
                </div>

                {/* Nested Business Reply */}
                {hasReply ? (
                  <div className="flex items-start space-x-2.5 bg-[var(--color-primary-muted)]/40 p-4 rounded-lg border border-[var(--color-primary)]/10 ml-4 sm:ml-8">
                    <CornerDownRight className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-[var(--color-primary)]">ব্যবসার অফিশিয়াল উত্তর</span>
                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                          {new Date(currentReply.created_at).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {currentReply.body}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Reply Form (only allowed if review status is approved and not replied yet)
                  rev.status === 'approved' ? (
                    <div className="ml-4 sm:ml-8 pt-2 space-y-2.5">
                      <label htmlFor={`reply-${rev.id}`} className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
                        উত্তর দিন / Reply to this Review
                      </label>
                      <div className="flex items-start space-x-2">
                        <textarea
                          id={`reply-${rev.id}`}
                          rows={2}
                          value={replyText[rev.id] || ''}
                          onChange={(e) => handleTextChange(rev.id, e.target.value)}
                          className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150 leading-relaxed"
                          placeholder="গ্রাহকের মতামতের জন্য ধন্যবাদ জানান এবং প্রয়োজন অনুসারে সহায়তা অফার করুন..."
                        />
                        <button
                          type="button"
                          disabled={replyLoading[rev.id] || !replyText[rev.id]?.trim()}
                          onClick={() => handleReplySubmit(rev.id)}
                          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white p-2.5 rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 self-end"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[9px] text-[var(--color-text-muted)]">
                        * উত্তরটি সবার জন্য দৃশ্যমান হবে। একবার উত্তর দেওয়ার পর তা পরিবর্তন বা মুছে ফেলা যায় না।
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[var(--color-text-muted)] italic ml-4 sm:ml-8">
                      * রিভিউর উত্তর দিতে হলে তা অবশ্যই অ্যাডমিন প্যানেল দ্বারা অনুমোদিত হতে হবে।
                    </p>
                  )
                )}

              </div>
            )
          })
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-3">
            <MessageSquare className="w-10 h-10 text-[var(--color-text-muted)] mx-auto" />
            <p className="text-sm text-[var(--color-text-secondary)]">আপনার ব্যবসার জন্য কোনো রিভিউ পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

    </div>
  )
}
