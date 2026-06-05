/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MembershipTier = 'free' | 'silver' | 'gold' | 'diamond';

export interface MembershipConfig {
  id: MembershipTier;
  titleBn: string;
  titleEn: string;
  dailyQuota: number;
  rewardMin: number;
  rewardMax: number;
  minWithdrawLimit: number;
  maxWithdrawLimit?: number;
  dailyEarningsLimit: number;
  policyBn: string;
  priceTaka: number;
  badgeColor: string;
}

export interface WithdrawLog {
  id: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  amount: number;
  method: 'bKash' | 'Nagad' | 'Rocket';
  accountNo: string;
}

export interface DepositLog {
  id: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  amount: number;
  method: 'bKash' | 'Nagad' | 'Rocket';
  senderMobile: string;
  transactionId: string;
}

export interface UserStats {
  balance: number;
  totalEarned: number;
  membership: MembershipTier;
  dailyTasksDone: number;
  withdrawalsCount: number;
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  email?: string;
  name?: string;
  mobile?: string;
  referredBy?: string;
  dailyEarned?: number;
}

export type TaskType = 'math' | 'gk' | 'proofreading' | 'labeling' | 'survey';

export interface TaskChallenge {
  id: string;
  type: TaskType;
  questionBn: string;
  questionEn?: string;
  options?: string[]; // for multiple choice where appropriate
  correctAnswer?: string; // accepted correct string or option index (math can also recognize Bengali digits & English digits)
  minCharRequired?: number; // for survey responses
  context?: string; // Scenario text for labeling
  meta?: any; // Additional payload, like raw numbers for math or categories for labeling
}
