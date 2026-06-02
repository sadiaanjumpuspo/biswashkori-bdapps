import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { TrustScore, StarRating, VerifiedBadge, PremiumBadge, RatingBreakdown } from '@/components/trust/TrustComponents'
import { MapPin, Globe, Mail, Phone, Calendar, CheckCircle } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import ReviewCard from '@/components/review/ReviewCard'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BusinessProfilePage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = createClient()
  
  const tb = await getTranslations('business')
  const tc = await getTranslations('common')
  const tr = await getTranslations('review')
  const locale = await getLocale()
  const isBn = locale === 'bn'

  // Fetch current user if logged in
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id

  // 1. Fetch business details
  const { data: business } = await supabase
    .from('businesses')
    .select('*, business_categories(*)')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!business) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="max-w-md mx-auto py-20 text-center space-y-4 font-brand">
          <h1 className="text-2xl font-bold">
            {isBn ? 'ব্যবসায়িক প্রোফাইল পাওয়া যায়নি' : 'Business Profile Not Found'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isBn 
              ? 'দুঃখিত, আপনি যে কোম্পানির প্রোফাইল খুঁজছেন তা আমাদের সিস্টেমে নেই।' 
              : 'Sorry, the business profile you are looking for does not exist in our system.'}
          </p>
          <Link href="/businesses" className="inline-block px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-lg">
            {tc('back')}
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // 2. Fetch reviews (approved reviews only)
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        is_verified
      ),
      business_replies (*)
    `)
    .eq('business_id', business.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  
  const totalReviewsCount = reviews?.length || 0

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* --- BUSINESS HEADER SECTION --- */}
      <section className="bg-linear-to-b from-[var(--color-primary-muted)] to-[var(--color-surface)] border-b border-[var(--color-border)] py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            
            {/* Logo and Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <img
                src={business.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                alt={business.name}
                className="w-24 h-24 object-cover rounded-2xl border border-[var(--color-border)] shadow-xs bg-white"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl font-brand font-extrabold text-[var(--color-text-primary)]">
                    {isBn ? business.name_bn || business.name : business.name}
                  </h1>
                  {business.is_premium && <PremiumBadge />}
                  {business.is_verified && <VerifiedBadge />}
                </div>

                <p className="text-sm font-brand text-[var(--color-text-secondary)] font-medium">
                  {business.sub_category} &bull; {isBn ? business.business_categories?.name_bn : business.business_categories?.name_en}
                </p>

                <div className="flex items-center space-x-2 text-xs text-[var(--color-text-secondary)] font-brand">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>{isBn ? business.address_bn || business.address : business.address}, {business.city}</span>
                </div>

                {/* Claim details */}
                <div className="pt-1.5 flex items-center space-x-2">
                  {business.is_claimed ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--color-primary)] font-brand">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{tb('claimed_by_owner')}</span>
                    </span>
                  ) : (
                    <Link
                      href={`/business-dashboard/claim?id=${business.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--color-accent)] hover:underline font-brand"
                    >
                      <span>{isBn ? 'এই ব্যবসা প্রতিষ্ঠানটি কি আপনার? দাবি করুন' : 'Do you own this business? Claim it now'}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Score Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-xs gap-4 flex-shrink-0">
              <TrustScore score={business.trust_score} size="md" />
              <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-[var(--color-border)] pt-3 sm:pt-0 sm:pl-4">
                <StarRating rating={business.trust_score} size="sm" />
                <span className="text-xs font-brand text-[var(--color-text-secondary)] mt-1.5 font-semibold">
                  {isBn ? `${business.total_reviews}টি অনুমোদিত রিভিউ` : `${business.total_reviews} approved reviews`}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CONTENT TABS SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT HAND SIDE: REVIEWS LIST (Col span 2) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Write Review CTA */}
            <div className="bg-[var(--color-surface-2)] p-6 border border-[var(--color-border)] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-brand font-bold text-lg text-[var(--color-text-primary)]">
                  {isBn ? 'আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share your own experience'}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] font-brand">
                  {isBn ? 'এই কোম্পানির সাথে আপনার লেনদেন বা ব্যবহার কেমন ছিল?' : 'How was your latest transaction or experience with them?'}
                </p>
              </div>
              <Link
                href={`/business/${business.slug}/review`}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition duration-150 font-brand shadow-xs flex-shrink-0 cursor-pointer"
              >
                {tb('write_review')}
              </Link>
            </div>

            {/* Reviews Section Title */}
            <div className="space-y-4">
              <h2 className="font-brand font-bold text-xl text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                {isBn ? `গ্রাহক মূল্যায়নসমূহ (${totalReviewsCount})` : `Customer Reviews (${totalReviewsCount})`}
              </h2>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <ReviewCard key={rev.id} review={rev} currentUserId={currentUserId} />
                  ))
                ) : (
                  <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl font-brand">
                    <p className="text-[var(--color-text-secondary)]">
                      {tb('no_reviews')}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* --- RIGHT HAND SIDE: SIDEBAR METRICS & BREAKDOWN --- */}
          <div className="space-y-6">
            
            {/* Rating Breakdown Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-5">
              <h3 className="font-brand font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                {isBn ? 'রেটিং বিশ্লেষণ' : 'Rating Distribution'}
              </h3>

              {reviews && <RatingBreakdown reviews={reviews} />}
            </div>

            {/* About / Company Description Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
              <h3 className="font-brand font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                {tb('about')}
              </h3>
              <p className="text-sm font-brand text-[var(--color-text-secondary)] leading-relaxed">
                {isBn ? business.description_bn || business.description : business.description}
              </p>
            </div>

            {/* Contact Details Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
              <h3 className="font-brand font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                {tb('contact')}
              </h3>

              <div className="space-y-3.5 text-xs text-[var(--color-text-secondary)] font-brand">
                {business.website && (
                  <div className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] hover:underline truncate">
                      {business.website}
                    </a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span className="truncate">{business.email}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center space-x-2.5">
                    <Phone className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{business.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                  <span>
                    {isBn 
                      ? `তালিকাভুক্তির তারিখ: ${new Date(business.created_at).toLocaleDateString('bn-BD')}` 
                      : `Listed on: ${new Date(business.created_at).toLocaleDateString('en-US')}`}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
