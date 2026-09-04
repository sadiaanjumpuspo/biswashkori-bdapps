'use client';

import React, { useState } from 'react';
import { useBdapps } from '@/lib/bdapps-context';
import { ShieldCheck, CheckCircle2, Sparkles, AlertTriangle, ArrowRight, PhoneCall } from 'lucide-react';

export function SubscriptionCard() {
  const { user, openSubscribeModal, unsubscribe, isLoading } = useBdapps();
  const [showUnsubConfirm, setShowUnsubConfirm] = useState(false);

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      setShowUnsubConfirm(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>bdapps Gateway Integration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Unlock Paid Reviews & AI Trust Analytics
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Support Bangladeshi businesses and access verified review posting, business claim portals, and AI trust scoring for just{' '}
            <strong className="text-emerald-400 font-bold">2.78 BDT / day</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Robi & Airtel Subscribers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Carrier Direct Billing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant OTP Access</span>
            </div>
          </div>
        </div>

        {/* Subscription Control Card */}
        <div className="w-full md:w-auto shrink-0 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-4">
          <div className="text-center md:text-right">
            <div className="text-2xl font-black text-emerald-400">2.78 BDT <span className="text-xs font-normal text-slate-300">/ day</span></div>
            <div className="text-[11px] text-slate-400">Auto-renewing carrier service</div>
          </div>

          {user?.subscriptionStatus === 'REGISTERED' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Subscription Active ({user.phone})</span>
              </div>

              {!showUnsubConfirm ? (
                <button
                  onClick={() => setShowUnsubConfirm(true)}
                  className="w-full text-center text-xs text-rose-300 hover:text-rose-200 underline pt-1"
                >
                  Unsubscribe Service
                </button>
              ) : (
                <div className="p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-xs text-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Confirm Unsubscribe?</span>
                  </div>
                  <p className="text-[11px] text-rose-200">
                    Unsubscribing will terminate your 2.78 BDT/day subscription and revoke paid review access.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowUnsubConfirm(false)}
                      className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnsubscribe}
                      disabled={isLoading}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px]"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : user?.subscriptionStatus === 'PENDING_CHARGE' ? (
            <div className="space-y-2 text-center">
              <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-300 font-semibold text-xs">
                ⚠️ Payment Pending (2.78 BDT/day)
              </div>
              <button
                onClick={() => openSubscribeModal(user.phone)}
                className="w-full py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                Re-verify Subscription
              </button>
            </div>
          ) : (
            <button
              onClick={() => openSubscribeModal()}
              className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Subscribe Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
