'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useTranslations } from 'next-intl'
import { LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react'
import LanguageToggle from '@/components/shared/LanguageToggle'
import ThemeToggle from '@/components/shared/ThemeToggle'
import SearchInputWithSuggestions from '@/components/shared/SearchInputWithSuggestions'

export default function Navbar() {
  const { user, profile, signOut } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useTranslations('common')

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] backdrop-blur-md bg-opacity-90 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex flex-col">
              <span className="font-brand font-bold text-2xl tracking-tight text-[var(--color-primary)]">
                BishwasKori<span className="text-[var(--color-gold)] font-medium">.</span>
              </span>
              <span className="text-[9px] text-[var(--color-text-secondary)] font-medium font-brand -mt-1 tracking-wider leading-none">
                {t('home') === 'Home' ? "Trusted Reviews, Right Decisions" : "विश्वासযোগ্য রিভিউ, সঠিক সিদ্ধান্ত"}
              </span>
            </Link>
          </div>

          {/* Search bar - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-lg">
            <SearchInputWithSuggestions />
          </div>

          {/* Actions */}
          <nav className="flex items-center space-x-3">
            <Link
              href="/businesses"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition duration-150"
            >
              {t('businesses')}
            </Link>

            {/* Language Switcher */}
            <LanguageToggle />

            {/* Theme Switcher */}
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] transition duration-150 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      (profile?.full_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium pr-1 text-[var(--color-text-secondary)]">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md py-1 text-sm text-[var(--color-text-primary)] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[var(--color-border)]">
                      <p className="font-semibold text-xs text-[var(--color-text-muted)]">
                        {t('home') === 'Home' ? "Active User" : "লগইন করা আইডি"}
                      </p>
                      <p className="font-medium truncate text-xs">{user.email}</p>
                    </div>

                    <Link
                      href={profile?.role === 'business_owner' ? '/business-dashboard' : '/dashboard'}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-[var(--color-surface-2)] transition duration-150"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{t('dashboard')}</span>
                    </Link>

                    {profile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-[var(--color-surface-2)] transition duration-150"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[var(--color-gold)]" />
                        <span>{t('admin_panel')}</span>
                      </Link>
                    )}

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-[var(--color-surface-2)] transition duration-150"
                    >
                      <UserIcon className="h-4 w-4 text-[var(--color-accent)]" />
                      <span>{t('home') === 'Home' ? "Edit Profile" : "প্রোফাইল সম্পাদন"}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        signOut()
                      }}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-[var(--color-danger)]/5 text-[var(--color-danger)] hover:bg-[var(--color-surface-2)] transition duration-150 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition duration-150"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full transition duration-150 shadow-xs"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Search Bar - visible only on mobile */}
        <div className="md:hidden pb-3">
          <SearchInputWithSuggestions />
        </div>

      </div>
    </header>
  )
}
