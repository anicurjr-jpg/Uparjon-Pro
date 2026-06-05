/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MembershipConfig, MembershipTier } from '../types';

export const MEMBERSHIPS_CONFIGS: Record<MembershipTier, MembershipConfig> = {
  free: {
    id: 'free',
    titleBn: 'ফ্রি মেম্বারশিপ',
    titleEn: 'Free Membership',
    dailyQuota: 25,
    rewardMin: 10,
    rewardMax: 40,
    minWithdrawLimit: 100,
    maxWithdrawLimit: 150,
    dailyEarningsLimit: 40,
    policyBn: 'ফ্রি মেম্বারশিপে কমপক্ষে ১০০ টাকা এবং সর্বোচ্চ ১৫০ টাকা উত্তোলন করতে পারবেন। শুধুমাত্র ১ বার উত্তোলনের অনুমতি রয়েছে।',
    badgeColor: 'text-gray-500 bg-gray-100 border-gray-200',
    priceTaka: 0
  },
  silver: {
    id: 'silver',
    titleBn: 'সিলভার মেম্বারশিপ',
    titleEn: 'Silver Membership',
    dailyQuota: 50,
    rewardMin: 10,
    rewardMax: 40,
    minWithdrawLimit: 200,
    maxWithdrawLimit: 25000,
    dailyEarningsLimit: 80,
    policyBn: 'মাসিক ফি ৳৫৯৯। প্রতিদিন সর্বোচ্চ ৮০ টাকা আমদানী বা আয় করতে পারবেন। পেমেন্ট উত্তোলন লিমিট ২০০ থেকে ২৫,০০০ টাকা (মাসে সর্বোচ্চ ৪ বার)।',
    badgeColor: 'text-blue-600 bg-blue-50 border-blue-200',
    priceTaka: 599
  },
  gold: {
    id: 'gold',
    titleBn: 'গোল্ড মেম্বারশিপ',
    titleEn: 'Gold Membership',
    dailyQuota: 100,
    rewardMin: 10,
    rewardMax: 40,
    minWithdrawLimit: 0,
    dailyEarningsLimit: 220,
    policyBn: 'মাসিক ফি ৳১২৯৯। প্রতিদিন সর্বোচ্চ ২২০ টাকা পর্যন্ত আয় সুবিধা। অতিরিক্ত সুবিধা হিসেবে ক্যাশআউট বা উত্তোলনের কোনো সীমা নেই!',
    badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
    priceTaka: 1299
  },
  diamond: {
    id: 'diamond',
    titleBn: 'ডায়মন্ড মেম্বারশিপ',
    titleEn: 'Diamond Membership',
    dailyQuota: 150,
    rewardMin: 10,
    rewardMax: 40,
    minWithdrawLimit: 0,
    dailyEarningsLimit: 450,
    policyBn: 'মাসিক ফি ৳২৫৯৯। প্রতিদিন সর্বাধিক ৪৫০ টাকা আয় করতে পারবেন। দৈনিক যেকোনো সময়ে উত্তোলন যোগ্য এবং উত্তোলনের কোনো সীমা ও ফি নেই!',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    priceTaka: 2599
  }
};
