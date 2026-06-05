/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wallet, ShieldCheck, Check, Copy, Clock, Sparkles, Loader2, 
  AlertTriangle, CreditCard, Send, TrendingDown 
} from 'lucide-react';
import { UserStats, DepositLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DepositPortalProps {
  stats: UserStats;
  deposits: DepositLog[];
  onSubmitDeposit: (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', senderMobile: string, txnId: string) => Promise<void>;
  isSubmittingDeposit: boolean;
  onAutoApproveDeposit: (depositId: string, amount: number) => Promise<void>;
}

export default function DepositPortal({ 
  stats, 
  deposits, 
  onSubmitDeposit, 
  isSubmittingDeposit,
  onAutoApproveDeposit
}: DepositPortalProps) {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [amount, setAmount] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [txnId, setTxnId] = useState('');
  const [feedback, setFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);

  // Suggested Admin Numbers
  const adminNumbers = {
    bKash: '01856584729',
    Nagad: '01812762448',
    Rocket: '01955789123'
  };

  const formatAdminNumber = (num: string) => {
    if (num === '01856584729') return '01856-584729';
    if (num === '01812762448') return '01812-762448';
    return num;
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(adminNumbers[method]);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate mobile
    const cleanMobile = senderMobile.trim();
    if (!/^01[0-9]{9}$/.test(cleanMobile)) {
      setFeedback({
        status: 'error',
        message: 'অনুগ্রহ করে একটি সঠিক ১১-ডিজিটের মোবাইল নম্বর লিখুন (যেমন: ০১৮XXXXXXXX)।'
      });
      return;
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      setFeedback({
        status: 'error',
        message: 'সর্বনিম্ন জমার বা ডিপোজিটের পরিমাণ ১০০ টাকা।'
      });
      return;
    }

    // Validate transaction ID (usually 8-10 alphanumeric characters)
    const cleanTxnId = txnId.trim();
    if (cleanTxnId.length < 5 || cleanTxnId.length > 20) {
      setFeedback({
        status: 'error',
        message: 'অনুগ্রহ করে সঠিক ৫-২০ অক্ষরের ট্রানজেকশন আইডি (TxnID) দিন।'
      });
      return;
    }

    try {
      await onSubmitDeposit(parsedAmount, method, cleanMobile, cleanTxnId);
      
      setFeedback({
        status: 'success',
        message: `৳${parsedAmount} টাকা ডিপোজিট রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে! দয়া করে এই পেইজের একটি স্ক্রিনশট এবং আপনার প্রেরক মোবাইল নম্বরটি (${cleanMobile}) এখনই নিচে দেওয়া আমাদের অফিশিয়াল টেলিগ্রাম সাপোর্টে পাঠিয়ে দিন ধন্যবাদ!`
      });

      // Reset fields
      setAmount('');
      setSenderMobile('');
      setTxnId('');

    } catch (err: any) {
      setFeedback({
        status: 'error',
        message: `ত্রুটি দেখা দিয়েছে: ${err?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন'}`
      });
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      
      {/* Wallet Balance Hero */}
      <div className="relative overflow-hidden bg-radial from-emerald-900 to-emerald-950 rounded-2xl p-5 text-white shadow-md">
        <div className="absolute top-0 right-0 p-3 opacity-15">
          <Wallet className="w-20 h-20 text-emerald-300" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-1 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>আপনার উপার্জন ওয়ালেট</span>
          </div>
          <h2 className="text-xs text-emerald-100 font-sans">বর্তমান জমা বা মেম্বারশিপ ব্যালেন্স</h2>
          <div className="pt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-display font-black tracking-tight text-white font-mono">
              ৳{stats.balance.toLocaleString('bn-BD')}
            </span>
            <span className="text-xs font-bold text-emerald-350 font-sans">টাকা</span>
          </div>
          <p className="text-[10px] text-emerald-200 pt-1 leading-relaxed">
            * বিকাশ, নগদ বা রকেট এর মাধ্যমে টাকা ডিপোজিট করে অবিলম্বে সিলভার, গোল্ড ও ডায়মন্ড মেম্বারশিপে আপগ্রেড করতে পারবেন।
          </p>
        </div>
      </div>

      {/* Telegram Support CTA Card */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            রিচার্জ সংক্রান্ত কোনো সমস্যা?
          </h4>
          <p className="text-[11px] text-sky-800 leading-relaxed max-w-[280px]">
            টেলিগ্রাম লিংকটি ওপেন না হলে <strong>'লিংক কপি করুন'</strong> বোতামে ক্লিক করে লিংকটি কপি করে নতুন ট্যাবে অথবা টেলিগ্রাম অ্যাপে পেস্ট করে ওপেন করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://t.me/uparjonpro"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-[11px] px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>টেলিগ্রাম সাপোর্ট</span>
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText('https://t.me/uparjonpro');
              setCopiedTelegram(true);
              setTimeout(() => setCopiedTelegram(false), 2000);
            }}
            className={`font-bold text-[11px] px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1 border active:scale-95 ${
              copiedTelegram
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-white hover:bg-gray-50 border-sky-200 text-sky-700 hover:text-sky-800'
            }`}
          >
            {copiedTelegram ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span>লিংক কপি করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Instructions & Details Dashboard */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs space-y-4">
        
        <h3 className="text-sm font-bold text-gray-850 flex items-center gap-1.5 border-b border-gray-50 pb-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          টাকা ডিপোজিট করার বা পাঠানোর নিয়মাবলী
        </h3>

        {/* Step List */}
        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-150 space-y-2.5 text-xs text-emerald-950">
          <div className="flex items-start space-x-2">
            <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">১</span>
            <p className="leading-relaxed font-sans">
              নিচের যেকোনো একটি পেমেন্ট গেটওয়ে নির্বাচন করুন এবং আমাদের প্রদত্ত পার্সোনাল নম্বরে <strong>Send Money (সেন্ড মানি)</strong> করুন।
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">২</span>
            <p className="leading-relaxed font-sans">
              সেন্ড মানি সফল হলে পেমেন্ট সম্পর্কিত তথ্য নিচের ফর্মে লিখুন এবং <strong>'ডিপোজিট সাবমিট করুন'</strong> বোতামে ক্লিক করুন।
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">৩</span>
            <p className="leading-relaxed font-sans">
              সাবমিট করার ৩-৫ সেকেন্ডের মধ্যে গেটওয়ে ট্রানজেকশন অটোমেটিক যাচাই করে আপনার ব্যালেন্সে টাকা যুক্ত করে দেবে!
            </p>
          </div>
          <div className="flex items-start space-x-2 border-t border-emerald-150/80 pt-2.5 mt-1 bg-amber-50/50 p-2 rounded-lg border border-amber-200">
            <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">★</span>
            <p className="leading-relaxed font-sans text-amber-950 font-bold">
              <strong>জরুরী নির্দেশ:</strong> জমার রিকোয়েস্ট সাবমিট করার পর উক্ত পেমেন্ট পেজের একটি <strong>স্ক্রিনশট</strong> এবং আপনার প্রেরক <strong>মোবাইল নম্বরটি</strong> অবশ্যই আমাদের অফিশিয়াল <strong>টেলিগ্রাম সাপোর্টে</strong> পাঠিয়ে দিন যাতে দ্রুত পেমেন্ট ভেরিফাই বা অনুমোদন করা যায়।
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          
          {/* Method Selectors */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 block">পেমেন্ট মেথড নির্বাচন করুন</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bKash' as const, label: 'বিকাশ', bg: 'border-pink-200 bg-pink-50 text-pink-700', activeBg: 'border-pink-500 bg-pink-100 ring-pink-500/30' },
                { id: 'Nagad' as const, label: 'নগদ', bg: 'border-orange-200 bg-orange-50 text-orange-700', activeBg: 'border-orange-500 bg-orange-100 ring-orange-500/30' },
                { id: 'Rocket' as const, label: 'রকেট', bg: 'border-purple-200 bg-purple-50 text-purple-700', activeBg: 'border-purple-500 bg-purple-100 ring-purple-500/30' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setMethod(item.id); setFeedback(null); }}
                  className={`p-2.5 text-xs font-bold border rounded-xl flex flex-col items-center justify-center transition-all ${
                    method === item.id
                      ? `${item.activeBg} ring-2 shadow-3xs scale-103 font-extrabold`
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Display Copy Area */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-250 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">আমাদের {method === 'bKash' ? 'বিকাশ' : method === 'Nagad' ? 'নগদ' : 'রকেট'} নম্বর (Personal)</span>
              <p className="text-sm font-mono font-bold text-gray-900 tracking-wider">
                {formatAdminNumber(adminNumbers[method])}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="bg-white hover:bg-gray-100 active:scale-95 text-gray-500 p-2 rounded-lg border border-gray-200 flex items-center space-x-1 text-xs font-medium cursor-pointer transition-all"
            >
              {copiedNumber ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] text-emerald-600 font-bold">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">নম্বর কপি</span>
                </>
              )}
            </button>
          </div>

          {/* Input Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 block">কত টাকা পাঠিয়েছেন (Amount)</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white text-xs font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 pl-8 pr-4 py-3 outline-none transition-all placeholder:text-gray-400"
                placeholder="যেমন: ৫৮০ টাকা (সর্বনিম্ন ১০০)"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isSubmittingDeposit}
                required
              />
              <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400 font-mono">৳</span>
            </div>
          </div>

          {/* Sender Mobile */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 block">যে নম্বর থেকে সেন্ড মানি করেছেন (১১ ডিজিট)</label>
            <input
              type="text"
              maxLength={11}
              className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white text-xs font-mono font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-3 outline-none transition-all placeholder:text-gray-400"
              placeholder="01xxxxxxxxx"
              value={senderMobile}
              onChange={(e) => setSenderMobile(e.target.value.replace(/[^0-9]/g, ''))}
              disabled={isSubmittingDeposit}
              required
            />
          </div>

          {/* Transaction ID */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 block">ট্রানজেকশন আইডি (Transaction ID / TxnID)</label>
            <input
              type="text"
              className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white text-xs font-mono font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-3 tracking-wider outline-none transition-all uppercase placeholder:text-gray-400"
              placeholder="যেমন: TR8XJD79F3"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              disabled={isSubmittingDeposit}
              required
            />
          </div>

          {/* Submit Response Banner */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 border ${
              feedback.status === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 animate-pulse' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {feedback.status === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="font-semibold leading-relaxed">{feedback.message}</span>
            </div>
          )}

          {/* Interactive Submit Button */}
          <button
            type="submit"
            disabled={isSubmittingDeposit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
          >
            {isSubmittingDeposit ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>যাচাইকরণ রিকোয়েস্ট জমা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ডিপোজিট সাবমিট করুন</span>
              </>
            )}
          </button>

        </form>

      </div>

      {/* Deposit Logs Ledger */}
      <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-xs font-bold text-gray-500 tracking-wide uppercase font-sans flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            ডিপোজিট হিস্টোরি (জমা লেজার)
          </h3>
          <span className="text-[10px] text-gray-400 font-mono font-medium">
            মোট ট্রানজেকশন ({deposits.length})
          </span>
        </div>

        {deposits.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            বর্তমানে কোনো ডিপোজিট বা রিচার্জ হিস্টোরি পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-2.5 overflow-hidden">
            {deposits.map((dep) => (
              <div 
                key={dep.id} 
                className="p-3 bg-gray-50/70 border border-gray-150 rounded-xl flex justify-between items-center text-xs hover:border-gray-350 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-gray-800">{dep.method} ডিপোজিট</span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">({dep.id})</span>
                  </div>
                  <div className="text-gray-505 text-[10px] font-sans flex flex-col">
                    <span className="font-sans">প্রেরক: <span className="font-mono text-[11px] font-semibold">{dep.senderMobile}</span></span>
                    <span className="font-sans">আইডি: <span className="font-mono text-[11px] uppercase font-bold text-emerald-800">{dep.transactionId}</span></span>
                    <span className="text-gray-405 font-mono text-[9px] mt-0.5">{dep.date}</span>
                  </div>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <span className="text-xs font-mono font-extrabold text-gray-900 block">৳{dep.amount}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    dep.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : dep.status === 'Pending'
                      ? 'bg-orange-50 text-orange-800 border-orange-200 animate-pulse'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {dep.status === 'Approved' ? 'সম্পন্ন (Approved)' : dep.status === 'Pending' ? 'যাচাইধীন (Pending)' : 'বাতিল (Rejected)'}
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
