import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { TrustScore, StarRating, VerifiedBadge, PremiumBadge } from '@/components/trust/TrustComponents'
import { Filter, SlidersHorizontal, ChevronRight } from 'lucide-react'
import SortSelect from '@/components/shared/SortSelect'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    rating?: string
    verified?: string
    premium?: string
    q?: string
  }>
}

export default async function BusinessesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const supabase = createClient()

  // 1. Fetch categories for the sidebar filter
  const { data: categories } = await supabase
    .from('business_categories')
    .select('*')
    .order('name_bn', { ascending: true })

  // 2. Fetch businesses based on filters
  let query = supabase
    .from('businesses')
    .select('*, business_categories!inner(*)', { count: 'exact' })
    .eq('is_active', true)

  // Filter: Category
  if (resolvedParams.category) {
    query = query.eq('business_categories.slug', resolvedParams.category)
  }

  // Filter: Rating
  if (resolvedParams.rating) {
    const minRating = parseFloat(resolvedParams.rating)
    query = query.gte('trust_score', minRating)
  }

  // Filter: Verified
  if (resolvedParams.verified === 'true') {
    query = query.eq('is_verified', true)
  }

  // Filter: Premium
  if (resolvedParams.premium === 'true') {
    query = query.eq('is_premium', true)
  }

  // Search Query
  if (resolvedParams.q) {
    query = query.ilike('name', `%${resolvedParams.q}%`)
  }

  // Sorting
  const sort = resolvedParams.sort || 'highest_rated'
  if (sort === 'highest_rated') {
    query = query.order('trust_score', { ascending: false })
  } else if (sort === 'most_reviewed') {
    query = query.order('total_reviews', { ascending: false })
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  }

  const { data: businesses, count } = await query

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-[var(--color-text-muted)] font-brand mb-6">
          <Link href="/" className="hover:text-[var(--color-primary)]">হোম</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text-secondary)] font-medium">সব ব্যবসা প্রতিষ্ঠান</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR FILTERS (Desktop) --- */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-[var(--color-surface-2)] p-5 border border-[var(--color-border)] rounded-xl space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-[var(--color-border)]">
                <Filter className="w-4 h-4 text-[var(--color-primary)]" />
                <h2 className="font-brand font-bold text-md text-[var(--color-text-primary)]">ফিল্টার করুন</h2>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider font-brand">
                  ক্যাটাগরি
                </h3>
                <div className="space-y-1.5 text-sm font-brand">
                  <Link
                    href={`/businesses?${new URLSearchParams({
                      ...resolvedParams,
                      category: ''
                    }).toString()}`}
                    className={`block py-1 hover:text-[var(--color-primary)] transition ${!resolvedParams.category ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                  >
                    সকল ক্যাটাগরি
                  </Link>
                  {categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/businesses?${new URLSearchParams({
                        ...resolvedParams,
                        category: cat.slug
                      }).toString()}`}
                      className={`block py-1 hover:text-[var(--color-primary)] transition ${resolvedParams.category === cat.slug ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                    >
                      {cat.name_bn}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider font-brand">
                  নূন্যতম আস্থা রেটিং
                </h3>
                <div className="space-y-1.5 text-sm font-brand">
                  {[4.5, 3.5, 2.5].map((stars) => (
                    <Link
                      key={stars}
                      href={`/businesses?${new URLSearchParams({
                        ...resolvedParams,
                        rating: resolvedParams.rating === stars.toString() ? '' : stars.toString()
                      }).toString()}`}
                      className={`flex items-center space-x-2 py-1 hover:text-[var(--color-primary)] transition ${resolvedParams.rating === stars.toString() ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                    >
                      <input
                        type="checkbox"
                        checked={resolvedParams.rating === stars.toString()}
                        readOnly
                        className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span>{stars.toFixed(1)} ও তদূর্ধ্ব</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Verification Badges Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider font-brand">
                  অন্যান্য ফিল্টার
                </h3>
                <div className="space-y-2 text-sm font-brand">
                  <Link
                    href={`/businesses?${new URLSearchParams({
                      ...resolvedParams,
                      verified: resolvedParams.verified === 'true' ? '' : 'true'
                    }).toString()}`}
                    className="flex items-center space-x-2 py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={resolvedParams.verified === 'true'}
                      readOnly
                      className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span>ভেরিফাইড ব্যবসা</span>
                  </Link>

                  <Link
                    href={`/businesses?${new URLSearchParams({
                      ...resolvedParams,
                      premium: resolvedParams.premium === 'true' ? '' : 'true'
                    }).toString()}`}
                    className="flex items-center space-x-2 py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={resolvedParams.premium === 'true'}
                      readOnly
                      className="rounded-xs text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span>প্রিমিয়াম পার্টনার</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* --- MAIN BUSINESSES LIST --- */}
          <section className="flex-grow space-y-6">
            
            {/* Header: Count & Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--color-border)] pb-4 gap-4">
              <div>
                <h1 className="text-xl font-brand font-bold text-[var(--color-text-primary)]">
                  সব ব্যবসা প্রতিষ্ঠান
                </h1>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-brand font-medium">
                  {count}টি ব্যবসা খুঁজে পাওয়া গেছে
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-xs font-brand text-[var(--color-text-secondary)]">ক্রমানুসার:</span>
                <SortSelect value={sort} />
              </div>
            </div>

            {/* Business Cards Grid */}
            <div className="space-y-4">
              {businesses && businesses.length > 0 ? (
                businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 p-5 rounded-xl hover:shadow-xs transition duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={biz.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                        alt={biz.name}
                        className="w-16 h-16 object-cover rounded-lg border border-[var(--color-border)] flex-shrink-0"
                      />
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/business/${biz.slug}`} className="text-lg font-brand font-bold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition">
                            {biz.name_bn || biz.name}
                          </Link>
                          {biz.is_premium && <PremiumBadge />}
                          {biz.is_verified && <VerifiedBadge />}
                        </div>

                        <p className="text-xs text-[var(--color-text-secondary)] font-brand">
                          {biz.sub_category} &bull; {biz.city}, {biz.division}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 max-w-xl font-brand leading-relaxed">
                          {biz.description_bn || biz.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-[var(--color-border)] pt-4 md:pt-0 gap-4 flex-shrink-0">
                      <div className="flex items-center space-x-3 md:space-x-0 md:flex-col md:items-end">
                        <TrustScore score={biz.trust_score} size="sm" />
                        <div className="hidden md:flex flex-col items-end mt-1">
                          <StarRating rating={biz.trust_score} size="sm" />
                          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-brand">
                            {biz.total_reviews}টি রিভিউ
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/business/${biz.slug}`}
                        className="px-4 py-2 border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] hover:shadow-xs transition duration-200 font-brand"
                      >
                        প্রোফাইল দেখুন
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-3">
                  <p className="text-[var(--color-text-secondary)] font-brand font-medium">
                    কোন ব্যবসা প্রতিষ্ঠান খুঁজে পাওয়া যায়নি।
                  </p>
                  <Link
                    href="/businesses"
                    className="inline-block text-xs font-semibold text-[var(--color-primary)] hover:underline font-brand"
                  >
                    সকল ফিল্টার রিসেট করুন
                  </Link>
                </div>
              )}
            </div>

          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}
