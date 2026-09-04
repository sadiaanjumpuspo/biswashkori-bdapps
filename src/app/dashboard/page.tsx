'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/trust/TrustComponents'
import { MessageSquare, Heart, Clock, ChevronRight, ShieldCheck } from 'lucide-react'
import { useBdapps } from '@/lib/bdapps-context'

export default function DashboardPage() {
  const { user: bdappsUser, openSubscribeModal } = useBdapps()
  const [stats, setStats] = useState({ reviewCount: 0, helpfulVotes: 0 })
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Query reviews by BDApps phone or fall back to public
        let query = supabase
          .from('reviews')
          .select('*, businesses(name, name_bn, slug)')
          .order('created_at', { ascending: false })

        if (bdappsUser?.phone) {
          query = query.eq('user_phone', bdappsUser.phone)
        }

        const { data: reviews, error } = await query

        if (error) {
          console.error(error)
        } else if (reviews) {
          setRecentReviews(reviews.slice(0, 5))
          
          // Calculate stats
          const reviewCount = reviews.length
          const helpfulVotes = reviews.reduce((sum, rev) => sum + (rev.helpful_count || 0), 0)
          setStats({ reviewCount, helpfulVotes })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [bdappsUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Clock className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 font-brand">
      
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <span>bdapps Gateway Subscription Active</span>
          </div>
          <h1 className="text-2xl font-bold mt-1">
            স্বাগতম, {bdappsUser?.phone || 'সম্মানিত সাবস্ক্রাইবার'}!
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            আপনার Robi/Cirkle বিডিঅ্যাপস অ্যাকাউন্ট থেকে সাবস্ক্রিপশন চালু আছে (২.৭৮ টাকা/দিন)।
          </p>
        </div>

        {(!bdappsUser || bdappsUser.subscriptionStatus !== 'REGISTERED') && (
          <button
            onClick={() => openSubscribeModal()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
          >
            সাবস্ক্রিপশন রিনিউ করুন
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Total Reviews Card */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">মোট রিভিউ লিখেছেন</p>
            <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">{stats.reviewCount}টি</p>
          </div>
        </div>

        {/* Helpful Votes Card */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">রিভিউতে সহায়ক ভোট</p>
            <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">{stats.helpfulVotes}টি</p>
          </div>
        </div>

      </div>

      {/* Recent Reviews written by user */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <h2 className="font-bold text-lg text-[var(--color-text-primary)]">আমার শেষ রিভিউসমূহ</h2>
          <Link
            href="/businesses"
            className="flex items-center space-x-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            <span>নতুন রিভিউ লিখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
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
                  <Link href={`/business/${rev.businesses?.slug}`} className="font-bold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition">
                    {rev.businesses?.name_bn || rev.businesses?.name}
                  </Link>
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

                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-brand line-clamp-2">
                  &ldquo;{rev.body}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl">
              <p className="text-xs text-[var(--color-text-secondary)]">আপনি এখনও কোনো রিভিউ লিখেননি।</p>
              <Link href="/businesses" className="inline-block text-xs text-[var(--color-primary)] hover:underline mt-2 font-semibold">
                ব্যবসা খুঁজুন ও রিভিউ লিখুন
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
