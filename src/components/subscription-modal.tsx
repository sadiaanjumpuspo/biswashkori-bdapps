'use client';

import React, { useState, useEffect } from 'react';
import { useBdapps } from '@/lib/bdapps-context';
import { ShieldCheck, Phone, KeyRound, CheckCircle2, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SubscriptionModal() {
  const {
    isModalOpen,
    closeSubscribeModal,
    pendingMobile,
    error,
    isLoading,
    checkStatus,
    requestOtp,
    verifyOtp,
  } = useBdapps();

  const [mobileInput, setMobileInput] = useState<string>(pendingMobile || '');
  const [otpInput, setOtpInput] = useState<string>('');
  const [stepState, setStepState] = useState<'phone' | 'otp' | 'success'>('phone');
  const router = useRouter();

  useEffect(() => {
    if (isModalOpen) {
      setMobileInput(pendingMobile || '');
      setStepState('phone');
      setOtpInput('');
    }
  }, [isModalOpen, pendingMobile]);

  if (!isModalOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput.trim()) return;

    const info = await checkStatus(mobileInput);

    if (info.status === 'REGISTERED') {
      setStepState('success');
      setTimeout(() => {
        closeSubscribeModal();
        router.push('/dashboard');
      }, 1500);
      return;
    }

    const res = await requestOtp(mobileInput);

    if (res.alreadyRegistered) {
      setStepState('success');
      setTimeout(() => {
        closeSubscribeModal();
        router.push('/dashboard');
      }, 1500);
    } else if (res.success && res.referenceNo) {
      setStepState('otp');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) return;

    const res = await verifyOtp(otpInput);
    if (res.success) {
      setStepState('success');
      setTimeout(() => {
        closeSubscribeModal();
        router.push('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={closeSubscribeModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">bdapps Subscriber Portal</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Carrier Billing Service • Robi & Cirkle Users
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Phone Input */}
          {stepState === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Mobile Number (Robi / Cirkle)
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="018XXXXXXXX or 88018XXXXXXXX"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Enter your Robi or Cirkle mobile number to receive subscription OTP code.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !mobileInput}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Continue & Send OTP (2.78 BDT/day)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {stepState === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Enter OTP Code
                </h4>
                <p className="text-xs text-slate-500">
                  An SMS containing your verification code was sent to <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{mobileInput}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 text-center">
                  6-Digit OTP Code
                </label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpInput.length < 4}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Verify OTP & Activate'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStepState('phone')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline pt-1"
              >
                Change mobile number
              </button>
            </form>
          )}

          {/* STEP 3: Success */}
          {stepState === 'success' && (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Subscription Verified!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your Robi/Cirkle subscription is active ({mobileInput}). Taking you to the platform...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
