'use client'

import { useState, useEffect } from 'react'
import { Star, ShieldCheck, Award, HelpCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

// --- 1. STAR RATING COMPONENT (FRACTIONAL VIA SVG GRADIENTS) ---
interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({ rating, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const stars = [1, 2, 3, 4, 5]
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  }

  const currentRating = hoverRating !== null ? hoverRating : rating

  return (
    <div className="flex items-center space-x-1 select-none">
      {stars.map((star) => {
        // Calculate the fill percentage for this star
        let fillPercent = 0
        if (currentRating >= star) {
          fillPercent = 100
        } else if (currentRating > star - 1) {
          fillPercent = (currentRating - (star - 1)) * 100
        }

        const gradientId = `star-grad-${star}-${fillPercent.toFixed(0)}-${interactive ? 'int' : 'static'}`

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            onClick={() => onChange && onChange(star)}
            className={`${
              interactive ? 'hover:scale-125 cursor-pointer text-[var(--color-gold)]' : 'cursor-default text-gray-300'
            } transition duration-150 focus:outline-hidden relative flex items-center justify-center`}
          >
            <svg className={sizeClasses[size]} viewBox="0 0 24 24">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset={`${fillPercent}%`} stopColor="var(--color-gold)" />
                  <stop offset={`${fillPercent}%`} stopColor="var(--color-border)" />
                </linearGradient>
              </defs>
              <path
                d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"
                fill={`url(#${gradientId})`}
                stroke={interactive && hoverRating !== null && hoverRating >= star ? "var(--color-gold)" : "none"}
                strokeWidth={0.5}
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

// --- 2. TRUST SCORE CIRCLE COMPONENT ---
interface TrustScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function TrustScore({ score, size = 'md' }: TrustScoreProps) {
  const locale = useLocale()
  const t = useTranslations('business')

  const getScoreColor = (val: number) => {
    if (val >= 4.5) return { text: 'text-[var(--color-primary)]', stroke: 'stroke-[var(--color-primary)]', bg: 'bg-[var(--color-primary-muted)]' }
    if (val >= 3.5) return { text: 'text-[var(--color-primary-light)]', stroke: 'stroke-[var(--color-primary-light)]', bg: 'bg-[var(--color-primary-muted)]' }
    if (val >= 2.5) return { text: 'text-[var(--color-gold)]', stroke: 'stroke-[var(--color-gold)]', bg: 'bg-amber-50 dark:bg-amber-950/20' }
    return { text: 'text-[var(--color-danger)]', stroke: 'stroke-[var(--color-danger)]', bg: 'bg-red-50 dark:bg-red-950/20' }
  }

  const getScoreLabel = (val: number) => {
    if (locale === 'bn') {
      if (val >= 4.5) return 'অসাধারণ'
      if (val >= 3.5) return 'চমৎকার'
      if (val >= 2.5) return 'মোটামুটি'
      if (val >= 1.5) return 'খারাপ'
      return 'অত্যন্ত খারাপ'
    } else {
      if (val >= 4.5) return 'Excellent'
      if (val >= 3.5) return 'Great'
      if (val >= 2.5) return 'Average'
      if (val >= 1.5) return 'Poor'
      return 'Bad'
    }
  }

  const colors = getScoreColor(score)

  // Circular progress specs
  const radius = 24
  const strokeWidth = size === 'lg' ? 4 : 3
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.max(1, Math.min(5, score)) / 5) * circumference

  if (size === 'sm') {
    return (
      <div className={`flex items-center justify-center font-mono font-bold w-10 h-10 text-xs rounded-lg ${colors.text} ${colors.bg} border border-current/20 shadow-xs`}>
        {Number(score).toFixed(1)}
      </div>
    )
  }

  const svgSize = size === 'lg' ? 72 : 56

  return (
    <div className="flex items-center space-x-4 select-none">
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        {/* Background track circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className="stroke-[var(--color-border)] fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle with dynamic offset and color */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className={`${colors.stroke} fill-transparent transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Numerical score center text */}
        <div className={`absolute font-mono font-extrabold ${size === 'lg' ? 'text-xl' : 'text-sm'} ${colors.text}`}>
          {Number(score).toFixed(1)}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
          {locale === 'bn' ? 'আস্থা লেভেল' : 'Trust Tier'}
        </span>
        <span className={`text-md font-bold font-brand leading-tight ${colors.text}`}>
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  )
}

// --- 3. VERIFIED BADGE COMPONENT WITH DYNAMIC TOOLTIP ---
interface VerifiedBadgeProps {
  type?: 'business' | 'review'
}

export function VerifiedBadge({ type = 'business' }: VerifiedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const locale = useLocale()

  const tooltipText = type === 'business'
    ? (locale === 'bn' ? 'এই প্রতিষ্ঠানটির বৈধ কাগজপত্র ও ট্রেড লাইসেন্স অ্যাডমিন দ্বারা যাচাই করা হয়েছে।' : 'This business credentials and ownership have been verified by platform administrators.')
    : (locale === 'bn' ? 'রিভিউ প্রদানকারীর ক্রয় রশিদ অথবা ট্রানজেকশন প্রুফ অ্যাডমিন দ্বারা ভেরিফাই করা হয়েছে।' : 'This reviewer provided authentic receipt or transaction proof verified by administrators.')

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-xs font-semibold font-brand select-none cursor-pointer transition hover:bg-[var(--color-primary)]/10"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>
          {type === 'business'
            ? (locale === 'bn' ? 'ভেরিফাইড ব্যবসা' : 'Verified Business')
            : (locale === 'bn' ? 'ভেরিফাইড রিভিউ' : 'Verified Review')}
        </span>
        <HelpCircle className="w-3 h-3 opacity-60 ml-0.5" />
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150 leading-relaxed">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  )
}

// --- 4. PREMIUM BADGE COMPONENT WITH SHIMMER ANIMATION ---
export function PremiumBadge() {
  const locale = useLocale()

  return (
    <div className="relative overflow-hidden inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[var(--color-gold)] border border-[var(--color-gold)]/20 text-xs font-semibold font-brand select-none">
      <Award className="w-3.5 h-3.5" />
      <span>{locale === 'bn' ? 'প্রিমিয়াম পার্টনার' : 'Premium Partner'}</span>
      
      {/* Premium subtle shimmer effect */}
      <span className="absolute inset-0 block w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
    </div>
  )
}

// --- 5. RATING BREAKDOWN COMPONENT ---
interface RatingBreakdownProps {
  reviews: Array<{ rating: number }>
}

export function RatingBreakdown({ reviews }: RatingBreakdownProps) {
  const locale = useLocale()
  const total = reviews.length

  // Calculate star occurrences
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => {
    const star = Math.floor(r.rating) as 5 | 4 | 3 | 2 | 1
    if (counts[star] !== undefined) counts[star]++
  })

  return (
    <div className="space-y-2.5 w-full select-none">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = counts[star]
        const percentage = total > 0 ? (count / total) * 100 : 0

        return (
          <div key={star} className="flex items-center space-x-3 text-sm">
            <span className="w-8 font-mono text-[var(--color-text-secondary)] text-right font-medium flex items-center justify-end space-x-1">
              <span>{star}</span>
              <Star className="w-3.5 h-3.5 fill-[var(--color-gold)] text-[var(--color-gold)] -mt-0.5" />
            </span>
            <div className="flex-grow h-3 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]">
              <div 
                className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-12 font-mono text-[var(--color-text-secondary)] text-right font-semibold">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

// --- 6. TRUST METER LINEAR TIER COMPONENT ---
export function TrustMeter({ score }: { score: number }) {
  const locale = useLocale()
  
  // Calculate percentage progress on meter (1.0 to 5.0 scaled to 0-100)
  const percent = ((score - 1) / 4) * 100

  return (
    <div className="w-full space-y-2 select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
        <span>{locale === 'bn' ? 'খারাপ' : 'Bad'}</span>
        <span>{locale === 'bn' ? 'মোটামুটি' : 'Average'}</span>
        <span>{locale === 'bn' ? 'অসাধারণ' : 'Excellent'}</span>
      </div>
      <div className="relative h-2 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)] overflow-hidden">
        {/* Color tracks (linear gradient showing trust stages) */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-amber-500 to-[var(--color-primary)] rounded-full transition-all duration-1000" 
          style={{ width: `${Math.max(5, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  )
}
