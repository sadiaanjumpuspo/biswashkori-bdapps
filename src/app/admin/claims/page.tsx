'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { AlertCircle, CheckCircle, Clock, Check, XCircle, ExternalLink, FileText } from 'lucide-react'

export default function ClaimModerationPage() {
  const { user: adminUser } = useUser()
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{ [claimId: string]: boolean }>({} )
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const fetchPendingClaims = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('business_claims')
        .select('*, businesses(name, name_bn)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (fetchError) {
        console.error(fetchError)
        setError('পেন্ডিং দাবি লোড করতে সমস্যা হয়েছে। RLS পলিসি বা SQL চেক করুন।')
      } else {
        setClaims(data || [])
      }
    } catch (err) {
      console.error(err)
      setError('ডাটাবেজ কানেকশন ত্রুটি।')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingClaims()
  }, [])

  const handleApprove = async (claim: any) => {
    if (!adminUser) return
    setActionLoading(prev => ({ ...prev, [claim.id]: true }))
    setError(null)
    setSuccess(null)

    const now = new Date().toISOString()

    try {
      // 1. Update business_claims
      const { error: claimError } = await supabase
        .from('business_claims')
        .update({
          status: 'approved',
          reviewed_by_phone: adminUser.phone,
          reviewed_at: now
        })
        .eq('id', claim.id)

      if (claimError) {
        setError(`দাবি আপডেট ব্যর্থ: ${claimError.message}`)
        return
      }

      // 2. Update businesses
      const { error: bizError } = await supabase
        .from('businesses')
        .update({
          is_claimed: true,
          claimed_by_phone: claim.user_phone,
          claimed_at: now
        })
        .eq('id', claim.business_id)

      if (bizError) {
        setError(`ব্যবসা আপডেট ব্যর্থ: ${bizError.message}`)
        return
      }

      // 3. Update profiles (set role to business_owner)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'business_owner',
          updated_at: now
        })
        .eq('phone', claim.user_phone)

      if (profileError) {
        setError(`ইউজার প্রোফাইল রোল আপডেট ব্যর্থ: ${profileError.message}`)
        return
      }

      setSuccess('দাবি সফলভাবে অনুমোদন করা হয়েছে! মালিককে বিজনেস রোল প্রদান করা হয়েছে।')
      await fetchPendingClaims()
    } catch (err) {
      console.error(err)
      setError('অ্যাপ্রুভাল প্রক্রিয়ায় একটি সমস্যা হয়েছে।')
    } finally {
      setActionLoading(prev => ({ ...prev, [claim.id]: false }))
    }
  }

  const handleReject = async (claim: any) => {
    if (!adminUser) return
    setActionLoading(prev => ({ ...prev, [claim.id]: true }))
    setError(null)
    setSuccess(null)

    try {
      const { error: rejectError } = await supabase
        .from('business_claims')
        .update({
          status: 'rejected',
          reviewed_by_phone: adminUser.phone,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', claim.id)

      if (rejectError) {
        setError(rejectError.message)
      } else {
        setSuccess('দাবিটি প্রত্যাখ্যান করা হয়েছে।')
        await fetchPendingClaims()
      }
    } catch (err) {
      console.error(err)
      setError('দাবি প্রত্যাখ্যান প্রক্রিয়ায় সমস্যা হয়েছে।')
    } finally {
      setActionLoading(prev => ({ ...prev, [claim.id]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Clock className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-brand">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">মালিকানা দাবি যাচাইকরণ</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          ব্যবহারকারীদের পেশ করা ব্যবসার প্রমাণ ও লাইসেন্সপত্র যাচাই করে অনুমোদন বা বাতিল করুন।
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
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Claims List */}
      <div className="space-y-4">
        {claims.length > 0 ? (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl space-y-4 hover:shadow-xs transition duration-150"
            >
              
              {/* Header: Business & User */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-bold">দাবি করা ব্যবসা:</span>
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">
                    {claim.businesses?.name_bn || claim.businesses?.name}
                  </span>
                </div>
                
                <div className="sm:text-right">
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-bold">দাবিদার ইউজার:</span>
                  <span className="font-bold text-xs text-[var(--color-text-secondary)] font-mono">
                    {claim.user_phone}
                  </span>
                </div>
              </div>

              {/* Proof link and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Proof url */}
                <div className="bg-[var(--color-surface-2)]/50 p-4 rounded-lg border border-[var(--color-border)]/50 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--color-text-muted)] block font-bold uppercase">মালিকানার প্রমাণ (Proof URL)</span>
                    <p className="text-xs text-[var(--color-text-primary)] mt-1 truncate font-mono">
                      {claim.proof_document_url}
                    </p>
                  </div>
                  {claim.proof_document_url?.startsWith('http') && (
                    <a
                      href={claim.proof_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-[10px] font-semibold text-[var(--color-primary)] hover:underline mt-2 self-start bg-[var(--color-primary-muted)] px-2.5 py-1 rounded"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>প্রমাণপত্র দেখতে ক্লিক করুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Sender notes */}
                <div className="bg-[var(--color-surface-2)]/50 p-4 rounded-lg border border-[var(--color-border)]/50 space-y-1">
                  <span className="text-[10px] text-[var(--color-text-muted)] block font-bold uppercase">দাবিদারের নোটস (Sender Notes)</span>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                    {claim.notes ? `"${claim.notes}"` : 'কোনো বার্তা দেওয়া হয়নি।'}
                  </p>
                </div>

              </div>

              {/* Moderation Actions */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  disabled={actionLoading[claim.id]}
                  onClick={() => handleApprove(claim)}
                  className="inline-flex items-center space-x-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>অনুমোদন করুন</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading[claim.id]}
                  onClick={() => handleReject(claim)}
                  className="inline-flex items-center space-x-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-danger)]/15 border border-[var(--color-border)] hover:border-[var(--color-danger)]/20 text-[var(--color-text-primary)] hover:text-[var(--color-danger)] px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>প্রত্যাখ্যান করুন</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-2">
            <CheckCircle className="w-10 h-10 text-[var(--color-primary)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">মালিকানা দাবির কোনো আবেদন পেন্ডিং নেই!</p>
            <p className="text-xs text-[var(--color-text-secondary)]">সকল দাবিদার আবেদনসমূহ সফলভাবে নিষ্পত্তি হয়েছে।</p>
          </div>
        )}
      </div>

    </div>
  )
}
