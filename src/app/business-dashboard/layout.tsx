'use client'

import { useUser } from '@/hooks/useUser'
import { useBdapps } from '@/lib/bdapps-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { LayoutDashboard, MessageSquare, Building2, ShieldAlert, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useUser()
  const { openSubscribeModal } = useBdapps()

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-xs text-[var(--color-text-secondary)] font-brand">লোড হচ্ছে...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Not logged in: Show inline sign-in prompt instead of redirecting to /login page
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Building2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            বিজনেস ড্যাশবোর্ড
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
            আপনার ব্যবসার প্রোফাইল পরিচালনা ও গ্রাহকদের উত্তরের জন্য বিডিঅ্যাপস সাবস্ক্রিপশন সম্পন্ন করুন।
          </p>
          <button
            onClick={() => openSubscribeModal()}
            className="py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>বিডিঅ্যাপস সাইন ইন (2.78 BDT/day)</span>
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  // Ensure role is business_owner or admin
  const isAuthorized = profile?.role === 'business_owner' || profile?.role === 'admin'

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
        <Navbar />
        <div className="flex-grow max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full mb-6 border border-[var(--color-danger)]/20 animate-pulse">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">অ্যাক্সেস অস্বীকার করা হয়েছে</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-3 max-w-md leading-relaxed">
            এই ড্যাশবোর্ডটি শুধুমাত্র ভেরিফাইড ব্যবসার মালিকদের জন্য সংরক্ষিত। যদি আপনার কোনো সক্রিয় ব্যবসা থাকে, তাহলে প্রথমে তার মালিকানা দাবি করুন।
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/business-dashboard/claim"
              className="inline-flex items-center justify-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150"
            >
              <span>মালিকানা দাবি করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] border border-[var(--color-border)] py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150"
            >
              হোমপেজে ফিরে যান
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Business Dashboard Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
              <h2 className="font-brand font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2.5">
                বিজনেস ড্যাশবোর্ড
              </h2>
              
              <nav className="flex flex-col space-y-1 font-brand text-sm">
                <Link
                  href="/business-dashboard"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>ড্যাশবোর্ড হোম</span>
                </Link>

                <Link
                  href="/business-dashboard/profile"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>ব্যবসা সম্পাদনা</span>
                </Link>

                <Link
                  href="/business-dashboard/reviews"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--color-gold)]" />
                  <span>রিভিউসমূহ ও উত্তর</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main className="flex-grow bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 min-h-[400px]">
            {children}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  )
}
