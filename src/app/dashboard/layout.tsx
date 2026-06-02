'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { LayoutDashboard, MessageSquare, UserCog, Settings, Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-xs text-[var(--color-text-secondary)] font-brand">ড্যাশবোর্ড লোড হচ্ছে...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Dashboard Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
              <h2 className="font-brand font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2.5">
                ইউজার ড্যাশবোর্ড
              </h2>
              
              <nav className="flex flex-col space-y-1 font-brand text-sm">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>ড্যাশবোর্ড হোম</span>
                </Link>

                <Link
                  href="/dashboard/reviews"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>আমার রিভিউসমূহ</span>
                </Link>

                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <UserCog className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>প্রোফাইল সম্পাদন</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition duration-150"
                >
                  <Settings className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span>পাসওয়ার্ড পরিবর্তন</span>
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
