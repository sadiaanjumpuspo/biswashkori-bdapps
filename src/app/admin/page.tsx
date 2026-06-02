'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Clock, MessageSquare, Building2, Users, ShieldAlert, ArrowRight } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingReviews: 0,
    pendingClaims: 0,
    totalBusinesses: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true)

        const [reviewsRes, claimsRes, bizRes, usersRes] = await Promise.all([
          supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('business_claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('businesses').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ])

        if (reviewsRes.error || claimsRes.error || bizRes.error || usersRes.error) {
          console.error({
            reviewsErr: reviewsRes.error,
            claimsErr: claimsRes.error,
            bizErr: bizRes.error,
            usersErr: usersRes.error
          })
          setError('পরিসংখ্যান লোড করতে ত্রুটি হয়েছে। RLS পলিসি চেক করুন।')
        } else {
          setStats({
            pendingReviews: reviewsRes.count || 0,
            pendingClaims: claimsRes.count || 0,
            totalBusinesses: bizRes.count || 0,
            totalUsers: usersRes.count || 0
          })
        }
      } catch (err) {
        console.error(err)
        setError('ডাটাবেজ কানেকশন ত্রুটি।')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Clock className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">সিস্টেম ওভারভিউ</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          বিশ্বাসকরি প্ল্যাটফর্মের কার্যক্রম ও নিরাপত্তা তদারকি করুন।
        </p>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Reviews */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">অপেক্ষমান রিভিউ</p>
            <p className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">{stats.pendingReviews}টি</p>
          </div>
        </div>

        {/* Pending Claims */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">অপেক্ষমান দাবি</p>
            <p className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">{stats.pendingClaims}টি</p>
          </div>
        </div>

        {/* Total Businesses */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">মোট নিবন্ধিত ব্যবসা</p>
            <p className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">{stats.totalBusinesses}টি</p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-full bg-[var(--color-text-muted)]/10 text-[var(--color-text-secondary)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">মোট প্রোফাইল</p>
            <p className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">{stats.totalUsers}টি</p>
          </div>
        </div>

      </div>

      {/* Moderation Actions Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Moderation Card 1 */}
        <div className="border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--color-text-primary)]">রিভিউ মডারেশন কিউ</h3>
            {stats.pendingReviews > 0 && (
              <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {stats.pendingReviews} pending
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            ব্যবহারকারীদের জমা দেওয়া নতুন রিভিউগুলো যাচাই করুন। স্প্যাম বা নীতিবহির্ভূত রিভিউ বাতিল এবং নির্ভরযোগ্য রিভিউগুলো সাইটে প্রকাশের জন্য অনুমোদন করুন।
          </p>
          <div className="pt-2">
            <Link
              href="/admin/reviews"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              <span>মডারেশন কিউতে যান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Moderation Card 2 */}
        <div className="border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--color-text-primary)]">ব্যবসার মালিকানা দাবি</h3>
            {stats.pendingClaims > 0 && (
              <span className="bg-[var(--color-accent-light)]/10 text-[var(--color-accent-light)] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {stats.pendingClaims} pending
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            ব্যবসার মালিকদের পক্ষ থেকে জমা দেওয়া প্রমাণের দলিল (যেমন ট্রেড লাইসেন্স) পর্যালোচনা করুন। সফল রিভিউ শেষে মালিকানা হ্যান্ডওভার সম্পূর্ণ করুন।
          </p>
          <div className="pt-2">
            <Link
              href="/admin/claims"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              <span>দাবি ও প্রমাণপত্র যাচাই</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
