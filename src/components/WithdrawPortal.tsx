/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, Landmark, Wallet, Clock, Check, AlertTriangle, ShieldCheck, 
  HelpCircle, ArrowDownToLine, Loader2, Sparkles, Crown, ArrowRight 
} from 'lucide-react';
import { UserStats, WithdrawLog } from '../types';
import { MEMBERSHIPS_CONFIGS } from '../data/memberships';
import { motion } from 'motion/react';

interface WithdrawPortalProps {
  stats: UserStats;
  withdrawals: WithdrawLog[];
  onAddWithdrawal: (log: WithdrawLog) => void;
  onNavigateTab: (tab: 'memberships') => void;
}

export default function WithdrawPortal({ stats, withdrawals, onAddWithdrawal, onNavigateTab }: WithdrawPortalProps) {
  const currentTier = MEMBERSHIPS_CONFIGS[stats.membership];
  
  // Free plan lock checker
  const isFreePlanLocked = stats.membership === 'free' && stats.withdrawalsCount >= 1;

  // Form states
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [accountNo, setAccountNo] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    // Basic locks extra validation
    if (isFreePlanLocked) {
      setFormFeedback({
        status: 'error',
        message: 'ফ্রি মেম্বারশিপে শুধুমাত্র ১টি সফল উইথড্র সম্ভব। কাজ চালিয়ে যেতে অনুগ্রহ করে মেম্বারশিপ আপগ্রেড করুন।'
      });
      return;
    }

    // Account check: exactly 11 numeric digits starts with '01'
    const cleanAccount = accountNo.trim();
    if (!/^[0-9]{11}$/.test(cleanAccount) || !cleanAccount.startsWith('01')) {
      setFormFeedback({
        status: 'error',
        message: 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১৭XXXXXXXX)।'
      });
      return;
    }

    // Amount parse
    const amountVal = parseFloat(withdrawAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormFeedback({
        status: 'error',
        message: 'অনুগ্রহ করে সঠিক উত্তোলনের পরিমাণ লিখুন।'
      });
      return;
    }

    // Balance verification
    if (amountVal > stats.balance) {
      setFormFeedback({
        status: 'error',
        message: `দুঃখিত! আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ৳${stats.balance}`
      });
      return;
    }

    // Min limit verification (0 for Diamond, 500 for Free, Silver, Gold)
    const minRequired = currentTier.minWithdrawLimit;
    if (amountVal < minRequired) {
      setFormFeedback({
        status: 'error',
        message: `আপনার বর্তমান মেম্বারশিপে সর্বনিম্ন উত্তোলনের সীমা ৳${minRequired} টাকা।`
      });
      return;
    }

    // Max limit verification
    const maxRequired = currentTier.maxWithdrawLimit;
    if (maxRequired !== undefined && amountVal > maxRequired) {
      setFormFeedback({
        status: 'error',
        message: `আপনার বর্তমান মেম্বারশিপে সর্বোচ্চ উত্তোলনের সীমা ৳${maxRequired} টাকা।`
      });
      return;
    }

    // Submit transaction
    setIsSubmitting(true);
    setTimeout(() => {
      const newTxn: WithdrawLog = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}-${method.substring(0, 2).toUpperCase()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Pending',
        amount: amountVal,
        method: method,
        accountNo: cleanAccount,
      };

      onAddWithdrawal(newTxn);
      setFormFeedback({
        status: 'success',
        message: `৳${amountVal} টাকা উত্তোলনের রিকোয়েস্ট সফলভাবে জমা হয়েছে।`
      });
      
      // Reset form
      setAccountNo('');
      setWithdrawAmount('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      
      {/* Current limit card info */}
      <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-3xs flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider font-sans">উত্তোলন যোগ্যতা</span>
          <h3 className="text-md font-bold text-gray-800 flex items-center gap-1">
            {currentTier.titleBn}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[260px] pt-1">
            {currentTier.minWithdrawLimit === 0 
              ? '★ কোনো সর্বনিম্ন ক্যাশআউট লিমিট নেই! যেকোনো পরিমাণ টাকা তুলতে পারবেন।' 
              : currentTier.maxWithdrawLimit
              ? `★ উত্তোলন সীমা: ৳${currentTier.minWithdrawLimit} থেকে ৳${currentTier.maxWithdrawLimit} টাকা`
              : `★ সর্বনিম্ন উত্তোলন: ৳${currentTier.minWithdrawLimit} টাকা`
            }
          </p>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-full flex items-center justify-center border border-emerald-150 text-emerald-700 h-11 w-11 shadow-3xs">
          <ArrowDownToLine className="w-5 h-5" />
        </div>
      </div>

      {/* Main Form container */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs">
        <h3 className="text-sm font-bold text-gray-800 mb-3.5 flex items-center gap-1.5 border-b border-gray-50 pb-2">
          <Landmark className="w-4 h-4 text-emerald-600" />
          উত্তোলন ফর্ম (পেমেন্ট রিকোয়েস্ট)
        </h3>

        {isFreePlanLocked ? (
          /* LOCKED VISUAL FOR OUTLET */
          <div className="text-center py-6 px-3 bg-red-50/50 rounded-xl border border-red-150 space-y-3">
            <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-red-200">
              <Crown className="w-5 h-5 animate-bounce" />
            </div>
            <h4 className="text-xs font-bold text-red-950">উত্তোলন সীমাবদ্ধ (উইথড্র লকড)</h4>
            <p className="text-[11px] text-red-800 max-w-sm mx-auto leading-relaxed">
              আপনি আপনার ফ্রি মেম্বারশিপ প্ল্যানটির ১টি সফল উত্তোলনের কোটা ব্যবহার করেছেন। কাজ চালিয়ে যেতে এবং অবিলম্বে পরবর্তী পেমেন্ট রিকোয়েস্ট দিতে অনুগ্রহ করে রূপালি বা স্বর্ণালী প্যাকেজে আপগ্রেড করুন।
            </p>
            <button
              onClick={() => onNavigateTab('memberships')}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 inline-flex items-center space-x-1"
            >
              <span>প্যাকেজ মেম্বারশিপ দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* ACTIVE FORM */
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            
            {/* Gateway selectors */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">পেমেন্ট মেথড নির্বাচন করুন</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bKash' as const, label: 'বিকাশ', color: 'border-pink-200 bg-pink-50 text-pink-700' },
                  { id: 'Nagad' as const, label: 'নগদ', color: 'border-orange-200 bg-orange-50 text-orange-700' },
                  { id: 'Rocket' as const, label: 'রকেট', color: 'border-purple-200 bg-purple-50 text-purple-700' },
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`gate-sel-${item.id}`}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={`p-2.5 text-xs font-bold border rounded-xl flex flex-col items-center justify-center transition-all ${
                      method === item.id
                        ? `${item.color} ring-2 ring-emerald-500/20 shadow-3xs scale-103`
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">মোবাইল একাউন্ট নম্বর (১১ ডিজিট)</label>
              <input
                id="withdraw-account-input"
                type="text"
                maxLength={11}
                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white text-xs font-mono font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-3 outline-none transition-all placeholder:text-gray-400"
                placeholder="017xxxxxxxx"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Withdraw balance */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <label className="font-bold">উত্তোলনের পরিমাণ</label>
                <span className="font-medium text-emerald-800">ব্যালেন্স: ৳{stats.balance}</span>
              </div>
              <div className="relative">
                <input
                  id="withdraw-amount-input"
                  type="text"
                  className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white text-xs font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 pl-8 pr-4 py-3 outline-none transition-all placeholder:text-gray-450"
                  placeholder={currentTier.maxWithdrawLimit ? `সীমা ৳${currentTier.minWithdrawLimit} - ৳${currentTier.maxWithdrawLimit}` : `ন্যূনতম ৳${currentTier.minWithdrawLimit}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={isSubmitting}
                  required
                />
                <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400 font-mono">৳</span>
              </div>
            </div>

            {/* Status alerts */}
            {formFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 border ${
                formFeedback.status === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {formFeedback.status === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span className="font-medium">{formFeedback.message}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              id="withdraw-form-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>পেমেন্ট রিকোয়েস্ট পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <span>পেমেন্ট উত্তোলন করুন</span>
              )}
            </button>

          </form>
        )}
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-xs font-bold text-gray-500 tracking-wide uppercase font-sans flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            পেমেন্ট হিস্টোরি (উত্তোলন লেজার)
          </h3>
          <span className="text-[10px] text-gray-400 font-mono font-medium">
            মোট ট্রানজেকশন ({withdrawals.length})
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            বর্তমানে কোনো উত্তোলন বা ট্রানজেকশন হিস্টোরি পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-2.5 overflow-hidden">
            {withdrawals.map((txn) => (
              <div 
                key={txn.id} 
                id={`txn-log-item-${txn.id}`}
                className="p-3 bg-gray-50/70 border border-gray-150 rounded-xl flex justify-between items-center text-xs hover:border-gray-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-gray-800">{txn.method} পেমেন্ট</span>
                    <span className="text-[10px] text-gray-400 font-mono">({txn.id})</span>
                  </div>
                  <div className="text-gray-505 text-[10px] font-sans flex flex-col">
                    <span className="font-mono">{txn.accountNo}</span>
                    <span className="text-gray-405 font-mono text-[9px]">{txn.date}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-xs font-mono font-bold text-gray-900 block">৳{txn.amount}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    txn.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : txn.status === 'Pending'
                      ? 'bg-orange-50 text-orange-850 border-orange-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {txn.status === 'Approved' ? 'সম্পন্ন (Approved)' : txn.status === 'Pending' ? 'চলমান (Pending)' : 'বাতিল (Rejected)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
