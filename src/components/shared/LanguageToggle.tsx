'use client'

import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

export default function LanguageToggle() {
  const locale = useLocale()
  const { user } = useUser()
  const supabase = createClient()

  const handleToggle = async () => {
    const nextLocale = locale === 'bn' ? 'en' : 'bn'
    
    // 1. Set cookie
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`
    
    // 2. If logged in, update user preferred_language in database
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_language: nextLocale })
        .eq('id', user.id)
    }

    // 3. Reload page to trigger i18n messages change
    window.location.reload()
  }

  return (
    <button
      onClick={handleToggle}
      className="p-1.5 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition duration-150 flex items-center space-x-1 cursor-pointer"
      title={locale === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
    >
      <Globe className="h-4.5 w-4.5" />
      <span className="text-xs font-semibold uppercase">{locale}</span>
    </button>
  )
}
