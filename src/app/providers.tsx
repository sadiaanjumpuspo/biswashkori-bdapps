'use client'

import { UserProvider } from '@/hooks/useUser'
import { BdappsProvider } from '@/lib/bdapps-context'
import { SubscriptionModal } from '@/components/subscription-modal'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BdappsProvider>
      <UserProvider>
        {children}
        <SubscriptionModal />
      </UserProvider>
    </BdappsProvider>
  )
}
