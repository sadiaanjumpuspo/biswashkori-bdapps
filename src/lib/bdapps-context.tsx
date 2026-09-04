'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatBdappsMobile } from './bdapps';
import { createClient } from '@/lib/supabase/client';

export interface BdappsUser {
  phone: string;
  fullName?: string;
  role?: 'user' | 'business_owner' | 'admin';
  subscriptionStatus: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE';
  hasPassword?: boolean;
}

interface BdappsContextType {
  user: BdappsUser | null;
  isLoading: boolean;
  isModalOpen: boolean;
  modalStep: 'phone' | 'confirm' | 'otp' | 'enter_password' | 'set_password' | 'success';
  pendingMobile: string;
  otpReferenceNo: string;
  error: string | null;
  openSubscribeModal: (initialMobile?: string) => void;
  closeSubscribeModal: () => void;
  checkStatus: (mobile: string) => Promise<{ status: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE'; hasPassword: boolean; storedPin?: string; fullName?: string }>;
  loginWithPassword: (password: string) => Promise<boolean>;
  requestOtp: (mobile: string) => Promise<{ success: boolean; referenceNo?: string; alreadyRegistered?: boolean }>;
  verifyOtp: (otp: string) => Promise<{ success: boolean; isFirstTime?: boolean }>;
  saveInitialProfile: (pinCode: string, fullName: string, location: string) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  logout: () => void;
}

const BdappsContext = createContext<BdappsContextType | undefined>(undefined);

export function BdappsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BdappsUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'phone' | 'confirm' | 'otp' | 'enter_password' | 'set_password' | 'success'>('phone');
  const [pendingMobile, setPendingMobile] = useState<string>('');
  const [otpReferenceNo, setOtpReferenceNo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [cachedPin, setCachedPin] = useState<string | null>(null);

  const supabase = createClient();

  // Restore session from localStorage on load
  useEffect(() => {
    try {
      const storedMobile = localStorage.getItem('bishwas_bdapps_mobile');
      const storedStatus = localStorage.getItem('bishwas_bdapps_sub_status') as any;
      const storedName = localStorage.getItem('bishwas_bdapps_name');
      const storedRole = localStorage.getItem('bishwas_bdapps_role') as any;

      if (storedMobile) {
        setUser({
          phone: storedMobile,
          fullName: storedName || 'Robi / Airtel Subscriber',
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

  // 1. Check Subscription Status & Password Existence
  const checkStatus = async (mobile: string): Promise<{ status: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE'; hasPassword: boolean; storedPin?: string; fullName?: string }> => {
    setError(null);
    setIsLoading(true);
    try {
      const formatted = formatBdappsMobile(mobile);
      setPendingMobile(formatted);

      // Check Supabase profiles for existing password/PIN
      let hasPassword = false;
      let storedPin: string | undefined;
      let fullName: string | undefined;

      try {
        const { data: dbProf } = await supabase
          .from('profiles')
          .select('pin_code, full_name')
          .eq('phone', formatted)
          .single();

        if (dbProf && dbProf.pin_code) {
          hasPassword = true;
          storedPin = dbProf.pin_code;
          fullName = dbProf.full_name || undefined;
          setCachedPin(dbProf.pin_code);
        }
      } catch (e) {
        // Profile or pin_code not found
      }

      // Check BDApps API
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

      return { status: subStatus, hasPassword, storedPin, fullName };
    } catch (err: any) {
      setError(err.message || 'Failed to check subscription status.');
      return { status: 'UNREGISTERED', hasPassword: false };
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Login with Password/PIN
  const loginWithPassword = async (password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      let valid = false;
      let targetPhone = pendingMobile;
      let userName = 'BDApps Subscriber';

      if (cachedPin && cachedPin.trim() === password.trim()) {
        valid = true;
      } else {
        const { data: dbProf } = await supabase
          .from('profiles')
          .select('pin_code, full_name, role')
          .eq('phone', targetPhone)
          .single();

        if (dbProf && dbProf.pin_code?.trim() === password.trim()) {
          valid = true;
          userName = dbProf.full_name || userName;
        }
      }

      if (valid) {
        const roleAssigned = (targetPhone === '8801878932651' || targetPhone === '01878932651') ? 'admin' : 'user';
        const newUser: BdappsUser = {
          phone: targetPhone,
          fullName: userName,
          role: roleAssigned,
          subscriptionStatus: 'REGISTERED',
          hasPassword: true,
        };

        setUser(newUser);
        localStorage.setItem('bishwas_bdapps_mobile', targetPhone);
        localStorage.setItem('bishwas_bdapps_sub_status', 'REGISTERED');
        localStorage.setItem('bishwas_bdapps_name', userName);
        setModalStep('success');
        return true;
      } else {
        setError('Incorrect PIN / Password entered. Please try again.');
        return false;
      }
    } catch (err: any) {
      setError('Password validation failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Request OTP via BDApps
  const requestOtp = async (mobile: string): Promise<{ success: boolean; referenceNo?: string; alreadyRegistered?: boolean }> => {
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

      const isAlreadyReg = data.statusCode === 'E1351' || 
                           data.statusDetail?.toLowerCase().includes('already registered') ||
                           data.message?.toLowerCase().includes('already registered');

      if (isAlreadyReg) {
        return { success: true, alreadyRegistered: true };
      }

      if (data.referenceNo) {
        setOtpReferenceNo(data.referenceNo);
        setModalStep('otp');
        return { success: true, referenceNo: data.referenceNo };
      } else {
        setError(data.statusDetail || data.message || 'Failed to send OTP. Please check mobile number.');
        return { success: false };
      }
    } catch (err: any) {
      setError(err.message || 'Network error requesting OTP.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Verify OTP & Check First Time Password Status
  const verifyOtp = async (otp: string): Promise<{ success: boolean; isFirstTime?: boolean }> => {
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
        
        let isFirstTime = false;
        try {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('pin_code, full_name')
            .eq('phone', phone)
            .single();

          if (!dbProfile || !dbProfile.pin_code) {
            isFirstTime = true;
          }
        } catch (e) {
          isFirstTime = true;
        }

        const newUser: BdappsUser = {
          phone,
          fullName: 'Verified BDApps User',
          role: (phone === '8801878932651' || phone === '01878932651') ? 'admin' : 'user',
          subscriptionStatus: 'REGISTERED',
          hasPassword: !isFirstTime,
        };

        setUser(newUser);
        localStorage.setItem('bishwas_bdapps_mobile', phone);
        localStorage.setItem('bishwas_bdapps_sub_status', 'REGISTERED');

        if (isFirstTime) {
          setModalStep('set_password');
        } else {
          setModalStep('success');
        }

        return { success: true, isFirstTime };
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

  // 5. Save Initial Password & Profile Info
  const saveInitialProfile = async (pinCode: string, fullName: string, location: string): Promise<boolean> => {
    if (!pendingMobile && !user?.phone) return false;
    const phone = pendingMobile || user!.phone;
    setError(null);
    setIsLoading(true);

    try {
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          phone: phone,
          pin_code: pinCode.trim(),
          full_name: fullName.trim() || 'BDApps Subscriber',
          display_name: fullName.split(' ')[0] || 'User',
          location: location.trim() || 'Dhaka, Bangladesh',
          subscription_status: 'REGISTERED',
          role: (phone === '8801878932651' || phone === '01878932651') ? 'admin' : 'user',
          updated_at: new Date().toISOString()
        });

      if (upsertErr) {
        console.error('Error saving profile:', upsertErr);
      }

      localStorage.setItem('bishwas_bdapps_name', fullName.trim());
      setUser(prev => prev ? { ...prev, fullName: fullName.trim(), hasPassword: true } : null);
      setModalStep('success');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save profile settings.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Unsubscribe
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

      logout();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error unsubscribing service.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Logout / Clear Session
  const logout = () => {
    setUser(null);
    setCachedPin(null);
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
        otpReferenceNo,
        error,
        openSubscribeModal,
        closeSubscribeModal,
        checkStatus,
        loginWithPassword,
        requestOtp,
        verifyOtp,
        saveInitialProfile,
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
