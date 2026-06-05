/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Wallet, Award, RefreshCw, Star, LogOut } from 'lucide-react';
import { UserStats } from '../types';
import { MEMBERSHIPS_CONFIGS } from '../data/memberships';
import { motion } from 'motion/react';

interface HeaderProps {
  stats: UserStats;
  onRefresh: () => void;
  isRefreshing: boolean;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export default function Header({ stats, onRefresh, isRefreshing, userEmail, onSignOut }: HeaderProps) {
  const currentTier = MEMBERSHIPS_CONFIGS[stats.membership];

  return (
    <div className="bg-white border-b border-gray-150 sticky top-0 z-40 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Logo & Brand Details */}
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-gray-900 flex items-center gap-1">
              উপার্জন প্রো <span className="text-emerald-600 text-xs px-1.5 py-0.5 bg-emerald-50 rounded-md font-mono">Pro v2.6</span>
            </h1>
            <p className="text-[9px] text-gray-500 font-sans tracking-wide max-w-[120px] truncate" title={userEmail || stats.email}>
              {userEmail || stats.email || 'গাটছড়া করা হয়নি'}
            </p>
          </div>
        </div>

        {/* Action Controls & Shimmer Details */}
        <div className="flex items-center space-x-1">
          
          {/* Refresh Action */}
          <button 
            id="refresh-stats-btn"
            onClick={onRefresh}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 active:scale-95 transition-all duration-200 cursor-pointer"
            title="ব্যালেন্স আপডেট করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Current Tier Badge */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${currentTier.badgeColor} shadow-3xs`}
          >
            <Star className="w-3 h-3 mr-0.5 fill-current" />
            <span className="font-display text-[10px]">{currentTier.titleBn}</span>
          </motion.div>

          {/* Sign Out Button */}
          {onSignOut && (
            <button 
              onClick={onSignOut}
              className="p-2 rounded-xl hover:bg-red-50 text-red-500 active:scale-95 transition-all duration-200 cursor-pointer"
              title="লগ আউট করুন"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Main Micro-Dashboard Stats Sheet */}
      <div className="max-w-md mx-auto mt-3.5 grid grid-cols-2 gap-3">
        
        {/* Left Stats: Main Earnings Panel */}
        <motion.div 
          id="stat-balance-card"
          layoutId="balance-panel"
          className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100 flex flex-col justify-between"
        >
          <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            বর্তমান ব্যালেন্স
          </span>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-emerald-900 font-mono tracking-tight">
              ৳{stats.balance.toLocaleString('bn-BD')}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">টাকা</span>
          </div>
          <div className="mt-1 bg-emerald-100/50 h-1.5 w-full rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-500" 
              style={{ width: `${Math.min((stats.balance / 1000) * 100, 100)}%` }} 
            />
          </div>
        </motion.div>

        {/* Right Stats: Completed Operations Panel */}
        <div id="stat-tasks-card" className="bg-gray-50/75 rounded-2xl p-3 border border-gray-200 flex flex-col justify-between">
          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-gray-400" />
            আজকের সম্পন্ন কাজ
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                {stats.dailyTasksDone}
              </span>
              <span className="text-gray-400 text-[11px] font-mono">/</span>
              <span className="text-gray-500 text-sm font-mono font-medium">
                {currentTier.dailyQuota}
              </span>
            </div>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-medium">
              +{Math.floor((stats.dailyTasksDone / currentTier.dailyQuota) * 100)}%
            </span>
          </div>
          <div className="mt-1 bg-gray-200 h-1.5 w-full rounded-full overflow-hidden">
            <div 
              className="bg-gray-600 h-full transition-all duration-500" 
              style={{ width: `${(stats.dailyTasksDone / currentTier.dailyQuota) * 100}%` }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
