'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogOut, LayoutDashboard, User as UserIcon, ShieldCheck, Sparkles, AlertTriangle, Menu, X, PlusCircle, Building2 } from 'lucide-react'
import LanguageToggle from '@/components/shared/LanguageToggle'
import ThemeToggle from '@/components/shared/ThemeToggle'
import SearchInputWithSuggestions from '@/components/shared/SearchInputWithSuggestions'
import { useBdapps } from '@/lib/bdapps-context'

export default function Navbar() {
  const { user: bdappsUser, openSubscribeModal, unsubscribe, logout } = useBdapps()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUnsubConfirm, setShowUnsubConfirm] = useState(false)
  const t = useTranslations('common')

  const handleUnsubscribeConfirm = async () => {
    await unsubscribe()
    setShowUnsubConfirm(false)
    setMenuOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] backdrop-blur-md bg-opacity-90 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex flex-col">
              <span className="font-brand font-bold text-xl sm:text-2xl tracking-tight text-[var(--color-primary)]">
                BiswashKori<span className="text-[var(--color-gold)] font-medium">.</span>
              </span>
              <span className="text-[9px] text-[var(--color-text-secondary)] font-medium font-brand -mt-1 tracking-wider leading-none">
                {t('home') === 'Home' ? "Trusted Reviews • bdapps Gateway" : "বিশ্বাসযোগ্য রিভিউ • বিডিঅ্যাপস সেবাদাতা"}
              </span>
            </Link>
          </div>

          {/* Search bar - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-lg">
            <SearchInputWithSuggestions />
          </div>

          {/* Desktop Navigation & Actions */}
          <nav className="hidden md:flex items-center space-x-3">
            <Link
              href="/businesses"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition duration-150"
            >
              {t('businesses')}
            </Link>
            <Link
              href="/businesses/new"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition duration-150"
            >
              <span>+ ব্যবসা যোগ করুন</span>
            </Link>

            <LanguageToggle />
            <ThemeToggle />

            {bdappsUser && bdappsUser.subscriptionStatus === 'REGISTERED' ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-[var(--color-surface-2)] border border-emerald-500/40 bg-emerald-500/10 transition duration-150 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-100" />
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-emerald-600 dark:text-emerald-400 pr-1">
                    {bdappsUser.phone}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl py-2 text-sm text-[var(--color-text-primary)] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[var(--color-border)]">
                      <p className="font-semibold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>bdapps Subscriber</span>
                      </p>
                      <p className="font-bold truncate text-xs mt-0.5">{bdappsUser.phone}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">2.78 BDT / day (Robi / Airtel)</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-[var(--color-surface-2)] transition duration-150"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{t('dashboard')}</span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-[var(--color-surface-2)] transition duration-150"
                    >
                      <UserIcon className="h-4 w-4 text-[var(--color-accent)]" />
                      <span>Edit Profile</span>
                    </Link>

                    <div className="border-t border-[var(--color-border)] my-1 pt-1">
                      {!showUnsubConfirm ? (
                        <button
                          onClick={() => setShowUnsubConfirm(true)}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition duration-150 cursor-pointer text-xs"
                        >
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                          <span>Unsubscribe bdapps</span>
                        </button>
                      ) : (
                        <div className="p-3 m-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
                          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-300">
                            Confirm cancel subscription?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowUnsubConfirm(false)}
                              className="flex-1 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUnsubscribeConfirm}
                              className="flex-1 py-1 bg-rose-600 text-white font-bold rounded text-[11px]"
                            >
                              Unsubscribe
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          logout()
                        }}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 text-slate-500 hover:bg-[var(--color-surface-2)] transition duration-150 cursor-pointer text-xs"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openSubscribeModal()}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-full transition duration-150 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Subscribe (2.78 BDT/day)</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Right Controls: Toggles & Hamburger Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] transition duration-150 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <SearchInputWithSuggestions />
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-4 space-y-3 font-brand animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/businesses"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition"
            >
              <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{t('businesses')}</span>
            </Link>

            <Link
              href="/businesses/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ব্যবসা যোগ করুন (Add Business)</span>
            </Link>

            {bdappsUser && bdappsUser.subscriptionStatus === 'REGISTERED' ? (
              <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{bdappsUser.phone}</p>
                      <p className="text-[10px] text-slate-500">2.78 BDT / day</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">Subscribed</span>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>{t('dashboard')}</span>
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition"
                >
                  <UserIcon className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>Edit Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openSubscribeModal()
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Subscribe via bdapps (2.78 BDT/day)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  )
}
