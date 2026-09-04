'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, FileText, Send, Building, Upload } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { uploadClaimDocument } from '@/lib/storage'

export default function ClaimBusinessPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/business-dashboard/claim')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchUnclaimedBusinesses = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('businesses')
          .select('id, name, name_bn, city')
          .eq('is_claimed', false)
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (fetchError) {
          setError('ব্যবসার তালিকা লোড করতে সমস্যা হয়েছে।')
          console.error(fetchError)
        } else {
          setBusinesses(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetchLoading(false)
      }
    }

    fetchUnclaimedBusinesses()
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Validate file size: 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setError('ফাইলের আকার ১০ মেগাবাইটের বেশি হতে পারবে না।')
        setProofFile(null)
        return
      }
      // Validate file type
      const allowed = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowed.includes(file.type)) {
        setError('শুধুমাত্র PDF, JPG, বা PNG ফাইল আপলোড করুন।')
        setProofFile(null)
        return
      }
      setError(null)
      setProofFile(file)
    }
  }

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!selectedBusinessId) {
      setError('অনুগ্রহ করে একটি ব্যবসা নির্বাচন করুন।')
      return
    }

    if (!proofUrl.trim() && !proofFile) {
      setError('অনুগ্রহ করে আপনার দাবির সপক্ষে প্রমাণের লিংক বা ফাইল আপলোড করুন।')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let finalProofUrl = proofUrl.trim()

      // If a file is selected, upload it first to claim-documents bucket
      if (proofFile) {
        const uploadedPath = await uploadClaimDocument(proofFile, user.id)
        finalProofUrl = uploadedPath // Store the Supabase Storage path
      }

      const { error: claimError } = await supabase
        .from('business_claims')
        .insert({
          business_id: selectedBusinessId,
          user_phone: user.phone,
          proof_document_url: finalProofUrl,
          notes: notes.trim(),
          status: 'pending'
        })

      if (claimError) {
        setError(claimError.message)
      } else {
        setSuccess(true)
        setSelectedBusinessId('')
        setProofUrl('')
        setProofFile(null)
        setNotes('')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'দাবি পেশ করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || fetchLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-surface)] transition-colors duration-200">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Building className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-xs text-[var(--color-text-secondary)] font-brand">লোড হচ্ছে...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] font-brand transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          
          {/* Header */}
          <div className="border-b border-[var(--color-border)] pb-5">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ব্যবসার মালিকানা দাবি করুন</h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              আপনার ব্যবসার প্রোফাইলের মালিকানা নিয়ে ভেরিফাইড ব্যাজ পান, গ্রাহকদের রিভিউর উত্তর দিন এবং পেইড প্রিমিয়াম ফিচারগুলো ব্যবহার করতে দাবি পেশ করুন।
            </p>
          </div>

          {error && (
            <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center space-x-2 text-[var(--color-danger)] text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 p-4 rounded-lg flex items-start space-x-3 text-[var(--color-primary)] text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-base">দাবি সফলভাবে জমা দেওয়া হয়েছে!</span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  আমাদের অ্যাডমিন প্যানেল আপনার প্রমাণের দলিল যাচাই করবে। অনুমোদন হওয়া মাত্রই আপনাকে অবহিত করা হবে এবং আপনার অ্যাকাউন্ট ড্যাশবোর্ড আপডেট হবে।
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleClaimSubmit} className="space-y-5">
            
            {/* Business Selection */}
            <div>
              <label htmlFor="businessSelect" className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                ব্যবসা নির্বাচন করুন / Select Business *
              </label>
              <select
                id="businessSelect"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="block w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
              >
                <option value="">-- দাবি করতে একটি ব্যবসা বেছে নিন --</option>
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.name_bn || biz.name} ({biz.city || 'শহর জানা যায়নি'})
                  </option>
                ))}
              </select>
              {businesses.length === 0 && (
                <p className="text-[10px] text-[var(--color-warning)] mt-1.5">
                  কোনো দাবিহীন সক্রিয় ব্যবসা পাওয়া যায়নি। নতুন ব্যবসার দাবি করতে প্রথমে তা হোমপেজ থেকে বা অ্যাডমিন দ্বারা যুক্ত হতে হবে।
                </p>
              )}
            </div>

            {/* Proof of Ownership (File Upload or URL) */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                  মালিকানার প্রমাণপত্রের দলিল আপলোড করুন / Upload Proof Document *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--color-border)] border-dashed rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/60 transition duration-150 relative">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
                    <div className="flex text-xs text-[var(--color-text-secondary)]">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] focus-within:outline-hidden">
                        <span>একটি ফাইল আপলোড করুন</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                      </label>
                      <p className="pl-1">অথবা টেনে এনে ছেড়ে দিন</p>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      PDF, PNG, JPG (সর্বোচ্চ ১০ মেগাবাইট)
                    </p>
                  </div>
                </div>
                {proofFile && (
                  <div className="mt-2 flex items-center space-x-2 text-xs font-semibold text-[var(--color-primary)]">
                    <FileText className="w-4 h-4" />
                    <span>{proofFile.name} ({(proofFile.size / (1024 * 1024)).toFixed(2)} MB) Selected</span>
                  </div>
                )}
              </div>

              <div className="flex items-center my-3">
                <hr className="flex-grow border-[var(--color-border)]" />
                <span className="px-3 text-xs text-[var(--color-text-muted)] uppercase font-semibold">অথবা / OR</span>
                <hr className="flex-grow border-[var(--color-border)]" />
              </div>

              <div>
                <label htmlFor="proof" className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                  প্রমাণপত্রের গুগল ড্রাইভ বা ক্লাউড লিংক / Proof document Cloud Link
                </label>
                <input
                  id="proof"
                  type="text"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150"
                  placeholder="যেমন: গুগল ড্রাইভ লিংক, ডোমেইন ভেরিফিকেশন তথ্য বা প্রমাণ বিবরণী..."
                />
              </div>
            </div>

            {/* Verification Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                অতিরিক্ত বিবরণ / Additional Notes (ঐচ্ছিক)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] sm:text-xs transition duration-150 leading-relaxed"
                placeholder="অ্যাডমিনের জন্য কোনো বার্তা বা অতিরিক্ত তথ্য থাকলে এখানে লিখুন..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || businesses.length === 0}
                className="inline-flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 px-6 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full justify-center sm:w-auto"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'পেশ করা হচ্ছে...' : 'দাবি পেশ করুন'}</span>
              </button>
            </div>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  )
}
