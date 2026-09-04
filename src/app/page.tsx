import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { TrustScore, StarRating, VerifiedBadge, PremiumBadge } from '@/components/trust/TrustComponents'
import { ShoppingBag, MapPin, Landmark, Briefcase, Search, ArrowRight, CheckCircle, Shield, Award } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import SearchInputWithSuggestions from '@/components/shared/SearchInputWithSuggestions'
import { SubscriptionCard } from '@/components/subscription-card'

// Icon mapping helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'ShoppingBag':
      return <ShoppingBag className="w-8 h-8 text-[var(--color-primary)]" />
    case 'MapPin':
      return <MapPin className="w-8 h-8 text-[var(--color-primary)]" />
    case 'Landmark':
      return <Landmark className="w-8 h-8 text-[var(--color-primary)]" />
    case 'Briefcase':
      return <Briefcase className="w-8 h-8 text-[var(--color-primary)]" />
    default:
      return <ShoppingBag className="w-8 h-8 text-[var(--color-primary)]" />
  }
}

export const revalidate = 60 // Revalidate home page every minute

export default async function HomePage() {
  const supabase = createClient()
  const t = await getTranslations('home')
  const tc = await getTranslations('common')
  const tcat = await getTranslations('categories')
  const locale = await getLocale()

  // 1. Fetch categories
  const { data: categories } = await supabase
    .from('business_categories')
    .select('*')
    .order('name_en', { ascending: true })

  // 2. Fetch recently reviewed businesses / latest reviews
  const { data: recentReviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      body,
      created_at,
      businesses (
        name,
        name_bn,
        slug,
        logo_url,
        trust_score
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6)

  // 3. Fetch top-trusted premium businesses
  const { data: topTrusted } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('trust_score', { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* --- HERO SECTION --- */}
        <section className="relative bg-linear-to-b from-[var(--color-primary-muted)] to-[var(--color-surface)] py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold font-brand">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t('hero_tagline')}</span>
            </span>
            
            <h1 className="text-4xl md:text-5xl font-brand font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight">
              {locale === 'bn' ? (
                <>বিশ্বাসযোগ্য রিভিউ, <span className="text-[var(--color-primary)]">সঠিক সিদ্ধান্ত</span></>
              ) : (
                <>Trusted Reviews, <span className="text-[var(--color-primary)]">Right Decisions</span></>
              )}
            </h1>
            
            <p className="text-md md:text-lg text-[var(--color-text-secondary)] font-brand max-w-2xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>

            {/* Main Search Bar */}
            <div className="max-w-xl mx-auto pt-4">
              <SearchInputWithSuggestions isHero={true} />
            </div>
          </div>
        </section>

        {/* --- BDAPPS SUBSCRIPTION CARD SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <SubscriptionCard />
        </section>

        {/* --- CATEGORIES SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-brand font-bold text-[var(--color-text-primary)]">
              {t('categories_title')}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] font-brand">
              {t('categories_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((cat) => {
              // category key selection
              let catName = cat.name_en;
              if (cat.slug === 'ecommerce') catName = tcat('ecommerce');
              else if (cat.slug === 'local-services') catName = tcat('local_services');
              else if (cat.slug === 'banking-finance') catName = tcat('banks');
              else if (cat.slug === 'freelancer-agency') catName = tcat('freelancers');

              return (
                <Link
                  key={cat.id}
                  href={`/businesses?category=${cat.slug}`}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary)] p-6 rounded-xl hover:shadow-md transition duration-200 group flex flex-col items-center text-center space-y-4"
                >
                  <div className="p-3 rounded-full bg-[var(--color-primary-muted)] group-hover:scale-110 transition duration-200">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-brand font-bold text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition duration-150">
                      {locale === 'bn' ? cat.name_bn : cat.name_en}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] font-brand uppercase tracking-wider">
                      {cat.name_en}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* --- MOST TRUSTED SECTION --- */}
        <section className="bg-[var(--color-surface-2)] py-16 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h2 className="text-2xl font-brand font-bold text-[var(--color-text-primary)]">
                  {t('top_rated_title')}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] font-brand">
                  {t('top_rated_subtitle')}
                </p>
              </div>
              <Link
                href="/businesses"
                className="flex items-center space-x-1.5 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition duration-150 font-brand"
              >
                <span>{locale === 'bn' ? 'সব দেখুন' : 'View All'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topTrusted?.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/business/${biz.slug}`}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-xs hover:shadow-md hover:border-[var(--color-primary)]/40 transition duration-200 flex flex-col space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <img
                      src={biz.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                      alt={biz.name}
                      className="w-16 h-16 object-cover rounded-lg border border-[var(--color-border)]"
                    />
                    <div className="flex flex-col items-end space-y-1">
                      {biz.is_premium && <PremiumBadge />}
                      {biz.is_verified && <VerifiedBadge />}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-brand font-bold text-[var(--color-text-primary)]">
                      {locale === 'bn' ? biz.name_bn || biz.name : biz.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] font-brand">
                      {biz.sub_category} &bull; {biz.city}
                    </p>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-4 flex items-center justify-between mt-auto">
                    <TrustScore score={biz.trust_score} size="sm" />
                    <div className="flex flex-col items-end">
                      <StarRating rating={biz.trust_score} size="sm" />
                      <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        {locale === 'bn' ? `${biz.total_reviews}টি রিভিউ` : `${biz.total_reviews} reviews`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- RECENT REVIEWS SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-brand font-bold text-[var(--color-text-primary)]">
              {t('recent_reviews_title')}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] font-brand">
              {t('recent_reviews_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReviews?.map((rev: any) => (
              <div
                key={rev.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl flex flex-col justify-between hover:shadow-xs transition duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link href={`/business/${rev.businesses?.slug}`} className="flex items-center space-x-3 group">
                      <img
                        src={rev.businesses?.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                        alt={rev.businesses?.name}
                        className="w-8 h-8 object-cover rounded-md border border-[var(--color-border)]"
                      />
                      <span className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition duration-150">
                        {locale === 'bn' ? rev.businesses?.name_bn || rev.businesses?.name : rev.businesses?.name}
                      </span>
                    </Link>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[var(--color-text-primary)] truncate font-brand">
                      {rev.title}
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed font-brand">
                      &ldquo;{rev.body}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
                  <span>{locale === 'bn' ? 'ভেরিফাইড রিভিউ' : 'Verified Review'}</span>
                  <span>
                    {new Date(rev.created_at).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section className="bg-linear-to-t from-[var(--color-primary-muted)] to-[var(--color-surface)] py-16 border-t border-[var(--color-border)] transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-2xl font-brand font-bold text-[var(--color-text-primary)]">
                {t('how_it_works_title')}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] font-brand">
                {t('how_it_works_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[var(--color-surface)] p-8 rounded-xl border border-[var(--color-border)] text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-brand font-bold text-lg text-[var(--color-text-primary)]">
                  {t('step_1_title')}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-brand">
                  {t('step_1_desc')}
                </p>
              </div>

              <div className="bg-[var(--color-surface)] p-8 rounded-xl border border-[var(--color-border)] text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-brand font-bold text-lg text-[var(--color-text-primary)]">
                  {t('step_2_title')}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-brand">
                  {t('step_2_desc')}
                </p>
              </div>

              <div className="bg-[var(--color-surface)] p-8 rounded-xl border border-[var(--color-border)] text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-brand font-bold text-lg text-[var(--color-text-primary)]">
                  {t('step_3_title')}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-brand">
                  {t('step_3_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
