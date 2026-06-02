'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { StarRating, TrustScore } from '@/components/trust/TrustComponents'
import { MessageSquare, Clock, PlusCircle, Building, Users, Star } from 'lucide-react'

export default function BusinessDashboardOverview() {
  const { user } = useUser()
  const [business, setBusiness] = useState<any | null>(null)
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchBusinessData = async () => {
      try {
        // Fetch business owned by this user
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*, business_categories(name_en, name_bn)')
          .eq('claimed_by', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (bizError) {
          console.error('Error fetching business:', bizError)
        } else if (bizData) {
          setBusiness(bizData)

          // Fetch recent reviews for this business
          const { data: revData, error: revError } = await supabase
            .from('reviews')
            .select('*, profiles(full_name, avatar_url)')
            .eq('business_id', bizData.id)
            .order('created_at', { ascending: false })
            .limit(3)

          if (revError) {
            console.error('Error fetching reviews:', revError)
          } else {
            setRecentReviews(revData || [])
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Clock className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-6 font-brand">
        <div className="p-4 bg-[var(--color-accent-muted)] text-[var(--color-accent)] rounded-full w-fit mx-auto border border-[var(--color-border)]">
          <Building className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-bold text-lg text-[var(--color-text-primary)]">কোনো সচল দাবি করা ব্যবসা পাওয়া যায়নি</h2>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            আপনার অ্যাকাউন্টের সাথে যুক্ত কোনো ব্যবসা খুঁজে পাওয়া যায়নি। সম্ভবত আপনার দাবির আবেদনটি এখনও প্রক্রিয়াধীন রয়েছে বা এখনও ব্যবসা দাবি করেননি।
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/business-dashboard/claim"
            className="inline-flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150"
          >
            <PlusCircle className="w-4 h-4" />
            <span>একটি ব্যবসা দাবি করুন</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-brand">
      
      {/* Welcome & Business Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <span className="text-[10px] bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-bold px-2 py-0.5 rounded-full uppercase">
            {business.business_categories?.name_bn || business.business_categories?.name_en}
          </span>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1.5">
            {business.name_bn || business.name}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            বিজনেস পোর্টাল থেকে আপনার প্রোফাইল ও গ্রাহকদের মতামতের উত্তর দিন।
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-xs text-[var(--color-text-secondary)] block">ট্রাস্ট স্কোর</span>
            <span className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">{business.trust_score || '0.0'}</span>
          </div>
          <TrustScore score={Number(business.trust_score)} />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Reviews */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">মোট রিভিউ</p>
            <p className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">{business.total_reviews || 0}টি</p>
          </div>
        </div>

        {/* Claim Status */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">মালিকানা ভেরিফিকেশন</p>
            <p className="text-xs font-bold text-[var(--color-primary)] mt-1">ভেরিফাইড মালিক</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">অ্যাকাউন্ট টাইপ</p>
            <p className="text-xs font-bold text-[var(--color-text-primary)] mt-1">
              {business.is_premium ? 'প্রিমিয়াম গ্রাহক' : 'ফ্রি প্ল্যান'}
            </p>
          </div>
        </div>

      </div>

      {/* Recent Reviews section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <h2 className="font-bold text-lg text-[var(--color-text-primary)]">গ্রাহকদের শেষ রিভিউসমূহ</h2>
          <Link
            href="/business-dashboard/reviews"
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            সব দেখুন ও উত্তর দিন
          </Link>
        </div>

        <div className="space-y-4">
          {recentReviews.length > 0 ? (
            recentReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl space-y-3 hover:shadow-xs transition duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[var(--color-text-primary)]">
                      {rev.profiles?.full_name || 'বেনামী ব্যবহারকারী'}
                    </span>
                    {rev.is_verified_purchase && (
                      <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[9px] px-1.5 py-0.2 rounded font-semibold">
                        ভেরিফাইড ক্রয়
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    rev.status === 'approved'
                      ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                      : rev.status === 'pending'
                      ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                      : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                  }`}>
                    {rev.status === 'approved' ? 'অনুমোদিত' : rev.status === 'pending' ? 'অপেক্ষমাণ' : 'প্রত্যাখ্যাত'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <StarRating rating={rev.rating} size="sm" />
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    {new Date(rev.created_at).toLocaleDateString('bn-BD')}
                  </span>
                </div>

                {rev.title && (
                  <h4 className="font-bold text-xs text-[var(--color-text-primary)]">{rev.title}</h4>
                )}
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-brand line-clamp-2">
                  &ldquo;{rev.body}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl">
              <p className="text-xs text-[var(--color-text-secondary)]">আপনার ব্যবসার জন্য এখনও কোনো রিভিউ জমা পড়েনি।</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
