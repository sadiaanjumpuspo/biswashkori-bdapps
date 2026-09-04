'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useBdapps } from '@/lib/bdapps-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ShieldCheck, Sparkles, Phone, Lock, ArrowRight, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function LoginPage() {
  const { user } = useUser()
  const { checkStatus, loginWithPassword, requestOtp, verifyOtp, saveInitialProfile, error: bdappsError, isLoading } = useBdapps()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [step, setStep] = useState<'phone' | 'password' | 'otp' | 'set_password' | 'success'>('phone')
  const [phoneInput, setPhoneInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('Dhaka, Bangladesh')
  const [localError, setLocalError] = useState<string | null>(null)

  // Auto redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectTarget)
    }
  }, [user, router, redirectTarget])

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneInput.trim()) return
    setLocalError(null)

    const info = await checkStatus(phoneInput)

    if (info.hasPassword) {
      setStep('password')
      return
    }

    if (info.status === 'REGISTERED') {
      setStep('success')
      setTimeout(() => {
        router.push(redirectTarget)
      }, 1500)
      return
    }

    const res = await requestOtp(phoneInput)
    if (res.alreadyRegistered) {
      setStep('success')
      setTimeout(() => {
        router.push(redirectTarget)
      }, 1500)
    } else if (res.success && res.referenceNo) {
      setStep('otp')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordInput.trim()) return
    setLocalError(null)

    const success = await loginWithPassword(passwordInput)
    if (success) {
      setStep('success')
      setTimeout(() => {
        router.push(redirectTarget)
      }, 1200)
    }
  }

  const handleOtpFallback = async () => {
    setLocalError(null)
    const res = await requestOtp(phoneInput)
    if (res.alreadyRegistered || res.success) {
      setStep('otp')
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpInput.trim()) return
    setLocalError(null)

    const res = await verifyOtp(otpInput)
    if (res.success) {
      if (res.isFirstTime) {
        setStep('set_password')
      } else {
        setStep('success')
        setTimeout(() => {
          router.push(redirectTarget)
        }, 1200)
      }
    }
  }

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinCode.trim() || !fullName.trim()) return
    setLocalError(null)

    const success = await saveInitialProfile(pinCode, fullName, location)
    if (success) {
      setStep('success')
      setTimeout(() => {
        router.push(redirectTarget)
      }, 1200)
    }
  }

  const activeError = localError || bdappsError

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
      <Navbar />

      <main className="flex-grow max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-3xl p-8 shadow-xl w-full space-y-6">
          
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
            {step === 'otp' ? <KeyRound className="w-7 h-7" /> : step === 'success' ? <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : <Lock className="w-7 h-7" />}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              BiswashKori সাইন ইন
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {step === 'phone' && 'আপনার রবি বা এয়ারটেল মোবাইল নম্বর দিয়ে সাইন ইন বা সাবস্ক্রাইব করুন।'}
              {step === 'password' && `মোবাইল নম্বর (${phoneInput})-এর একাউন্ট পাসওয়ার্ড দিয়ে সাইন ইন করুন।`}
              {step === 'otp' && `মোবাইল নম্বর (${phoneInput})-এ প্রাপ্ত ৬-ডিজিটের ওটিপি কোড লিখুন।`}
              {step === 'set_password' && 'নতুন একাউন্টের নিরাপত্তা নিশ্চিত করতে পাসওয়ার্ড সেট করুন।'}
              {step === 'success' && 'সাইন ইন সফল হয়েছে! রিডাইরেক্ট করা হচ্ছে...'}
            </p>
          </div>

          {activeError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{activeError}</span>
            </div>
          )}

          {/* STEP 1: Phone Input */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  মোবাইল নম্বর (Robi / Airtel) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="018XXXXXXXX or 88018XXXXXXXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !phoneInput}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>পরবর্তী ধাপে যান</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Password Input */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left font-brand">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1 text-center">
                  একাউন্ট পাসওয়ার্ড / PIN *
                </label>
                <div className="relative max-w-xs mx-auto">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-center text-base font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordInput}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'সাইন ইন সম্পন্ন করুন'
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                <button type="button" onClick={() => setStep('phone')} className="hover:underline">
                  নম্বর পরিবর্তন
                </button>
                <button type="button" onClick={handleOtpFallback} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  পাসওয়ার্ড ভুলে গেছেন? ওটিপি দিয়ে সাইন ইন
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP Input */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4 text-left font-brand">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1 text-center">
                  ৬-ডিজিটের ওটিপি কোড (OTP) *
                </label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpInput.length < 4}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'ওটিপি ভেরিফাই করুন'
                )}
              </button>

              <button type="button" onClick={() => setStep('phone')} className="w-full text-center text-xs text-slate-500 hover:underline">
                নম্বর পরিবর্তন করুন
              </button>
            </form>
          )}

          {/* STEP 4: Set Password */}
          {step === 'set_password' && (
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4 text-left font-brand">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  নতুন পাসওয়ার্ড / PIN *
                </label>
                <input
                  type="password"
                  placeholder="৪-৬ ডিজিটের পিন কোড"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  আপনার নাম (Full Name) *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ঠিকানা / এলাকা
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ধানমন্ডি, ঢাকা"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !pinCode || !fullName}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'পাসওয়ার্ড সংরক্ষণ ও সাইন ইন'
                )}
              </button>
            </form>
          )}

          {/* STEP 5: Success */}
          {step === 'success' && (
            <div className="py-4 space-y-2 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">সাইন ইন সফল হয়েছে!</h3>
              <p className="text-xs text-slate-500">আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...</p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
