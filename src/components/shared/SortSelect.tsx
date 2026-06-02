'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  value: string
}

export default function SortSelect({ value }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="text-xs border border-[var(--color-border)] rounded-md px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[var(--color-primary)] font-brand cursor-pointer"
    >
      <option value="highest_rated">আস্থার হার (সর্বোচ্চ)</option>
      <option value="most_reviewed">রিভিউ সংখ্যা (সর্বোচ্চ)</option>
      <option value="newest">নতুন তালিকাভুক্ত</option>
    </select>
  )
}
