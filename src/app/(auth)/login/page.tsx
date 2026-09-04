'use client'

import React from 'react'
import { useBdapps } from '@/lib/bdapps-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ShieldCheck, Sparkles, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { openSubscribeModal } = useBdapps()

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
      <Navbar />

      <main className="flex-grow max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-3xl p-8 shadow-xl w-full space-y-6">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              BiswashKori সাইন ইন
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              আপনার নিবন্ধিত মোবাইল নম্বর দিয়ে প্রবেশ করুন। অ্যাকাউন্ট পাসওয়ার্ড সেট করা থাকলে সরাসরি পাসওয়ার্ড দিন, অন্যথায় ওটিপি কোড ব্যবহার করুন।
            </p>
          </div>

          <button
            onClick={() => openSubscribeModal()}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে সাইন ইন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
