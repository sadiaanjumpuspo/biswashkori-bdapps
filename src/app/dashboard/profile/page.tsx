'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { uploadUserAvatar } from '@/lib/storage'
import { AlertCircle, CheckCircle, Save, Upload, User, Loader2 } from 'lucide-react'

export default function EditProfilePage() {
  const { user, profile, refreshProfile } = useUser()
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'bn'>('bn')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setPhone(profile.phone || '')
      setLocation(profile.location || '')
      setPreferredLanguage(profile.preferred_language || 'bn')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAvatarUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const publicUrl = await uploadUserAvatar(file, user.id)
      setAvatarUrl(publicUrl)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'প্রোফাইল পিকচার আপলোড করতে ত্রুটি হয়েছে।')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          phone: phone.trim(),
          location: location.trim(),
          preferred_language: preferredLanguage,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        await refreshProfile()
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setError('প্রোফাইল আপডেট ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">প্রোফাইল সম্পাদন</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          আপনার প্রোফাইলের সাধারণ ও যোগাযোগের তথ্য পরিবর্তন করুন।
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
          <span className="font-medium">প্রোফাইল সফলভাবে আপডেট করা হয়েছে!</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4 max-w-xl">
        
        {/* Avatar Upload */}
        <div className="bg-[var(--color-surface-2)]/50 p-4 rounded-xl border border-[var(--color-border)]/70 flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full border-2 border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-[var(--color-text-muted)]" />
            )}
            {avatarUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-[var(--color-text-secondary)]">প্রোফাইল ছবি (Avatar Image)</span>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center space-x-1.5 bg-[var(--color-primary-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xs transition duration-150 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>{avatarUploading ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন করুন'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                  className="hidden"
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[10px] text-[var(--color-danger)] hover:underline font-bold px-2 py-1"
                >
                  ছবি মুছে ফেলুন
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullname" className="block text-xs font-bold text-[var(--color-text-secondary)]">
            সম্পূর্ণ নাম / Full Name *
          </label>
          <input
            id="fullname"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150"
            placeholder="আবির হাসান"
          />
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayname" className="block text-xs font-bold text-[var(--color-text-secondary)]">
            প্রদর্শনীর নাম / Display Name (ঐচ্ছিক)
          </label>
          <input
            id="displayname"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150"
            placeholder="আবির এইচ."
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-xs font-bold text-[var(--color-text-secondary)]">
            আমার সম্পর্কে / Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150 leading-relaxed"
            placeholder="আপনার সম্পর্কে সংক্ষেপে কিছু লিখুন..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-[var(--color-text-secondary)]">
              মোবাইল নম্বর / Phone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150"
              placeholder="+88017XXXXXXXX"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-xs font-bold text-[var(--color-text-secondary)]">
              লোকেশন / Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150"
              placeholder="মিরপুর, ঢাকা"
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label htmlFor="lang" className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
            পছন্দসই ভাষা / Preferred Language
          </label>
          <select
            id="lang"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'bn')}
            className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
          >
            <option value="bn">বাংলা (Bengali)</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
