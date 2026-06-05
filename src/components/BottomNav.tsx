/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Briefcase, ArrowUpRight, Crown, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

type TabType = 'home' | 'tasks' | 'withdraw' | 'memberships' | 'deposit';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tasksDisabled: boolean;
}

export default function BottomNav({ activeTab, onTabChange, tasksDisabled }: BottomNavProps) {
  const tabs = [
    {
      id: 'home' as TabType,
      labelBn: 'হোম',
      labelEn: 'Home',
      icon: Home,
    },
    {
      id: 'tasks' as TabType,
      labelBn: 'টাস্ক',
      labelEn: 'Tasks',
      icon: Briefcase,
      badge: tasksDisabled ? undefined : 'চলতি',
    },
    {
      id: 'deposit' as TabType,
      labelBn: 'ডিপোজিট',
      labelEn: 'Deposit',
      icon: Wallet,
    },
    {
      id: 'withdraw' as TabType,
      labelBn: 'উত্তোলন',
      labelEn: 'Withdraw',
      icon: ArrowUpRight,
    },
    {
      id: 'memberships' as TabType,
      labelBn: 'মেম্বারশিপ',
      labelEn: 'Premium',
      icon: Crown,
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-4 flex justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center py-1.5 px-3 min-w-[70px] focus:outline-hidden transition-all group"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-emerald-50 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-active:scale-90 ${
                    isActive ? 'text-emerald-700' : 'text-gray-400 group-hover:text-gray-650'
                  }`}
                />
                
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 text-[8px] bg-red-500 text-white font-semibold rounded-full px-1.5 py-0.2 select-none animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-medium font-sans tracking-wide transition-colors ${
                  isActive ? 'text-emerald-900 font-semibold' : 'text-gray-400'
                }`}
              >
                {tab.labelBn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
