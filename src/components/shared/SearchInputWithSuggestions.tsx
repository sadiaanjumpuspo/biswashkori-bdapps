'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Search, MapPin, Award, CheckCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface BusinessSuggestion {
  name: string
  name_bn: string | null
  slug: string
  logo_url: string | null
  trust_score: number
  sub_category: string | null
  is_premium: boolean
  is_verified: boolean
}

interface SearchInputWithSuggestionsProps {
  isHero?: boolean
}

export default function SearchInputWithSuggestions({ isHero = false }: SearchInputWithSuggestionsProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<BusinessSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  
  const router = useRouter()
  const locale = useLocale()
  const isEn = locale === 'en'
  const t = useTranslations('common')
  const th = useTranslations('home')
  
  const supabase = createClient()
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('name, name_bn, slug, logo_url, trust_score, sub_category, is_premium, is_verified')
          .or(`name.ilike.%${query}%,name_bn.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(5)

        if (!error && data) {
          setSuggestions(data as BusinessSuggestion[])
          setIsOpen(true)
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err)
      } finally {
        setLoading(false)
      }
    }, 200) // 200ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      // Go directly to highlighted business profile
      router.push(`/business/${suggestions[activeIndex].slug}`)
      setIsOpen(false)
    } else {
      handleSearch(query)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      // +1 to account for the "Search for '{query}'" row at the bottom
      const maxIndex = suggestions.length
      setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const maxIndex = suggestions.length
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  // Helper to color trust scores matching the design system
  const getTrustScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-[#1A6B4A]' // Deep Trust Green
    if (score >= 3.5) return 'text-[#2E8B5E]' // Active Green
    if (score >= 2.5) return 'text-[#D4A017]' // Warm Amber
    return 'text-[#C0392B]' // Alert Red
  }

  return (
    <div ref={containerRef} className="w-full relative">
      {isHero ? (
        /* --- Homepage Hero Search Bar --- */
        <form onSubmit={handleSubmit} className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-1.5 shadow-md focus-within:ring-2 focus-within:ring-[var(--color-primary)]/40 transition duration-200">
          <div className="flex-grow relative pl-4">
            <Search className="absolute left-1 top-2.5 h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(-1)
              }}
              onFocus={() => {
                if (query.trim() && suggestions.length > 0) setIsOpen(true)
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('search_placeholder')}
              autoComplete="off"
              className="w-full pl-6 pr-4 py-2 text-sm bg-transparent border-none outline-hidden focus:ring-0 placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)]"
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition duration-150 flex items-center space-x-1 shadow-xs font-brand cursor-pointer flex-shrink-0"
          >
            <span>{th('search_btn')}</span>
          </button>
        </form>
      ) : (
        /* --- Compact Navbar Search Bar --- */
        <form onSubmit={handleSubmit} className="w-full relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(-1)
              }}
              onFocus={() => {
                if (query.trim() && suggestions.length > 0) setIsOpen(true)
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('search_placeholder')}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-full bg-[var(--color-surface-2)] text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] transition-all duration-200 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[var(--color-text-muted)]" />
          </div>
        </form>
      )}

      {/* --- Suggestions Dropdown --- */}
      {isOpen && (query.trim()) && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-brand">
          <div className="py-1 text-sm text-[var(--color-text-primary)] max-h-96 overflow-y-auto">
            {loading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-[var(--color-text-muted)] flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                <span>{isEn ? "Searching..." : "খোঁজা হচ্ছে..."}</span>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                  {isEn ? "Suggested Businesses" : "প্রস্তাবিত প্রতিষ্ঠানসমূহ"}
                </div>
                
                {suggestions.map((biz, idx) => {
                  const isHighlighted = idx === activeIndex
                  const nameToDisplay = (isEn ? biz.name : (biz.name_bn || biz.name))
                  
                  return (
                    <Link
                      key={biz.slug}
                      href={`/business/${biz.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)]/40 transition duration-150 ${isHighlighted ? 'bg-[var(--color-surface-2)] text-[var(--color-primary)] font-semibold' : 'hover:bg-[var(--color-surface-2)]/60'}`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={biz.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                          alt={biz.name}
                          className="w-8 h-8 object-cover rounded-md border border-[var(--color-border)] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-medium truncate text-sm">{nameToDisplay}</span>
                            {biz.is_premium && (
                              <span title="Premium">
                                <Award className="w-3.5 h-3.5 text-[var(--color-gold)] animate-pulse" />
                              </span>
                            )}
                            {biz.is_verified && (
                              <span title="Verified">
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                            {biz.sub_category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className={`text-xs font-bold font-mono ${getTrustScoreColor(biz.trust_score)}`}>
                          ★ {biz.trust_score.toFixed(1)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </>
            ) : (
              <div className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                {isEn ? "No businesses found" : "কোনো প্রতিষ্ঠান পাওয়া যায়নি"}
              </div>
            )}
            
            {/* Custom Search Link Option */}
            <button
              type="button"
              onClick={() => handleSearch(query)}
              className={`w-full text-left flex items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-2)] border-t border-[var(--color-border)] transition duration-150 ${activeIndex === suggestions.length ? 'bg-[var(--color-surface-2)] font-bold' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5" />
                <span>
                  {isEn ? `Search for "${query}"` : `"${query}" এর জন্য খুঁজুন`}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
