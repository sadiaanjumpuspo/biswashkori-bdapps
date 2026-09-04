import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ReviewForm from '@/components/review/ReviewForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function WriteReviewPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = createClient()

  // Fetch business details
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, name_bn, slug')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!business) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="max-w-md mx-auto py-20 text-center space-y-4 font-brand">
          <h1 className="text-2xl font-bold">ব্যবসা প্রতিষ্ঠান পাওয়া যায়নি</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            দুঃখিত, আপনি যে কোম্পানির প্রোফাইলে রিভিউ লিখতে চাচ্ছেন তা আমাদের সিস্টেমে নেই।
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <ReviewForm
          businessId={business.id}
          businessName={business.name_bn || business.name}
          businessSlug={business.slug}
          userId=""
        />
      </main>

      <Footer />
    </div>
  )
}
