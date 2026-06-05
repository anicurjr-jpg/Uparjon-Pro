/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Crown, Star, Sparkles, Check, AlertTriangle, ShieldCheck, 
  Flame, Lock, Cpu, Landmark, Loader2 
} from 'lucide-react';
import { UserStats, MembershipTier } from '../types';
import { MEMBERSHIPS_CONFIGS } from '../data/memberships';
import { motion, AnimatePresence } from 'motion/react';

interface MembershipPortalProps {
  stats: UserStats;
  onUpgradeTier: (tier: MembershipTier) => void;
  onNavigateTab: (tab: 'deposit') => void;
}

export default function MembershipPortal({ stats, onUpgradeTier, onNavigateTab }: MembershipPortalProps) {
  const configs = Object.values(MEMBERSHIPS_CONFIGS);
  
  // Checkout simulate states
  const [checkoutTier, setCheckoutTier] = useState<MembershipTier | null>(null);
  const [submittingUpgrade, setSubmittingUpgrade] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const handleOpenCheckout = (tier: MembershipTier) => {
    if (tier === stats.membership) return; // already active
    setCheckoutTier(tier);
    setUpgradeSuccess(false);
  };

  const handleConfirmUpgrade = () => {
    if (!checkoutTier) return;
    const price = MEMBERSHIPS_CONFIGS[checkoutTier].priceTaka;
    if (stats.balance < price) return;

    setSubmittingUpgrade(true);

    setTimeout(() => {
      onUpgradeTier(checkoutTier);
      setSubmittingUpgrade(false);
      setUpgradeSuccess(true);
      setTimeout(() => {
        setCheckoutTier(null);
        setUpgradeSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* Prime Header Info */}
      <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-3xs">
        <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
          <Crown className="w-4 h-4 text-emerald-600 fill-current" />
          PREMIUM SUITE
        </span>
        <h3 className="text-sm font-bold text-gray-800 pt-1">আইডি মেম্বারশিপ লেভেল আপগ্রেড</h3>
        <p className="text-xs text-gray-500 leading-relaxed pt-1 font-sans">
          নিচের মেম্বারশিপ মেট্রিক্স থেকে আপনার কাঙ্খিত স্তরে উন্নীত হোন। প্রিমিয়াম লেভেলে প্রতি কাজে ১০ গুণ পর্যন্ত বেশি সম্মানি ও কোনো সর্বনিম্ন সীমা ছাড়াই তাত্ক্ষণিক দৈনিক পেমেন্ট ক্যাশআউটের নিশ্চয়তা রয়েছে।
        </p>
      </div>

      {/* Grid of Tiers */}
      <div className="space-y-3.5">
        {configs.map((tier) => {
          const isActive = stats.membership === tier.id;
          
          return (
            <div 
              key={tier.id}
              id={`membership-tier-card-${tier.id}`}
              className={`bg-white rounded-2xl border p-4.5 transition-all relative overflow-hidden ${
                isActive 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs' 
                  : tier.id === 'diamond' 
                  ? 'border-purple-300 shadow-3xs bg-radial from-purple-50/20 to-white' 
                  : 'border-gray-200'
              }`}
            >
              {/* Highlight Ribbon for special elements */}
              {tier.id === 'diamond' && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>জনপ্রিয়</span>
                </div>
              )}
              {isActive && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                  <span>বর্তমানে সক্রিয়</span>
                </div>
              )}

              {/* Tier Name & Quick cost */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-bold text-gray-900 flex items-center gap-1.5 font-display">
                    {tier.titleBn}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-sans tracking-wide">
                    {tier.titleEn}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-extrabold text-gray-900 font-mono">
                    {tier.priceTaka === 0 ? 'ফ্রি' : `৳${tier.priceTaka.toLocaleString()}`}
                  </span>
                  {tier.priceTaka > 0 && <span className="text-[10px] text-gray-400 font-sans block">এককালীন পরিশোধ</span>}
                </div>
              </div>

              {/* Matrices detail list */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px] text-gray-505 border-t border-b border-gray-50 py-3">
                <div className="flex flex-col">
                  <span className="text-gray-405 font-medium">দৈনিক কাজের সীমা:</span>
                  <span className="font-bold text-gray-800 font-mono">{tier.dailyQuota}টি মাইক্রো-টাস্ক</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-450 font-medium">কাজ প্রতি সম্মানি:</span>
                  <span className="font-bold text-emerald-700 font-mono">৳{tier.rewardMin}-৳{tier.rewardMax} টাকা</span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className="text-gray-450 font-medium">{tier.maxWithdrawLimit ? 'উত্তোলন সীমা:' : 'ন্যূনতম উইথড্র সীমা:'}</span>
                  <span className="font-bold text-gray-800 font-mono">
                    {tier.maxWithdrawLimit ? `৳${tier.minWithdrawLimit} - ৳${tier.maxWithdrawLimit}` : `৳${tier.minWithdrawLimit}`} টাকা
                  </span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className="text-gray-455 font-medium">উত্তোলন অনুমোদন স্পীড:</span>
                  <span className="font-bold text-gray-800 font-sans">
                    {tier.id === 'free' ? 'সীমিত ১ বার সফল' : tier.id === 'silver' ? '২৪ ঘণ্টা ক্লিয়ারেন্স' : tier.id === 'gold' ? '১২ ঘণ্টা প্রায়োরিটি' : 'ইন্সট্যান্ট ক্যাশআউট (তাৎক্ষণিক)'}
                  </span>
                </div>
              </div>

              {/* Special Terms Detail */}
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium pt-2 text-center opacity-90">
                {tier.policyBn}
              </p>

              {/* Action Button */}
              <div className="mt-4">
                {isActive ? (
                  <div className="w-full bg-emerald-50 text-emerald-800 font-semibold text-xs py-2.5 rounded-xl border border-emerald-250 text-center flex items-center justify-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>চলতি প্যাকেজটি আপনার একাউন্টে রানিং রয়েছে</span>
                  </div>
                ) : (
                  <button
                    id={`upgrade-trigger-btn-${tier.id}`}
                    onClick={() => handleOpenCheckout(tier.id)}
                    className={`w-full font-bold text-xs py-2.5 rounded-xl text-center transition-all duration-250 hover:shadow-3xs active:scale-[0.98] ${
                      tier.id === 'diamond' 
                        ? 'bg-purple-650 hover:bg-purple-700 text-white font-semibold' 
                        : 'bg-gray-950 hover:bg-gray-900 border border-black text-white font-medium'
                    }`}
                  >
                    আপগ্রেড ট্রায়াল শুরু করুন
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Checkout Simulate Modal Overlay */}
      <AnimatePresence>
        {checkoutTier && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent/45 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-5 max-w-sm w-full border border-gray-150 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">নিরাপদ ডাবল-সিল পেমেন্ট গেটওয়ে</h3>
                  <p className="text-[10px] text-gray-400">মেম্বারশিপ সাবস্ক্রিপশন চেকআউট</p>
                </div>
                <button 
                  onClick={() => setCheckoutTier(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold font-mono px-1.5"
                >
                  ✕
                </button>
              </div>

              {upgradeSuccess ? (
                /* Success animation details */
                <div id="checkout-upgrade-success" className="text-center py-6 space-y-2">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-emerald-150">
                    <Sparkles className="w-5 h-5 fill-current animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-900">আপগ্রেড লেভেল সম্পন্ন হয়েছে!</h4>
                  <p className="text-[10px] text-gray-500">
                    আপনার একাউন্টটি সফলভাবে <span className="font-bold text-emerald-600">{MEMBERSHIPS_CONFIGS[checkoutTier].titleBn}</span>-এ উন্নীত হয়েছে। অতিরিক্ত কাজের কোটা ও বোনাস রিওয়ার্ড যুক্ত করা হয়েছে।
                  </p>
                </div>
              ) : (
                /* Main details forms showing sandbox simulation */
                stats.balance < MEMBERSHIPS_CONFIGS[checkoutTier].priceTaka ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="bg-red-50 border border-red-200 text-xs text-red-950 rounded-xl p-3.5 space-y-1.5 leading-relaxed font-sans">
                      <div className="flex items-center gap-1 font-bold text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span>অপর্যাপ্ত ব্যালেন্স!</span>
                      </div>
                      <p>
                        আপনার একাউন্টে বর্তমানে পর্যাপ্ত ব্যালেন্স নেই। সিলভার/গোল্ড/ডায়মন্ড প্যাকেজটি অ্যাক্টিভ করতে <strong>৳{MEMBERSHIPS_CONFIGS[checkoutTier].priceTaka}</strong> প্রয়োজন, কিন্তু আপনার ওয়ালেট ব্যালেন্স হচ্ছে <strong>৳{stats.balance}</strong> টাকা।
                      </p>
                    </div>
                    <div className="pt-2 flex space-x-2">
                      <button
                        onClick={() => setCheckoutTier(null)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs py-2.5 rounded-xl font-bold transition-all"
                      >
                        বাতিল
                      </button>
                      <button
                        id="redirect-deposit-btn"
                        onClick={() => {
                          setCheckoutTier(null);
                          onNavigateTab('deposit');
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        ডিপোজিট করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-150 text-xs">
                      <div className="flex justify-between py-0.5">
                        <span className="text-gray-500">প্যাকেজের নাম:</span>
                        <span className="font-bold text-gray-800">{MEMBERSHIPS_CONFIGS[checkoutTier].titleBn}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-gray-500">পরিশোধযোগ্য মূল্য:</span>
                        <span className="font-bold text-emerald-700 font-mono">৳{MEMBERSHIPS_CONFIGS[checkoutTier].priceTaka} টাকা</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-gray-200 mt-1.5 pt-1.5">
                        <span className="text-gray-500 font-medium text-gray-600">ক্রয় পরবর্তী অবশিষ্ট ব্যালেন্স:</span>
                        <span className="font-bold text-gray-900 font-mono">৳{(stats.balance - MEMBERSHIPS_CONFIGS[checkoutTier].priceTaka)} টাকা</span>
                      </div>
                    </div>

                    <div className="p-2 bg-blue-50 border border-blue-200 text-[10px] text-blue-900 rounded-xl space-y-1">
                      <p className="font-bold flex items-center gap-0.5 font-sans">
                        <Cpu className="w-3.5 h-3.5" />
                        নিরাপদ ও তাৎক্ষণিক মেম্বারশিপ অ্যাক্টিভেশন
                      </p>
                      <p className="font-medium text-blue-800 leading-normal font-sans">
                        "পেমেন্ট নিশ্চিত করুন" বোতামে চাপ দিলে আপনার ওয়ালেট ব্যালেন্স থেকে ৳{MEMBERSHIPS_CONFIGS[checkoutTier].priceTaka} টাকা সরাসরি কেটে মেম্বারশিপ চালু করা হবে।
                      </p>
                    </div>

                    {/* Sandbox confirmation controls */}
                    <div className="pt-2 flex space-x-2">
                      <button
                        id="checkout-cancel-btn"
                        onClick={() => setCheckoutTier(null)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs py-2.5 rounded-xl font-bold transition-all"
                      >
                        বাতিল করুন
                      </button>
                      <button
                        id="checkout-confirm-btn"
                        onClick={handleConfirmUpgrade}
                        disabled={submittingUpgrade}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-1"
                      >
                        {submittingUpgrade ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>যাচাই হচ্ছে...</span>
                          </>
                        ) : (
                          <span>পেমেন্ট নিশ্চিত করুন</span>
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
