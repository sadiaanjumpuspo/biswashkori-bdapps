'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, Clock, Check, X, ShieldCheck, ShieldAlert, Award, Star } from 'lucide-react'

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggleLoading, setToggleLoading] = useState<{ [bizId: string]: boolean }>({})
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const fetchBusinesses = async () => {
    try {
      let query = supabase
        .from('businesses')
        .select('*, business_categories(name_en, name_bn)')
        .order('name', { ascending: true })

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,name_bn.ilike.%${search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error(fetchError)
        setError('ব্যবসার তালিকা লোড করতে সমস্যা হয়েছে।')
      } else {
        setBusinesses(data || [])
      }
    } catch (err) {
      console.error(err)
      setError('ডাটাবেজ কানেকশন ত্রুটি।')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const handleToggleVerified = async (bizId: string, currentStatus: boolean) => {
    setToggleLoading(prev => ({ ...prev, [bizId]: true }))
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          is_verified: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bizId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess('ব্যবসার ভেরিফিকেশন স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!')
        await fetchBusinesses()
      }
    } catch (err) {
      console.error(err)
      setError('ভেরিফিকেশন টগল করতে সমস্যা হয়েছে।')
    } finally {
      setToggleLoading(prev => ({ ...prev, [bizId]: false }))
    }
  }

  const handleTogglePremium = async (bizId: string, currentStatus: boolean) => {
    setToggleLoading(prev => ({ ...prev, [bizId]: true }))
    setError(null)
    setSuccess(null)

    const now = new Date()
    const premiumUntil = !currentStatus 
      ? new Date(now.setMonth(now.getMonth() + 12)).toISOString() // 1 year extension
      : null

    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          is_premium: !currentStatus,
          premium_until: premiumUntil,
          updated_at: new Date().toISOString()
        })
        .eq('id', bizId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess('ব্যবসার প্রিমিয়াম সাবস্ক্রিপশন স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!')
        await fetchBusinesses()
      }
    } catch (err) {
      console.error(err)
      setError('প্রিমিয়াম টগল করতে সমস্যা হয়েছে।')
    } finally {
      setToggleLoading(prev => ({ ...prev, [bizId]: false }))
    }
  }

  // Filter local businesses for fast typing feedback
  const filteredBusinesses = businesses.filter((biz) => {
    const q = search.toLowerCase()
    return (
      biz.name?.toLowerCase().includes(q) ||
      biz.name_bn?.toLowerCase().includes(q) ||
      biz.city?.toLowerCase().includes(q)
    )
  })

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">ব্যবসা তালিকা ও স্ট্যাটাস</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            সিস্টেমের সমস্ত ব্যবসার ভেরিফাইড এবং প্রিমিয়াম ব্যাজ স্ট্যাটাস সরাসরি তদারকি করুন।
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ব্যবসা বা শহর দিয়ে খুঁজুন..."
          className="block w-full sm:w-64 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-2)] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] sm:text-xs transition duration-150"
        />
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

      {/* Businesses Grid */}
      <div className="space-y-4">
        {filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-xl space-y-4 hover:shadow-xs transition duration-150"
            >
              
              {/* Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={biz.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc"}
                    alt={biz.name}
                    className="w-12 h-12 object-cover rounded-md border border-[var(--color-border)] mt-0.5 flex-shrink-0 bg-white"
                  />
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                        {biz.name_bn || biz.name}
                      </h3>
                      {biz.name_bn && (
                        <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">({biz.name})</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                      <span className="text-[9px] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded font-semibold border border-[var(--color-border)]">
                        {biz.business_categories?.name_bn || 'ক্যাটাগরি'}
                      </span>
                      <span className="text-[9px] text-[var(--color-text-secondary)]">
                        &bull; {biz.city || 'লোকেশন অজানা'}
                      </span>
                      <span className="text-[9px] text-[var(--color-text-secondary)]">
                        &bull; ট্রাস্ট স্কোর: <strong className="font-mono text-[var(--color-text-primary)]">{biz.trust_score || '0.0'}</strong> ({biz.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges indicators */}
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {biz.is_claimed ? (
                    <span className="bg-[var(--color-primary-muted)] text-[var(--color-primary)] text-[9px] px-2 py-0.5 rounded-full font-bold border border-[var(--color-primary)]/10">
                      Claimed
                    </span>
                  ) : (
                    <span className="bg-[var(--color-text-muted)]/10 text-[var(--color-text-secondary)] text-[9px] px-2 py-0.5 rounded-full font-bold">
                      Unclaimed
                    </span>
                  )}

                  {biz.is_verified ? (
                    <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[9px] px-2 py-0.5 rounded-full font-bold border border-[var(--color-gold)]/20 flex items-center space-x-0.5">
                      <Award className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : null}

                  {biz.is_premium ? (
                    <span className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-[9px] px-2 py-0.5 rounded-full font-bold border border-[var(--color-accent)]/10 flex items-center space-x-0.5">
                      <Star className="w-3 h-3 text-[var(--color-accent)]" />
                      <span>Premium</span>
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Action Toggles */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]/50 items-center justify-between">
                
                {/* Contact Email/Phone helper */}
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  ইমেইল: {biz.email || 'N/A'} | ওয়েবসাইট: {biz.website || 'N/A'}
                </span>

                <div className="flex items-center space-x-2">
                  {/* Verification Toggle */}
                  <button
                    type="button"
                    disabled={toggleLoading[biz.id]}
                    onClick={() => handleToggleVerified(biz.id, !!biz.is_verified)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition duration-150 cursor-pointer ${
                      biz.is_verified
                        ? 'bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20 text-[var(--color-danger)] border border-[var(--color-danger)]/15'
                        : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white'
                    }`}
                  >
                    {biz.is_verified ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>ভেরিফিকেশন সরান</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ভেরিফাই করুন</span>
                      </>
                    )}
                  </button>

                  {/* Premium Toggle */}
                  <button
                    type="button"
                    disabled={toggleLoading[biz.id]}
                    onClick={() => handleTogglePremium(biz.id, !!biz.is_premium)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition duration-150 cursor-pointer ${
                      biz.is_premium
                        ? 'bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20 text-[var(--color-danger)] border border-[var(--color-danger)]/15'
                        : 'bg-[var(--color-accent-light)] hover:bg-[var(--color-accent-light)]/95 text-white'
                    }`}
                  >
                    {biz.is_premium ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>প্রিমিয়াম বাতিল</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>প্রিমিয়াম করুন</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">কোনো ব্যবসা পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

    </div>
  )
}
