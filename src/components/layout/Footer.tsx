'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function Footer() {
  const locale = useLocale()
  const isEn = locale === 'en'

  return (
    <footer className="bg-[var(--color-surface-2)] border-t border-[var(--color-border)] mt-auto py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-flex flex-col">
              <span className="font-brand font-bold text-2xl tracking-tight text-[var(--color-primary)]">
                BiswashKori<span className="text-[var(--color-gold)] font-medium">.</span>
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] font-medium font-brand -mt-1 tracking-wider leading-none">
                {isEn ? "Trusted Reviews, Right Decisions" : "বিশ্বাষযোগ্য রিভিউ, সঠিক সিদ্ধান্ত"}
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm font-brand leading-relaxed">
              {isEn 
                ? "BiswashKori is Bangladesh's premier independent business reviews platform. Our goal is to build trusted connections between consumers and local businesses." 
                : "বিশ্বাস করি (BiswashKori) বাংলাদেশের প্রথম ও একমাত্র ডেডিকেটেড ব্যবসা প্রতিষ্ঠান মূল্যায়ন ও রিভিউ প্ল্যাটফর্ম। আমাদের লক্ষ্য ক্রেতা ও বিক্রেতার মাঝে আস্থার সম্পর্ক গড়ে তোলা।"
              }
            </p>
          </div>

          {/* Categories Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-brand mb-4">
              {isEn ? "Popular Categories" : "জনপ্রিয় ক্যাটাগরি"}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link href="/businesses?category=ecommerce" className="hover:text-[var(--color-primary)] transition duration-150 font-brand">
                  {isEn ? "E-commerce Shops" : "ই-কমার্স শপ (E-commerce)"}
                </Link>
              </li>
              <li>
                <Link href="/businesses?category=local-services" className="hover:text-[var(--color-primary)] transition duration-150 font-brand">
                  {isEn ? "Local Services" : "স্থানীয় সেবা (Local Services)"}
                </Link>
              </li>
              <li>
                <Link href="/businesses?category=banking-finance" className="hover:text-[var(--color-primary)] transition duration-150 font-brand">
                  {isEn ? "Banks & Finance" : "ব্যাংক ও আর্থিক সেবা"}
                </Link>
              </li>
              <li>
                <Link href="/businesses?category=freelancer-agency" className="hover:text-[var(--color-primary)] transition duration-150 font-brand">
                  {isEn ? "IT & Agencies" : "আইটি ও এজেন্সি সেবা"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-brand mb-4">
              {isEn ? "Support & Terms" : "সহায়তা ও শর্তাবলী"}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link href="/about" className="hover:text-[var(--color-primary)] transition duration-150 font-brand">
                  {isEn ? "About Us" : "আমাদের সম্পর্কে"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--color-primary)] transition duration-150 font-brand">
                  {isEn ? "Terms of Use" : "ব্যবহারের নিয়মাবলী"}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--color-primary)] transition duration-150 font-brand">
                  {isEn ? "Privacy Policy" : "প্রাইভেসি পলিসি"}
                </Link>
              </li>
              <li>
                <Link href="/business-dashboard/claim" className="hover:text-[var(--color-primary)] transition duration-150 font-brand font-medium text-[var(--color-primary)]">
                  {isEn ? "Claim Your Business" : "আপনার ব্যবসা দাবি করুন"}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-text-muted)]">
          <p className="font-brand">
            &copy; {new Date().getFullYear()} BishwasKori. {isEn ? "All Rights Reserved." : "সর্বস্বত্ব সংরক্ষিত।"}
          </p>
          <p className="mt-2 sm:mt-0">
            Made with ❤️ in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}
