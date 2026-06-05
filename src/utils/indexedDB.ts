/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserStats, WithdrawLog } from '../types';

const DB_NAME = 'UparjonProDB';
const STORE_NAME = 'userState';
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function getDBValue<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result !== undefined ? request.result as T : null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB operations not direct, utilizing robust fallback:', error);
    const val = localStorage.getItem(`up_${key}`);
    return val ? JSON.parse(val) as T : null;
  }
}

export async function setDBValue<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Saving via secure fallback key-value storage:', error);
    localStorage.setItem(`up_${key}`, JSON.stringify(value));
  }
}

export const INITIAL_USER_STATS: UserStats = {
  balance: 80, // Starting bonus in Taka (৳৮০ বোনাস) to reward joining
  totalEarned: 80,
  membership: 'free',
  dailyTasksDone: 0,
  withdrawalsCount: 0,
  referralCode: 'UP986AF',
  totalReferrals: 3,
  referralEarnings: 60,
};

export const INITIAL_WITHDRAWALS: WithdrawLog[] = [
  {
    id: 'TXN-9021-BK',
    date: '2026-06-01 14:30',
    status: 'Approved',
    amount: 150,
    method: 'bKash',
    accountNo: '01712345678',
  },
  {
    id: 'TXN-4819-NG',
    date: '2026-06-02 11:15',
    status: 'Pending',
    amount: 550,
    method: 'Nagad',
    accountNo: '01987654321',
  },
];
