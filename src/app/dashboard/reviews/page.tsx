'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { Clock, MessageSquare, AlertCircle } from 'lucide-react'

export default function UserReviewsPage() {
  const { user } = useUser()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, businesses(name, name_bn, slug, logo_url)')
          .eq('user_phone', user.phone)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(error)
        } else {
          setReviews(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [user])

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
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">আমার রিভিউসমূহ</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          আপনার দেওয়া সকল রিভিউ এবং সেগুলোর বর্তমান স্ট্যাটাস এখানে দেখতে পাবেন।
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl space-y-4 hover:shadow-xs transition duration-150"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={rev.businesses?.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                    alt={rev.businesses?.name}
                    className="w-10 h-10 object-cover rounded-md border border-[var(--color-border)] flex-shrink-0"
                  />
                  <div>
                    <Link href={`/business/${rev.businesses?.slug}`} className="font-bold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition">
                      {rev.businesses?.name_bn || rev.businesses?.name}
                    </Link>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <StarRating rating={rev.rating} size="sm" />
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {new Date(rev.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
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

              {/* Review Details */}
              <div className="space-y-1 bg-[var(--color-surface-2)]/50 p-3 rounded-lg border border-[var(--color-border)]/50">
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                  {rev.title}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {rev.body}
                </p>
              </div>

              {/* Helpful and replies metadata */}
              <div className="flex items-center space-x-4 text-[10px] text-[var(--color-text-muted)]">
                <span>{rev.helpful_count || 0} জন মানুষের সহায়ক মনে হয়েছে</span>
                <span>&bull;</span>
                <span>ভাষা: {rev.language === 'bn' ? 'বাংলা' : 'English'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-3">
            <MessageSquare className="w-10 h-10 text-[var(--color-text-muted)] mx-auto" />
            <p className="text-sm text-[var(--color-text-secondary)]">আপনার কোনো রিভিউ পাওয়া যায়নি।</p>
            <Link href="/businesses" className="inline-block text-xs font-semibold text-[var(--color-primary)] hover:underline">
              ব্যবসা খুঁজুন ও রিভিউ লিখুন
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}
