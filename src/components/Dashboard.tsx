/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Users, Award, TrendingUp, ShieldCheck, 
  HelpCircle, ArrowRight, Clipboard, Check, Bell, MessageSquare 
} from 'lucide-react';
import { UserStats } from '../types';
import { MEMBERSHIPS_CONFIGS } from '../data/memberships';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  stats: UserStats;
  onNavigateTab: (tab: 'tasks' | 'withdraw' | 'memberships') => void;
  onAddReferral: () => void;
}

export default function Dashboard({ stats, onNavigateTab, onAddReferral }: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const currentTier = MEMBERSHIPS_CONFIGS[stats.membership];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentHour = new Date().getHours();
  let greetingBn = 'শুভ দিন!';
  if (currentHour >= 5 && currentHour < 12) greetingBn = 'শুভ সকাল!';
  else if (currentHour >= 12 && currentHour < 15) greetingBn = 'শুভ দুপুর!';
  else if (currentHour >= 15 && currentHour < 18) greetingBn = 'শুভ বিকেল!';
  else greetingBn = 'শুভ সন্ধ্যা!';

  // Live Community payouts simulated log for social trust
  const notifications = [
    { name: 'মামুন', gateway: 'bKash', amount: 500, time: '২ মি পূর্বে' },
    { name: 'ফারজানা', gateway: 'Nagad', amount: 800, time: '৫ মি পূর্বে' },
    { name: 'সজীব', gateway: 'Rocket', amount: 1200, time: '৮ মি পূর্বে' },
    { name: 'নাছরিন', gateway: 'bKash', amount: 650, time: '১২ মি পূর্বে' },
  ];

  return (
    <div className="space-y-4 pb-24">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-radial from-emerald-950 to-emerald-900 rounded-2xl p-5 text-white shadow-md">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <TrendingUp className="w-24 h-24" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>স্বাগতম উপার্জন প্রো-তে</span>
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight">
            {greetingBn} প্রিয় গ্রাহক
          </h2>
          <p className="text-xs text-emerald-100 font-sans leading-relaxed pt-1">
            আজ আপনার জন্য <span className="font-bold underline text-emerald-300">{currentTier.dailyQuota - stats.dailyTasksDone}টি</span> কাজ অবশিষ্ট রয়েছে। প্রতিদিন কাজ সম্পন্ন করুন এবং সুরক্ষিত উপায়ে পেমেন্ট উত্তোলন করুন।
          </p>
          <div className="pt-3 flex space-x-2">
            <button
              onClick={() => onNavigateTab('tasks')}
              className="bg-emerald-500 hover:bg-emerald-650 active:scale-95 transition-all text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1 shadow-sm"
            >
              <span>কাজ শুরু করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('memberships')}
              className="bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-medium px-3.5 py-1.5 rounded-lg active:scale-95 transition-all"
            >
              মেম্বারশিপ আপগ্রেড
            </button>
          </div>
        </div>
      </div>

      {/* Stats SVG Curve Viz */}
      <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-3xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase font-sans">উপার্জন লেজার</h3>
            <p className="text-sm font-bold text-gray-800">সাপ্তাহিক প্রবৃদ্ধি সূচক</p>
          </div>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold font-mono">
            ৳{stats.totalEarned} সর্বমোট লব্ধ
          </span>
        </div>

        {/* Custom SVG Area Chart */}
        <div className="h-28 w-full mt-2 relative">
          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="#f3f4f6" strokeWidth="1" />

            {/* Content Curve Path */}
            <path
              d="M 0 100 Q 50 82, 100 88 T 200 45 T 300 35 T 400 15 L 400 110 L 0 110 Z"
              fill="url(#chart-grad)"
            />
            <path
              d="M 0 100 Q 50 82, 100 88 T 200 45 T 300 35 T 400 15"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Static Nodes */}
            <circle cx="200" cy="45" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="300" cy="35" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="400" cy="15" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
          {/* Legend Details */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1 text-[9px] text-gray-400 font-mono">
            <span>শনি</span>
            <span>রবি</span>
            <span>সোম</span>
            <span>মঙ্গল</span>
            <span>বুধ</span>
            <span>বৃহস্পতি</span>
            <span>শুক্র</span>
          </div>
        </div>
      </div>

      {/* Referrals & Secondary Rewards Platform */}
      <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-3xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-800">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold">রেফারেল প্রোগ্রাম</h3>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">
            বোনাস: ৳২০ প্রতি সফল জয়েনিং
          </span>
        </div>
        
        <p className="text-xs text-gray-500 font-sans leading-relaxed">
          আপনার রেফারেল কোড ব্যবহার করে বন্ধুরা রেজিস্টার করলে প্রতিজন থেকে পাবেন <span className="font-bold text-gray-805">৳২০ বোনাস</span>! বর্তমানে আপনার রেফারেল ডাটা নিম্নরূপ:
        </p>

        {/* Referral Tracker stats */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-150">
          <div className="text-center py-1">
            <span className="text-[10px] text-gray-400 font-medium block">সফল রেফারেল</span>
            <span className="text-md font-bold text-gray-800 font-mono">{stats.totalReferrals} জন</span>
          </div>
          <div className="text-center py-1 border-l border-gray-200">
            <span className="text-[10px] text-gray-400 font-medium block">রেফারেল আর্নিং</span>
            <span className="text-md font-bold text-emerald-700 font-mono">৳{stats.referralEarnings}</span>
          </div>
        </div>

        {/* Copy Referral Code */}
        <div className="flex space-x-2">
          <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2 flex items-center justify-between border border-gray-200">
            <span className="text-xs font-mono font-bold text-gray-700 tracking-wider">
              {stats.referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-gray-400 hover:text-emerald-600 transition-colors"
              title="কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Clipboard className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={onAddReferral}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 flex items-center space-x-1"
          >
            <span>নতুন বন্ধু যোগান</span>
          </button>
        </div>
      </div>

      {/* Security Checkpoints Instruction */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold font-display">বিশেষ নিরাপত্তা সতর্কতা ও কাজের নিয়মাবলী</h4>
        </div>
        <ul className="text-[11px] text-amber-800 space-y-1 pl-4 list-disc leading-relaxed">
          <li>পেমেন্ট উত্তোলনে কোনো জটিলতা এড়াতে সঠিক বিকাশ/নগদ/রকেট নম্বর (১১ ডিজিট) নির্বাচন করুন।</li>
          <li>প্রতিটি টাস্ক সেন্টারের কুইজ বা বানান সাবধানে সমাধান করুন; ভুল উত্তরে কোনো ফি বা কমিশন কেটে নেওয়া হতে পারে না তবে আপনার দৈনিক টাস্ক কোটা হ্রাস পাবে।</li>
          <li><span className="font-bold underline">ফ্রি মেম্বারশিপ প্ল্যানে</span> শুধুমাত্র ১টি ক্যাশআউট অনুমোদিত। পরবর্তী সীমাহীন কাজের জন্য মেম্বারশিপ পোর্টাল থেকে আপগ্রেড করুন।</li>
        </ul>
      </div>

      {/* Rolling payment feed to build social proof */}
      <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-3xs space-y-2">
        <div className="flex items-center space-x-1.5 text-gray-800">
          <Bell className="w-3.5 h-3.5 text-red-500 animate-bounce" />
          <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-gray-500">লাইভ পেমেন্ট প্রুফ</h3>
        </div>
        <div className="space-y-1.5">
          {notifications.map((n, i) => (
            <div key={i} className="flex justify-between items-center text-[11px] py-1 border-b border-gray-50 last:border-0">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700">{n.name}</span>
                <span className="text-gray-400">মেসেজের মাধ্যমে</span>
                <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono font-medium">{n.gateway}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-gray-900">৳{n.amount}</span>
                <span className="text-[9px] text-gray-400 font-mono">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
