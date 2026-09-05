'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * BdappsUser Interface
 * Represents an authenticated subscriber session connected via BDApps gateway.
 */
export interface BdappsUser {
  phone: string;
  fullName: string;
  role: 'user' | 'business_owner' | 'admin';
  subscriptionStatus: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE';
}

/**
 * Context Type Definition
 * Exposes core auth functions, subscription management, and modal states.
 */
interface BdappsContextType {
  user: BdappsUser | null;
  isLoading: boolean;
  isModalOpen: boolean;
  modalStep: 'phone' | 'confirm' | 'otp' | 'success';
  pendingMobile: string;
  error: string | null;
  openSubscribeModal: (initialMobile?: string) => void;
  closeSubscribeModal: () => void;
  checkStatus: (mobile: string) => Promise<{ status: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE' }>;
  requestOtp: (mobile: string) => Promise<{ success: boolean; alreadyRegistered?: boolean; referenceNo?: string }>;
  verifyOtp: (otp: string) => Promise<{ success: boolean }>;
  unsubscribe: () => Promise<boolean>;
  logout: () => void;
}

const BdappsContext = createContext<BdappsContextType | undefined>(undefined);

/**
 * Mobile Number Sanitizer & Formatter
 * Standardizes raw Bangladeshi MSISDN input into international format (e.g., 88018XXXXXXXX).
 */
export function formatBdappsMobile(mobile: string): string {
  let cleaned = mobile.replace(/\D/g, '');
  if (cleaned.startsWith('880')) return cleaned;
  if (cleaned.startsWith('0')) return '88' + cleaned;
  if (cleaned.length === 10) return '880' + cleaned;
  return cleaned;
}

/**
 * BDApps Global Provider
 * Manages carrier billing sessions, OTP verification flow, and local storage state.
 */
export function BdappsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BdappsUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'phone' | 'confirm' | 'otp' | 'success'>('phone');
  const [pendingMobile, setPendingMobile] = useState<string>('');
  const [otpReferenceNo, setOtpReferenceNo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Restore subscriber session from local storage on initial mount
  useEffect(() => {
    try {
      const storedMobile = localStorage.getItem('bishwas_bdapps_mobile');
      const storedStatus = localStorage.getItem('bishwas_bdapps_sub_status') as any;
      const storedName = localStorage.getItem('bishwas_bdapps_name');
      const storedRole = localStorage.getItem('bishwas_bdapps_role') as any;

      if (storedMobile) {
        setUser({
          phone: storedMobile,
          fullName: storedName || 'Robi / Cirkle Subscriber',
          role: storedRole || ((storedMobile === '8801878932651' || storedMobile === '01878932651') ? 'admin' : 'user'),
          subscriptionStatus: storedStatus || 'REGISTERED',
        });
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openSubscribeModal = (initialMobile?: string) => {
    setError(null);
    if (initialMobile) setPendingMobile(initialMobile);
    setModalStep('phone');
    setIsModalOpen(true);
  };

  const closeSubscribeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  /**
   * Check Subscription Status
   * Queries internal API proxy to verify if the subscriber MSISDN is active.
   */
  const checkStatus = async (mobile: string): Promise<{ status: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE' }> => {
    setError(null);
    setIsLoading(true);
    try {
      const formatted = formatBdappsMobile(mobile);
      setPendingMobile(formatted);

      const res = await fetch('/api/bdapps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_subscription', mobile: formatted }),
      });

      const data = await res.json();
      const statusRaw = (data.subscriptionStatus || '').toUpperCase();
      const isAlreadyReg = data.statusCode === 'E1351' || data.statusDetail?.toLowerCase().includes('already registered');

      let subStatus: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE' = 'UNREGISTERED';
      if (statusRaw === 'REGISTERED' || isAlreadyReg) {
        subStatus = 'REGISTERED';
      } else if (statusRaw.includes('PENDING')) {
        subStatus = 'PENDING_CHARGE';
      }

      return { status: subStatus };
    } catch (err: any) {
      setError(err.message || 'Failed to check subscription status.');
      return { status: 'UNREGISTERED' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request OTP Code
   * Triggers BDApps Gateway SMS OTP dispatch to subscriber mobile.
   */
  const requestOtp = async (mobile: string): Promise<{ success: boolean; alreadyRegistered?: boolean; referenceNo?: string }> => {
    setError(null);
    setIsLoading(true);
    try {
      const formatted = formatBdappsMobile(mobile);
      setPendingMobile(formatted);

      const res = await fetch('/api/bdapps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', mobile: formatted }),
      });

      const data = await res.json();

      if (data.alreadyRegistered || data.statusCode === 'E1351') {
        const newUser: BdappsUser = {
          phone: formatted,
          fullName: 'Robi / Cirkle Subscriber',
          role: (formatted === '8801878932651' || formatted === '01878932651') ? 'admin' : 'user',
          subscriptionStatus: 'REGISTERED',
        };
        setUser(newUser);
        localStorage.setItem('bishwas_bdapps_mobile', formatted);
        localStorage.setItem('bishwas_bdapps_sub_status', 'REGISTERED');
        return { success: true, alreadyRegistered: true };
      }

      if (data.referenceNo || data.statusCode === 'S1000') {
        setOtpReferenceNo(data.referenceNo || '');
        setModalStep('otp');
        return { success: true, referenceNo: data.referenceNo };
      }

      setError(data.statusDetail || 'Failed to send OTP to mobile number.');
      return { success: false };
    } catch (err: any) {
      setError(err.message || 'Error triggering BDApps OTP.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify OTP Code
   * Validates subscriber input against BDApps gateway reference payload.
   */
  const verifyOtp = async (otp: string): Promise<{ success: boolean }> => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/bdapps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', otp, referenceNo: otpReferenceNo }),
      });

      const data = await res.json();

      if (data.statusCode === 'S1000' || data.subscriptionStatus === 'REGISTERED' || data.subscriberId) {
        const phone = pendingMobile || formatBdappsMobile(data.subscriberId || '');
        const roleAssigned = (phone === '8801878932651' || phone === '01878932651') ? 'admin' : 'user';

        const newUser: BdappsUser = {
          phone,
          fullName: 'Verified BDApps User',
          role: roleAssigned,
          subscriptionStatus: 'REGISTERED',
        };

        // Persist profile record in Supabase securely
        await supabase
          .from('profiles')
          .upsert({
            phone: phone,
            full_name: 'BDApps Subscriber',
            role: roleAssigned,
            subscription_status: 'REGISTERED',
            updated_at: new Date().toISOString()
          }, { onConflict: 'phone' });

        setUser(newUser);
        localStorage.setItem('bishwas_bdapps_mobile', phone);
        localStorage.setItem('bishwas_bdapps_sub_status', 'REGISTERED');
        setModalStep('success');

        return { success: true };
      } else {
        setError(data.statusDetail || 'Invalid OTP code entered. Please try again.');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'Error verifying OTP.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unsubscribe Service
   * Cancels active carrier subscription via API proxy.
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!user?.phone) return false;
    setError(null);
    setIsLoading(true);
    try {
      await fetch('/api/bdapps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubscribe', mobile: user.phone }),
      });

      setUser(null);
      localStorage.removeItem('bishwas_bdapps_mobile');
      localStorage.removeItem('bishwas_bdapps_sub_status');
      localStorage.removeItem('bishwas_bdapps_name');
      localStorage.removeItem('bishwas_bdapps_role');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout Session
   * Clears local user state and stored auth keys.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bishwas_bdapps_mobile');
    localStorage.removeItem('bishwas_bdapps_sub_status');
    localStorage.removeItem('bishwas_bdapps_name');
    localStorage.removeItem('bishwas_bdapps_role');
  };

  return (
    <BdappsContext.Provider
      value={{
        user,
        isLoading,
        isModalOpen,
        modalStep,
        pendingMobile,
        error,
        openSubscribeModal,
        closeSubscribeModal,
        checkStatus,
        requestOtp,
        verifyOtp,
        unsubscribe,
        logout,
      }}
    >
      {children}
    </BdappsContext.Provider>
  );
}

export function useBdapps() {
  const context = useContext(BdappsContext);
  if (!context) {
    throw new Error('useBdapps must be used within a BdappsProvider');
  }
  return context;
}
