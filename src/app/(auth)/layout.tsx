import Link from 'next/link'
import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--color-surface)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center group">
          <span className="font-brand font-bold text-3xl tracking-tight text-[var(--color-primary)] transition duration-200 group-hover:text-[var(--color-primary-light)]">
            BiswashKori <span className="text-[var(--color-gold)] font-medium">.</span>
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5 tracking-wider font-brand">
            বিশ্বাসযোগ্য রিভিউ, সঠিক সিদ্ধান্ত
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--color-surface-2)] py-8 px-4 border border-[var(--color-border)] shadow-sm rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  )
}
