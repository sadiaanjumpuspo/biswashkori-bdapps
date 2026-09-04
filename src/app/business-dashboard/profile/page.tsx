'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { uploadBusinessLogo, uploadBusinessCover } from '@/lib/storage'
import { AlertCircle, CheckCircle, Save, Building, Upload, Image, Trash2, Loader2 } from 'lucide-react'

export default function BusinessProfilePage() {
  const { user } = useUser()
  const [business, setBusiness] = useState<any | null>(null)
  
  // Form fields
  const [name, setName] = useState('')
  const [nameBn, setNameBn] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionBn, setDescriptionBn] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [addressBn, setAddressBn] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [division, setDivision] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [logoUploading, setLogoUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  
  const supabase = createClient()

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    setLogoUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const publicUrl = await uploadBusinessLogo(file, business.slug)
      setLogoUrl(publicUrl)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'লোগো আপলোড করতে ত্রুটি হয়েছে।')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    setCoverUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const publicUrl = await uploadBusinessCover(file, business.slug)
      setCoverUrl(publicUrl)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'কভার ইমেজ আপলোড করতে ত্রুটি হয়েছে।')
    } finally {
      setCoverUploading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    const fetchBusiness = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .eq('claimed_by_phone', user.phone)
          .eq('is_active', true)
          .maybeSingle()

        if (fetchError) {
          setError('ব্যবসার তথ্য লোড করতে ত্রুটি হয়েছে।')
          console.error(fetchError)
        } else if (data) {
          setBusiness(data)
          setName(data.name || '')
          setNameBn(data.name_bn || '')
          setDescription(data.description || '')
          setDescriptionBn(data.description_bn || '')
          setWebsite(data.website || '')
          setEmail(data.email || '')
          setPhone(data.phone || '')
          setAddress(data.address || '')
          setAddressBn(data.address_bn || '')
          setCity(data.city || '')
          setDistrict(data.district || '')
          setDivision(data.division || '')
          setLogoUrl(data.logo_url || '')
          setCoverUrl(data.cover_url || '')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBusiness()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !business) return

    if (!name.trim()) {
      setError('ব্যবসার ইংরেজি নাম বাধ্যতামূলক।')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          name: name.trim(),
          name_bn: nameBn.trim() || null,
          description: description.trim() || null,
          description_bn: descriptionBn.trim() || null,
          website: website.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          address_bn: addressBn.trim() || null,
          city: city.trim() || null,
          district: district.trim() || null,
          division: division.trim() || null,
          logo_url: logoUrl.trim() || null,
          cover_url: coverUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id)
        .eq('claimed_by_phone', user.phone)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setError('ব্যবসার তথ্য সংরক্ষণ ব্যর্থ হয়েছে।')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Building className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4 font-brand">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)] mx-auto" />
        <h2 className="font-bold text-lg text-[var(--color-text-primary)]">কোনো সচল ব্যবসা পাওয়া যায়নি</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">আপনার প্রোফাইলের সাথে ভেরিফাইড কোনো ব্যবসা যুক্ত নেই।</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">ব্যবসার প্রোফাইল সম্পাদনা</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          আপনার ব্যবসার বিবরণ, যোগাযোগের মাধ্যম এবং লোকেশন আপডেট রাখুন যাতে ক্রেতারা আপনাকে সহজেই পেতে পারে।
        </p>
      </div>

      {error && (
        <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-primary)] text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">ব্যবসার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        
        {/* Basic Information */}
        <div className="bg-[var(--color-surface-2)]/50 p-5 rounded-xl border border-[var(--color-border)]/70 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1.5">সাধারণ তথ্য (Basic Info)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* English Name */}
            <div>
              <label htmlFor="bizName" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                ব্যবসার নাম (English) *
              </label>
              <input
                id="bizName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="Business Name"
              />
            </div>

            {/* Bangla Name */}
            <div>
              <label htmlFor="bizNameBn" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                ব্যবসার নাম (বাংলা)
              </label>
              <input
                id="bizNameBn"
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="ব্যবসার নাম বাংলায়"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload Section */}
            <div className="space-y-3 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">
                  ব্যবসার লোগো (Business Logo)
                </label>
                
                {/* Logo Preview and Upload Controls */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="relative w-16 h-16 rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building className="w-6 h-6 text-[var(--color-text-muted)]" />
                    )}
                    {logoUploading && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="inline-flex items-center space-x-1.5 bg-[var(--color-primary-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition duration-150 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{logoUploading ? 'আপলোড হচ্ছে...' : 'লোগো আপলোড'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={logoUploading}
                        className="hidden"
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="block text-[10px] text-[var(--color-danger)] hover:underline font-semibold"
                      >
                        লোগো মুছে ফেলুন
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[var(--color-text-muted)] block mb-1">অথবা সরাসরি লোগো লিংক পেস্ট করুন:</span>
                <input
                  id="logo"
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
            </div>

            {/* Cover Upload Section */}
            <div className="space-y-3 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">
                  ব্যবসার কভার ফটো (Cover Photo)
                </label>
                
                {/* Cover Preview and Upload Controls */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="relative w-28 h-16 rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-6 h-6 text-[var(--color-text-muted)]" />
                    )}
                    {coverUploading && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="inline-flex items-center space-x-1.5 bg-[var(--color-primary-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition duration-150 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{coverUploading ? 'আপলোড হচ্ছে...' : 'কভার আপলোড'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={coverUploading}
                        className="hidden"
                      />
                    </label>
                    {coverUrl && (
                      <button
                        type="button"
                        onClick={() => setCoverUrl('')}
                        className="block text-[10px] text-[var(--color-danger)] hover:underline font-semibold"
                      >
                        কভার মুছে ফেলুন
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[var(--color-text-muted)] block mb-1">অথবা সরাসরি কভার লিংক পেস্ট করুন:</span>
                <input
                  id="cover"
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </div>

          {/* Description (EN) */}
          <div>
            <label htmlFor="desc" className="block text-xs font-bold text-[var(--color-text-secondary)]">
              ব্যবসার বিবরণ (English Description)
            </label>
            <textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150 leading-relaxed"
              placeholder="Describe your business in English..."
            />
          </div>

          {/* Description (BN) */}
          <div>
            <label htmlFor="descBn" className="block text-xs font-bold text-[var(--color-text-secondary)]">
              ব্যবসার বিবরণ (বাংলা বিবরণ)
            </label>
            <textarea
              id="descBn"
              rows={3}
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150 leading-relaxed"
              placeholder="বাংলায় আপনার ব্যবসার বিবরণ ও গ্রাহক সেবা সম্পর্কে লিখুন..."
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[var(--color-surface-2)]/50 p-5 rounded-xl border border-[var(--color-border)]/70 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1.5">যোগাযোগের তথ্য (Contact Info)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Website */}
            <div>
              <label htmlFor="web" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                ওয়েবসাইট লিংক (Website)
              </label>
              <input
                id="web"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="https://yourbusiness.com"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                ইমেইল এড্রেস (Email)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="info@yourbusiness.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                মোবাইল/ফোন নম্বর (Phone)
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="+8801XXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="bg-[var(--color-surface-2)]/50 p-5 rounded-xl border border-[var(--color-border)]/70 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-1.5">ঠিকানা ও লোকেশন (Location)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                শহর (City)
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="Dhaka"
              />
            </div>

            {/* District */}
            <div>
              <label htmlFor="district" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                জেলা (District)
              </label>
              <input
                id="district"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="Dhaka"
              />
            </div>

            {/* Division */}
            <div>
              <label htmlFor="division" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                বিভাগ (Division)
              </label>
              <input
                id="division"
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="Dhaka"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Address (EN) */}
            <div>
              <label htmlFor="addr" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                বিস্তারিত ঠিকানা (English Address)
              </label>
              <input
                id="addr"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="e.g. House 12, Road 5, Mirpur 10"
              />
            </div>

            {/* Address (BN) */}
            <div>
              <label htmlFor="addrBn" className="block text-xs font-bold text-[var(--color-text-secondary)]">
                বিস্তারিত ঠিকানা (বাংলা ঠিকানা)
              </label>
              <input
                id="addrBn"
                type="text"
                value={addressBn}
                onChange={(e) => setAddressBn(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
                placeholder="যেমন: বাড়ি ১২, রোড ৫, মিরপুর ১০"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
