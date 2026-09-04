'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useBdapps } from '@/lib/bdapps-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Building2, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, MapPin, Phone, Globe, Mail } from 'lucide-react'

export default function AddBusinessPage() {
  const { user } = useUser()
  const { openSubscribeModal } = useBdapps()
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    category_id: '',
    sub_category: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: 'Dhaka',
    description: '',
    description_bn: '',
    logo_url: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('business_categories').select('*').order('name_en')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Building2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            নতুন ব্যবসা নিবন্ধন করুন
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
            বিশ্বাস প্ল্যাটফর্মে আপনার ব্যবসা লিস্টিং যোগ করতে বিডিঅ্যাপস সাবস্ক্রিপশন দিয়ে সাইন ইন করুন।
          </p>
          <button
            onClick={() => openSubscribeModal()}
            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>বিডিঅ্যাপস সাইন ইন (2.78 BDT/day)</span>
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category_id || !formData.phone) {
      setError('দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।')
      return
    }

    setLoading(true)
    setError(null)

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)

    try {
      const { error: insertErr } = await supabase.from('businesses').insert({
        name: formData.name.trim(),
        name_bn: formData.name_bn.trim() || formData.name.trim(),
        slug: slug,
        category_id: formData.category_id,
        sub_category: formData.sub_category.trim() || 'Business Services',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        description: formData.description.trim(),
        description_bn: formData.description_bn.trim() || formData.description.trim(),
        logo_url: formData.logo_url.trim() || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
        is_verified: false,
        is_claimed: true,
        claimed_by_phone: user.phone,
        trust_score: 5.0,
        total_reviews: 0,
      })

      if (insertErr) {
        setError(insertErr.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/business/${slug}`)
        }, 2000)
      }
    } catch (err: any) {
      console.error(err)
      setError('ব্যবসা যোগ করতে একটি ত্রুটি ঘটেছে।')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
        <Navbar />
        <div className="flex-grow max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            ব্যবসা নিবন্ধিত হয়েছে!
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            আপনার ব্যবসাটি বিশ্বাস প্ল্যাটফর্মে সফলভাবে যোগ করা হয়েছে। অ্যাডমিন প্যানেল থেকে ভেরিফিকেশন প্রক্রিয়া সম্পন্ন হলে ভেরিফাইড ব্যাজ প্রদেয় হবে।
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Business Registration</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
              নতুন ব্যবসা যুক্ত করুন (Add New Business)
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              আপনার ব্যবসার সঠিক তথ্য প্রদান করুন যাতে গ্রাহকরা বিশ্বস্ততার সাথে সেবা গ্রহণ করতে পারে।
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Name EN */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ব্যবসার নাম (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Star Tech & Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Business Name BN */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ব্যবসার নাম (বাংলা)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: স্টার টেক অ্যান্ড ইঞ্জিনিয়ারিং"
                  value={formData.name_bn}
                  onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ক্যাটাগরি *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_bn} ({c.name_en})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub category */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  সাব-ক্যাটাগরি
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer & Gadgets"
                  value={formData.sub_category}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ফোন নম্বর *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="16793 or 017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  অফিশিয়াল ইমেইল
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="info@brand.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ওয়েবসাইট
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://brand.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  ঠিকানা
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Multiplan Center, Elephant Road"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  শহর / বিভাগ
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka, Chittagong, Sylhet"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                ব্যবসার বিবরণ
              </label>
              <textarea
                rows={3}
                placeholder="আপনার ব্যবসার প্রধান সেবা ও পণ্য সম্পর্কে লিখুন..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                লোগো ইমেজ URL (Logo URL)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ব্যবসা জমা দিন ও অ্যাডমিন ভেরিফিকেশনে পাঠান</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
