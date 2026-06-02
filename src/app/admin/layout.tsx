'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { LayoutDashboard, MessageSquare, Building2, ShieldCheck, Loader2, KeyRound, Flag } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/admin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-xs text-[var(--color-text-secondary)] font-brand">অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  // Restrict to admins only
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
        <Navbar />
        <div className="flex-grow max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full mb-6 border border-[var(--color-danger)]/20 animate-pulse">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">প্রবেশাধিকার সংরক্ষিত</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-3 max-w-md leading-relaxed">
            দুঃখিত, এই পেজটি শুধুমাত্র বিশ্বাসকরি প্ল্যাটফর্মের অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত। আপনার এই সেকশনে প্রবেশের অনুমতি নেই।
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150"
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
          
          {/* Admin Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-[var(--color-border)] pb-2.5">
                <KeyRound className="w-4 h-4 text-[var(--color-danger)]" />
                <h2 className="font-brand font-bold text-base text-[var(--color-text-primary)]">
                  অ্যাডমিন প্যানেল
                </h2>
              </div>
              
              <nav className="flex flex-col space-y-1 font-brand text-sm">
                <Link
                  href="/admin"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>ড্যাশবোর্ড হোম</span>
                </Link>

                <Link
                  href="/admin/reviews"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--color-gold)]" />
                  <span>রিভিউ মডারেশন</span>
                </Link>

                <Link
                  href="/admin/flags"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <Flag className="w-4 h-4 text-[var(--color-danger)]" />
                  <span>রিপোর্ট ও ফ্ল্যাগ</span>
                </Link>

                <Link
                  href="/admin/claims"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>দাবি ও ভেরিফিকেশন</span>
                </Link>

                <Link
                  href="/admin/businesses"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <Building2 className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span>ব্যবসা ব্যবস্থাপনা</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 min-h-[400px]">
            {children}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  )
}
