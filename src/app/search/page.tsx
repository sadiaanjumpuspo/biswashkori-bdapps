import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { TrustScore, StarRating, VerifiedBadge, PremiumBadge } from '@/components/trust/TrustComponents'
import { Search, ChevronRight, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchResultsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const supabase = createClient()
  const q = resolvedParams.q || ''

  // 1. Fetch matching businesses
  let query = supabase
    .from('businesses')
    .select('*, business_categories(*)')
    .eq('is_active', true)

  if (q.trim()) {
    // Search in name (en), name (bn), sub_category, or slugs
    query = query.or(`name.ilike.%${q}%,name_bn.ilike.%${q}%,sub_category.ilike.%${q}%`)
  }

  const { data: businesses } = await query.limit(20)

  // 2. Fetch some popular businesses as suggestions if results are empty
  const { data: suggestions } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('trust_score', { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-[var(--color-text-muted)] font-brand mb-6">
          <Link href="/" className="hover:text-[var(--color-primary)]">হোম</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text-secondary)] font-medium">অনুসন্ধানের ফলাফল</span>
        </div>

        <div className="space-y-6">
          {/* Query Header */}
          <div className="border-b border-[var(--color-border)] pb-4">
            <h1 className="text-2xl font-brand font-bold text-[var(--color-text-primary)] flex items-center space-x-2">
              <Search className="w-6 h-6 text-[var(--color-primary)]" />
              <span>&ldquo;{q}&rdquo; এর অনুসন্ধানের ফলাফল</span>
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-brand font-medium">
              {(businesses?.length || 0)}টি ব্যবসা প্রতিষ্ঠান খুঁজে পাওয়া গেছে
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businesses && businesses.length > 0 ? (
              businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl hover:shadow-xs hover:border-[var(--color-primary)]/40 transition duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={biz.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                          alt={biz.name}
                          className="w-12 h-12 object-cover rounded-lg border border-[var(--color-border)]"
                        />
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <Link href={`/business/${biz.slug}`} className="font-brand font-bold text-base text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition">
                              {biz.name_bn || biz.name}
                            </Link>
                            {biz.is_premium && <PremiumBadge />}
                            {biz.is_verified && <VerifiedBadge />}
                          </div>
                          <p className="text-[10px] text-[var(--color-text-secondary)] font-brand">
                            {biz.sub_category} &bull; {biz.city}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-brand line-clamp-2">
                      {biz.description_bn || biz.description}
                    </p>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-4 mt-5 flex items-center justify-between">
                    <TrustScore score={biz.trust_score} size="sm" />
                    <Link
                      href={`/business/${biz.slug}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--color-primary)] hover:underline font-brand"
                    >
                      <span>প্রোফাইল দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="md:col-span-2 text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-6 max-w-2xl mx-auto font-brand">
                <div className="space-y-2">
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    কোন ফলাফল খুঁজে পাওয়া যায়নি
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                    দুঃখিত, আপনার দেওয়া নাম বা কী-ওয়ার্ড দিয়ে আমাদের সিস্টেমে কোনো ব্যবসা পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে আবার চেষ্টা করুন।
                  </p>
                </div>

                {/* Suggestions Section */}
                <div className="pt-4 border-t border-[var(--color-border)] max-w-lg mx-auto text-left space-y-4">
                  <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    জনপ্রিয় বিশ্বস্ত ব্যবসা প্রতিষ্ঠানসমূহ:
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {suggestions?.map((biz) => (
                      <Link
                        key={biz.id}
                        href={`/business/${biz.slug}`}
                        className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:shadow-xs transition duration-150 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold">{biz.name_bn || biz.name}</span>
                        <div className="flex items-center space-x-2">
                          <StarRating rating={biz.trust_score} size="sm" />
                          <span className="font-bold text-[var(--color-primary)] font-mono">{biz.trust_score.toFixed(1)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
