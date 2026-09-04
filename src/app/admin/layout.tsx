'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useBdapps } from '@/lib/bdapps-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { LayoutDashboard, MessageSquare, Building2, ShieldCheck, Loader2, KeyRound, Flag, Sparkles } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useUser()
  const { openSubscribeModal } = useBdapps()
  const pathname = usePathname()

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

  // Not logged in with BDApps
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-6 border border-emerald-500/20">
            <KeyRound className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            bdapps অ্যাডমিন পোর্টাল লগইন
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-md leading-relaxed">
            অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার অনুমোদিত মোবাইল নম্বর <strong>(01878932651)</strong> দিয়ে বিডিঅ্যাপস ওটিপি যাচাই সম্পন্ন করুন।
          </p>

          <div className="mt-6 w-full space-y-3">
            <button
              onClick={() => openSubscribeModal('01878932651')}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>অ্যাডমিন ওটিপি লগইন (01878932651)</span>
            </button>
            <Link
              href="/"
              className="block text-xs font-semibold text-[var(--color-text-secondary)] hover:underline"
            >
              হোমপেজে ফিরে যান
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

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
            আপনার অ্যাকাউন্টটি (<strong>{user.phone}</strong>) সাধারণ ইউজার রোলে রয়েছে। অ্যাডমিন প্যানেলে প্রবেশ করতে অনুমোদিত অ্যাডমিন মোবাইল নম্বর <strong>(01878932651)</strong> দিয়ে লগইন করুন।
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => openSubscribeModal('01878932651')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              অ্যাডমিন নম্বরে স্যুইচ করুন (01878932651)
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              হোমপেজ
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: 'ড্যাশবোর্ড হোম', icon: LayoutDashboard, color: 'text-emerald-500' },
    { href: '/admin/reviews', label: 'রিভিউ মডারেশন', icon: MessageSquare, color: 'text-amber-500' },
    { href: '/admin/flags', label: 'রিপোর্ট ও ফ্ল্যাগ', icon: Flag, color: 'text-rose-500' },
    { href: '/admin/claims', label: 'দাবি ও ভেরিফিকেশন', icon: Building2, color: 'text-teal-500' },
    { href: '/admin/businesses', label: 'ব্যবসা ব্যবস্থাপনা', icon: Building2, color: 'text-blue-500' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Admin Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[var(--color-border)] pb-3">
                <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="font-brand font-bold text-base text-[var(--color-text-primary)]">
                    অ্যাডমিন প্যানেল
                  </h2>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    {user.phone}
                  </p>
                </div>
              </div>
              
              <nav className="flex flex-col space-y-1.5 font-brand text-sm">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition duration-150 font-medium ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shadow-xs'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 min-h-[450px] shadow-sm">
            {children}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  )
}
