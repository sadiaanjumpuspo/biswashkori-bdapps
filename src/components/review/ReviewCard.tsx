'use client'

import { useState, useEffect } from 'react'
import { StarRating } from '@/components/trust/TrustComponents'
import { Heart, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from 'next-intl'
import FlagDialog from './FlagDialog'

interface ReviewCardProps {
  review: {
    id: string
    business_id: string
    user_id: string
    rating: number
    title: string
    body: string
    body_bn: string | null
    is_verified_purchase: boolean
    helpful_count: number
    created_at: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
      is_verified: boolean
    } | null
    business_replies: Array<{
      id: string
      body: string
      created_at: string
    }> | null
  }
  currentUserId?: string | null
}

export default function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const locale = useLocale()
  const isBn = locale === 'bn'
  const supabase = createClient()

  const [hasVoted, setHasVoted] = useState(false)
  const [votesCount, setVotesCount] = useState(review.helpful_count || 0)
  const [isFlagOpen, setIsFlagOpen] = useState(false)
  const [flagSuccess, setFlagSuccess] = useState(false)

  // 1. Fetch user's existing vote status
  useEffect(() => {
    if (!currentUserId) return

    const checkVote = async () => {
      const { data } = await supabase
        .from('review_votes')
        .select('id')
        .eq('review_id', review.id)
        .eq('user_id', currentUserId)
        .eq('vote', 'helpful')
        .single()

      if (data) {
        setHasVoted(true)
      }
    }

    checkVote()
  }, [currentUserId, review.id])

  // 2. Toggle helpful vote
  const handleVote = async () => {
    if (!currentUserId) {
      alert(isBn ? 'ভোট দিতে দয়া করে লগইন করুন।' : 'Please log in to vote.')
      return
    }

    const nextVoted = !hasVoted
    const nextCount = nextVoted ? votesCount + 1 : Math.max(0, votesCount - 1)

    // Optimistic Update
    setHasVoted(nextVoted)
    setVotesCount(nextCount)

    if (nextVoted) {
      // Add vote and increment count
      const { error: insertError } = await supabase
        .from('review_votes')
        .insert({
          review_id: review.id,
          user_id: currentUserId,
          vote: 'helpful'
        })

      if (!insertError) {
        await supabase
          .from('reviews')
          .update({ helpful_count: nextCount })
          .eq('id', review.id)
      } else {
        // Rollback on error
        setHasVoted(false)
        setVotesCount(votesCount)
      }
    } else {
      // Remove vote and decrement count
      const { error: deleteError } = await supabase
        .from('review_votes')
        .delete()
        .eq('review_id', review.id)
        .eq('user_id', currentUserId)

      if (!deleteError) {
        await supabase
          .from('reviews')
          .update({ helpful_count: nextCount })
          .eq('id', review.id)
      } else {
        // Rollback on error
        setHasVoted(true)
        setVotesCount(votesCount)
      }
    }
  }

  const handleFlagSuccess = () => {
    setFlagSuccess(true)
    setTimeout(() => setFlagSuccess(false), 4000)
  }

  const reviewBody = isBn && review.body_bn ? review.body_bn : review.body

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-4 hover:shadow-xs transition duration-150">
      
      {/* Reviewer Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] flex items-center justify-center font-bold font-mono overflow-hidden">
            {review.profiles?.avatar_url ? (
              <img src={review.profiles.avatar_url} alt={review.profiles.full_name || 'User'} className="w-full h-full object-cover" />
            ) : (
              (review.profiles?.full_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="font-bold text-sm text-[var(--color-text-primary)] font-brand">
                {review.profiles?.full_name || (isBn ? 'বেনামী ব্যবহারকারী' : 'Anonymous User')}
              </span>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center text-[10px] text-[var(--color-primary)] font-brand bg-[var(--color-primary-muted)] px-1.5 py-0.5 rounded-sm font-semibold border border-[var(--color-primary)]/10">
                  {isBn ? 'ক্রয় ভেরিফাইড' : 'Verified Purchase'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              {new Date(review.created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
            </span>
          </div>
        </div>

        {/* Stars */}
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Review Content */}
      <div className="space-y-1.5 font-brand">
        <h4 className="font-bold text-base text-[var(--color-text-primary)]">
          {review.title}
        </h4>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
          {reviewBody}
        </p>
      </div>

      {/* Review Actions (Helpful, Flag) */}
      <div className="flex items-center justify-between text-xs border-t border-[var(--color-border)] pt-4 text-[var(--color-text-muted)] font-brand">
        <button 
          onClick={handleVote}
          className={`flex items-center space-x-1 transition cursor-pointer hover:text-[var(--color-primary)] ${hasVoted ? 'text-[var(--color-primary)] font-bold' : ''}`}
        >
          <Heart className={`w-3.5 h-3.5 ${hasVoted ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' : 'fill-transparent'}`} />
          <span>{isBn ? `সহায়ক হয়েছে (${votesCount})` : `Helpful (${votesCount})`}</span>
        </button>
        
        <div className="flex items-center space-x-2">
          {flagSuccess && (
            <span className="text-[10px] text-[var(--color-primary)] font-semibold animate-pulse">
              {isBn ? 'রিপোর্ট সফল হয়েছে' : 'Report submitted successfully'}
            </span>
          )}
          <button 
            onClick={() => setIsFlagOpen(true)}
            className="flex items-center space-x-1 hover:text-[var(--color-danger)] transition cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isBn ? 'রিপোর্ট করুন' : 'Report'}</span>
          </button>
        </div>
      </div>

      {/* Business Reply Section */}
      {review.business_replies && review.business_replies.length > 0 && (
        <div className="mt-4 bg-[var(--color-surface-2)] border-l-4 border-[var(--color-primary)] p-4 rounded-r-xl space-y-2 font-brand transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[var(--color-primary)]">
              {isBn ? 'ব্যবসা প্রতিষ্ঠানের পক্ষ থেকে উত্তর' : 'Reply from business'}
            </span>
            <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
              {new Date(review.business_replies[0].created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {review.business_replies[0].body}
          </p>
        </div>
      )}

      {/* Flag dialog */}
      <FlagDialog 
        reviewId={review.id}
        isOpen={isFlagOpen}
        onClose={() => setIsFlagOpen(false)}
        onSuccess={handleFlagSuccess}
      />

    </div>
  )
}
