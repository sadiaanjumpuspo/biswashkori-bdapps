'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBdapps } from '@/lib/bdapps-context'

export interface Profile {
  phone: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  role: 'user' | 'business_owner' | 'admin'
  preferred_language: 'en' | 'bn'
  subscription_status: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE'
  created_at: string
  updated_at: string
}

export interface SyntheticUser {
  id: string
  phone: string
  email: string
}

interface UserContextType {
  user: SyntheticUser | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: bdappsUser, logout: bdappsLogout } = useBdapps()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const activePhone = bdappsUser?.phone

  const isPhoneAdmin = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned === '01878932651' || cleaned === '8801878932651' || cleaned === '8801800000000'
  }

  const fetchOrCreateProfile = async (phone: string) => {
    try {
      // 1. Try to fetch existing profile by phone
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .single()

      if (data) {
        // If phone is admin phone, ensure admin role
        if (isPhoneAdmin(phone) && data.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('phone', phone)
          data.role = 'admin'
        }
        setProfile(data as Profile)
        return
      }

      // 2. Upsert initial profile if not found
      const assignedRole: 'admin' | 'business_owner' | 'user' = isPhoneAdmin(phone)
        ? 'admin'
        : (phone.includes('1911998877') ? 'business_owner' : 'user')

      const newProfile: Partial<Profile> = {
        phone: phone,
        full_name: isPhoneAdmin(phone) ? 'Bishwas Admin' : 'BDApps Subscriber',
        display_name: isPhoneAdmin(phone) ? 'Admin' : 'Subscriber_' + phone.slice(-4),
        role: assignedRole,
        subscription_status: 'REGISTERED',
        location: 'Dhaka, Bangladesh',
        preferred_language: 'bn',
      }

      const { data: inserted } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select('*')
        .single()

      if (inserted) {
        setProfile(inserted as Profile)
      }
    } catch (err) {
      console.error('Failed to sync BDApps user profile:', err)
    }
  }

  const refreshProfile = async () => {
    if (activePhone) {
      await fetchOrCreateProfile(activePhone)
    }
  }

  useEffect(() => {
    if (activePhone) {
      fetchOrCreateProfile(activePhone).finally(() => setLoading(false))
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [activePhone])

  const syntheticUser: SyntheticUser | null = activePhone
    ? {
        id: activePhone,
        phone: activePhone,
        email: `${activePhone}@bdapps.com`,
      }
    : null

  const signOut = async () => {
    setLoading(true)
    bdappsLogout()
    setProfile(null)
    setLoading(false)
  }

  return (
    <UserContext.Provider value={{ user: syntheticUser, profile, loading, refreshProfile, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
