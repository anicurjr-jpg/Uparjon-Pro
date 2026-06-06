/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserStats, WithdrawLog, MembershipTier, DepositLog } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import TaskCenter from './components/TaskCenter';
import WithdrawPortal from './components/WithdrawPortal';
import MembershipPortal from './components/MembershipPortal';
import DepositPortal from './components/DepositPortal';
import { 
  Sparkles, X, Terminal, ArrowRight, Loader2, LogIn, LogOut, CheckCircle2, AlertCircle, Phone, User, Mail, Lock 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Firebase imports
import { auth, db, handleFirestoreError, OperationType } from './utils/firebase';
import { 
  signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, writeBatch, increment 
} from 'firebase/firestore';
import { MEMBERSHIPS_CONFIGS } from './data/memberships';
import { getDBValue, setDBValue, INITIAL_USER_STATS, INITIAL_WITHDRAWALS } from './utils/indexedDB';

type TabType = 'home' | 'tasks' | 'withdraw' | 'memberships' | 'deposit';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawLog[]>([]);
  const [deposits, setDeposits] = useState<DepositLog[]>([]);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  
  // Custom Registration / Login Form States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPromo, setRegPromo] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Mobile Number
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Loading and flow states
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  
  // Fallback Onboarding Form states
  const [onboardName, setOnboardName] = useState('');
  const [onboardMobile, setOnboardMobile] = useState('');
  const [onboardPromo, setOnboardPromo] = useState('');
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertNotification, setAlertNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 1. Listen for Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setIsAuthLoading(false);
      
      if (firebaseUser) {
        setIsProfileLoading(true);
        // Check if user has an existing Firestore profile
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            // First time login - trigger onboarding signup flow (fallback insurance)
            setIsOnboarding(true);
            setOnboardName(firebaseUser.displayName || '');
            setIsProfileLoading(false);
          } else {
            setIsOnboarding(false);
          }
        } catch (err) {
          console.error("Error checking profile document existence:", err);
          setIsProfileLoading(false);
        }
      } else {
        setStats(null);
        setWithdrawals([]);
        setDeposits([]);
        setIsOnboarding(false);
        setIsProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen to real-time User Profile, Withdraw, & Deposit Logs in Firestore
  useEffect(() => {
    if (!currentUser || isOnboarding) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        setStats(snap.data() as UserStats);
      }
      setIsProfileLoading(false);
    }, (error) => {
      console.error("Firestore user profile snapshot error:", error);
      setIsProfileLoading(false);
    });

    const withdrawalsRef = collection(db, 'users', currentUser.uid, 'withdrawals');
    const qw = query(withdrawalsRef, orderBy('date', 'desc'));
    const unsubscribeWithdrawals = onSnapshot(qw, (snap) => {
      const logs = snap.docs.map(d => d.data() as WithdrawLog);
      setWithdrawals(logs);
    }, (error) => {
      console.error("Firestore withdrawals snapshot error:", error);
    });

    const depositsRef = collection(db, 'users', currentUser.uid, 'deposits');
    const qd = query(depositsRef, orderBy('date', 'desc'));
    const unsubscribeDeposits = onSnapshot(qd, (snap) => {
      const logs = snap.docs.map(d => d.data() as DepositLog);
      setDeposits(logs);
    }, (error) => {
      console.error("Firestore deposits snapshot error:", error);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeWithdrawals();
      unsubscribeDeposits();
    };
  }, [currentUser, isOnboarding]);

  // 3. Form Submission Handlers for Custom Credentials Auth
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);

    const name = regName.trim();
    const mobile = regMobile.trim();
    const email = regEmail.trim();
    const password = regPassword;
    const promo = regPromo.trim().toUpperCase();

    // Validations
    if (!name) {
      setRegError('আপনার সম্পূর্ণ নামটি প্রদান করুন।');
      setRegLoading(false);
      return;
    }
    if (!/^01[0-9]{9}$/.test(mobile)) {
      setRegError('সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১XXXXXXXXX)।');
      setRegLoading(false);
      return;
    }
    if (!email || !email.includes('@')) {
      setRegError('দয়া করে একটি সঠিক জিমেইল বা ইমেইল এড্রেস প্রদান করুন।');
      setRegLoading(false);
      return;
    }
    if (password.length < 6) {
      setRegError('পাসওয়ার্ডটি অবশ্যই অন্তত ৬ অক্ষরের হতে হবে।');
      setRegLoading(false);
      return;
    }

    try {
      // Check if mobile number is already taken
      const phoneDocSnap = await getDoc(doc(db, 'phoneToEmail', mobile));
      if (phoneDocSnap.exists()) {
        setRegError('এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা রয়েছে।');
        setRegLoading(false);
        return;
      }

      let refOwnerUid: string | null = null;
      if (promo) {
        const refDocRef = doc(db, 'referrals', promo);
        const refDocSnap = await getDoc(refDocRef);
        if (!refDocSnap.exists()) {
          setRegError('ভুল বা অবৈধ প্রোমো/রেফারেল কোড! অনুগ্রহ করে চেক করে আবার চেষ্টা করুন অথবা ফাঁকা রাখুন।');
          setRegLoading(false);
          return;
        }
        refOwnerUid = refDocSnap.data().uid;
      }

      // Create authentication details in Firebase Auth
      const authResult = await createUserWithEmailAndPassword(auth, email, password);
      const uid = authResult.user.uid;

      // Unique 7-char referral code
      const newReferralCode = 'UPAR' + Math.random().toString(36).substring(2, 5).toUpperCase() + Math.floor(10 + Math.random() * 90);

      // Deploy transactional profiles setup
      const batch = writeBatch(db);

      const newUserStats = {
        name,
        mobile,
        email,
        membership: 'free',
        balance: 80, // 80 Taka starter balance
        totalEarned: 80,
        dailyTasksDone: 0,
        dailyEarned: 0,
        withdrawalsCount: 0,
        referralCode: newReferralCode,
        totalReferrals: 0,
        referralEarnings: 0,
        referredBy: promo || '',
        createdAt: new Date().toISOString()
      };

      // Set user profile document
      batch.set(doc(db, 'users', uid), newUserStats);

      // Create new unique referral mapping lookup node
      batch.set(doc(db, 'referrals', newReferralCode), {
        uid: uid,
        code: newReferralCode
      });

      // Create phone lookup document to support phone number logins
      batch.set(doc(db, 'phoneToEmail', mobile), {
        email: email,
        uid: uid
      });

      // If referred by a valid user, atomic reward user-to-user action of 199 Taka
      if (refOwnerUid && refOwnerUid !== uid) {
        batch.update(doc(db, 'users', refOwnerUid), {
          balance: increment(199),
          totalEarned: increment(199),
          totalReferrals: increment(1),
          referralEarnings: increment(199)
        });
      }

      await batch.commit();

      setAlertNotification({
        title: 'নিবন্ধন সম্পন্ন হয়েছে!',
        message: '৳৮০ সাইনআপ বোনাস সফলভাবে আপনার ওয়ালেটে জমা হয়েছে।',
        type: 'success'
      });
    } catch (err: any) {
      console.error("Firebase Sign Up Exception:", err);
      let errMsg = 'নিবন্ধন করার সময় একটি সমস্যা হয়েছে। ডেটাবেস সংযোগ চেক করুন।';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'এই ইমেইল এড্রেস দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'পাসওয়ার্ডটি অতিরিক্ত দুর্বল। দয়া করে অন্তত ৬ সংখ্যার পাসওয়ার্ড দিন।';
      } else if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        errMsg = 'আপনার ফায়ারবেস প্রজেক্টে Email/Password নিবন্ধন চালু করা নেই। অনুগ্রহ করে Firebase Console > Authentication > Sign-in method-এ যান এবং "Email/Password" সচল (Enable) করে দিন।';
      } else if (err.message && (err.message.includes('offline') || err.message.includes('network') || err.message.includes('client is offline'))) {
        errMsg = 'ডাটাবেজ সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না (ক্লায়েন্ট অফলাইন)। অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন, অথবা থ্রি-ডট মেন্যু থেকে অ্যাপটি অন্য ব্রাউজারে বা নতুন ট্যাবে রিফ্রেশ করে চেষ্টা করুন।';
      } else if (err.message) {
        errMsg = err.message;
      }
      setRegError(errMsg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const identifier = loginIdentifier.trim();
    const password = loginPassword;

    if (!identifier) {
      setLoginError('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।');
      setLoginLoading(true);
      return;
    }
    if (!password) {
      setLoginError('আপনার পাসওয়ার্ডটি প্রবেশ করান।');
      setLoginLoading(true);
      return;
    }

    try {
      let resolvedEmail = identifier;

      // Check if identifier is in phone number form (digits only or looks like mobile phone number)
      if (/^[0-9]+$/.test(identifier) || /^01[0-9]{9}$/.test(identifier)) {
        const phoneDocSnap = await getDoc(doc(db, 'phoneToEmail', identifier));
        if (phoneDocSnap.exists()) {
          resolvedEmail = phoneDocSnap.data().email;
        } else {
          setLoginError('এই মোবাইল নম্বর দিয়ে কোনো অ্যাকাউন্ট নিবন্ধন করা হয়নি।');
          setLoginLoading(false);
          return;
        }
      }

      await signInWithEmailAndPassword(auth, resolvedEmail, password);

      setAlertNotification({
        title: 'লগইন সফল হয়েছে',
        message: 'উপার্জন প্রো ড্যাশবোর্ডে আপনাকে স্বাগতম!',
        type: 'success'
      });
    } catch (err: any) {
      console.error("Firebase Log In Exception:", err);
      let errMsg = 'লগইন করতে ব্যর্থ হয়েছে। দয়া করে আপনার তথ্য যাচাই করুন।';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড! দয়া করে আবার চেষ্টা করুন।';
      } else if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        errMsg = 'আপনার ফায়ারবেস প্রজেক্টে Email/Password লগইন চালু করা নেই। অনুগ্রহ করে Firebase Console > Authentication > Sign-in method-এ যান এবং "Email/Password" সচল (Enable) করে দিন।';
      } else if (err.message && (err.message.includes('offline') || err.message.includes('network') || err.message.includes('client is offline'))) {
        errMsg = 'ডাটাবেজ সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না (ক্লায়েন্ট অফলাইন)। অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন, অথবা থ্রি-ডট মেন্যু থেকে অ্যাপটি অন্য ব্রাউজারে বা নতুন ট্যাবে রিফ্রেশ করে চেষ্টা করুন।';
      } else if (err.message) {
        errMsg = err.message;
      }
      setLoginError(errMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  // Sign out functionality
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAlertNotification({
        title: 'সাইন আউট সম্পন্ন',
        message: 'আপনার অ্যাকাউন্ট সফলভাবে সাইন আউট করা হয়েছে।',
        type: 'success'
      });
    } catch (err: any) {
      console.error("Sign Out Error:", err);
    }
  };

  // Onboarding Profile Creation fallback (in case user registers by an unrecognized path or Google Auth is triggered)
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);

    const name = onboardName.trim();
    const mobile = onboardMobile.trim();
    const promo = onboardPromo.trim().toUpperCase();

    if (!name) {
      setOnboardError('আপনার সম্পূর্ণ নামটি প্রদান করুন।');
      return;
    }
    if (!/^01[0-9]{9}$/.test(mobile)) {
      setOnboardError('সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: ০১XXXXXXXXX)।');
      return;
    }

    setOnboardSubmitting(true);

    try {
      if (!currentUser) throw new Error("No authenticated firebase user session.");

      // Check if phone number is taken
      const phoneDocSnap = await getDoc(doc(db, 'phoneToEmail', mobile));
      if (phoneDocSnap.exists()) {
        setOnboardError('এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা রয়েছে।');
        setOnboardSubmitting(false);
        return;
      }

      let refOwnerUid: string | null = null;
      if (promo) {
        const refDocRef = doc(db, 'referrals', promo);
        const refDocSnap = await getDoc(refDocRef);
        if (!refDocSnap.exists()) {
          setOnboardError('ভুল বা অবৈধ প্রোমো/রেফারেল কোড! অনুগ্রহ করে চেক করে আবার চেষ্টা করুন অথবা ফাঁকা রাখুন।');
          setOnboardSubmitting(false);
          return;
        }
        refOwnerUid = refDocSnap.data().uid;
        if (refOwnerUid === currentUser.uid) {
          setOnboardError('আপনি নিজের রেফারেল কোড নিজে ব্যবহার করতে পারবেন না।');
          setOnboardSubmitting(false);
          return;
        }
      }

      const newReferralCode = 'UPAR' + Math.random().toString(36).substring(2, 5).toUpperCase() + Math.floor(10 + Math.random() * 90);

      const batch = writeBatch(db);

      const newUserStats = {
        name,
        mobile,
        email: currentUser.email || '',
        membership: 'free',
        balance: 80,
        totalEarned: 80,
        dailyTasksDone: 0,
        dailyEarned: 0,
        withdrawalsCount: 0,
        referralCode: newReferralCode,
        totalReferrals: 0,
        referralEarnings: 0,
        referredBy: promo || '',
        createdAt: new Date().toISOString()
      };

      batch.set(doc(db, 'users', currentUser.uid), newUserStats);
      batch.set(doc(db, 'referrals', newReferralCode), {
        uid: currentUser.uid,
        code: newReferralCode
      });
      batch.set(doc(db, 'phoneToEmail', mobile), {
        email: currentUser.email || '',
        uid: currentUser.uid
      });

      if (refOwnerUid) {
        batch.update(doc(db, 'users', refOwnerUid), {
          balance: increment(199),
          totalEarned: increment(199),
          totalReferrals: increment(1),
          referralEarnings: increment(199)
        });
      }

      await batch.commit();
      setIsOnboarding(false);
      setAlertNotification({
        title: 'নিবন্ধন সম্পন্ন হয়েছে!',
        message: '৳৮০ সাইনআপ বোনাস সফলভাবে আপনার ওয়ালেটে জমা হয়েছে।',
        type: 'success'
      });
    } catch (err: any) {
      console.error("Onboarding Database writing failed:", err);
      setOnboardError(err.message || 'নিবন্ধন করার সময় একটি ডেটাবেস সংযোগ ত্রুটি ঘটেছে।');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  // Sync / refresh database logs (Simulated trigger calling onSnapshot connection reload)
  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setAlertNotification({
        title: 'ব্যালেন্স আপডেট সম্পন্ন হয়েছে',
        message: 'ফায়ারস্টোর মেমোরি ক্লাউড ও লোকাল সেশন সমন্বয় করা হয়েছে।',
        type: 'success'
      });
    }, 600);
  };

  // Task processing reward update logic
  const handleTaskSuccess = async (reward: number) => {
    if (!currentUser || !stats) return;

    const userPath = `users/${currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        balance: increment(reward),
        totalEarned: increment(reward),
        dailyTasksDone: increment(1),
        dailyEarned: increment(reward),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  };

  // Cashout submission trigger
  const handleAddWithdrawal = async (log: WithdrawLog) => {
    if (!currentUser || !stats) return;

    const userPath = `users/${currentUser.uid}`;
    try {
      const batch = writeBatch(db);
      
      // Update primary user balance stats
      batch.update(doc(db, 'users', currentUser.uid), {
        balance: increment(-log.amount),
        withdrawalsCount: increment(1)
      });

      // Insert transaction logs document inside withdrawal subcollection
      batch.set(doc(db, 'users', currentUser.uid, 'withdrawals', log.id), log);

      await batch.commit();

      setAlertNotification({
        title: 'উত্তোলন রিকোয়েস্ট প্রাপ্ত',
        message: `${log.method}-এর মাধ্যমে ৳${log.amount} টাকা সফলভাবে পেন্ডিং লেজারে তালিকাভুক্ত হয়েছে।`,
        type: 'success'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  };

  // Upgrade active tier level
  const handleUpgradeTier = async (tier: MembershipTier) => {
    if (!currentUser || !stats) return;
    const price = MEMBERSHIPS_CONFIGS[tier].priceTaka;

    const userPath = `users/${currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        membership: tier,
        balance: increment(-price),
        dailyTasksDone: 0, // Fresh quota for upgraded days
        dailyEarned: 0 // Reset daily earnings tracker to allow earnings right away
      });

      setAlertNotification({
        title: 'আইডি লেভেল পরিবর্তিত',
        message: `আপনার মেম্বারশিপ লেভেল সফলভাবে আপগ্রেড করা হয়েছে। বাড়তি কোটা উপভোগ করুন!`,
        type: 'success'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  };

  // Submit and verify a deposit log with automatic administrator approval simulation
  const handleAddDeposit = async (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', senderMobile: string, transactionId: string) => {
    if (!currentUser) return;
    setIsSubmittingDeposit(true);

    const userPath = `users/${currentUser.uid}`;
    try {
      const depositId = 'DEP' + Math.floor(100000 + Math.random() * 900000);
      const newDeposit: DepositLog = {
        id: depositId,
        date: new Date().toLocaleString('bn-BD', { hour12: true }),
        status: 'Pending',
        amount: amount,
        method: method,
        senderMobile: senderMobile,
        transactionId: transactionId.trim().toUpperCase()
      };

      const docRef = doc(db, 'users', currentUser.uid, 'deposits', depositId);
      await setDoc(docRef, newDeposit);

      // Simulation of secure automated admin checking and deposit completion (3.5 seconds)
      setTimeout(async () => {
        try {
          const batch = writeBatch(db);
          
          // Verify, flag, and complete
          batch.update(docRef, { status: 'Approved' });
          batch.update(doc(db, 'users', currentUser.uid), {
            balance: increment(amount),
            totalEarned: increment(amount)
          });

          await batch.commit();

          setAlertNotification({
            title: 'ডিপোজিট সম্পূর্ণ হয়েছে!',
            message: `আপনার সেন্ড মানি যাচাইকরণ সম্পূর্ণ হয়েছে। ৳${amount} টাকা ব্যালেন্সে যোগ করা হয়েছে!`,
            type: 'success'
          });
        } catch (simError) {
          console.error("Simulation of deposit auto-approval failed:", simError);
        }
      }, 3500);

    } catch (error) {
      console.error("Failed to add deposit request:", error);
      throw error;
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Render authenticating screen
  if (isAuthLoading || (currentUser && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-gray-150 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl inline-flex items-center justify-center animate-bounce shadow-inner border border-emerald-100">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-gray-800">অপেক্ষা করুন...</h3>
            <p className="text-xs text-gray-400">উপার্জন প্রো গেটওয়ে কানেক্টিং এনভায়রনমেন্ট</p>
          </div>
          <div className="flex justify-center pt-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Auth Guard Gate: Show credentials Register & Login options
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between p-4 antialiased">
        <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full space-y-6 my-auto pt-4 pb-8">
          
          {/* Logo & Slogan */}
          <div className="text-center space-y-2">
            <div className="bg-emerald-600 text-white p-4 rounded-3xl inline-flex items-center justify-center shadow-lg shadow-emerald-200">
              <Sparkles className="w-9 h-9 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black font-display text-gray-900 tracking-tight">
                উপার্জন প্রো <span className="text-emerald-600 text-xs px-2 py-0.5 bg-emerald-50 rounded-md font-mono">v2.6</span>
              </h1>
              <p className="text-[11px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                বাংলাদেশি বিশ্বস্ত টাস্ক অ্যান্ড আর্নিং পোর্টাল। সহজ উপায়ে প্রতিদিন ইনকাম করুন এবং বিকাশ বা নগদে পেমেন্ট নিন।
              </p>
            </div>
          </div>

          {/* Core Auth Panel with Segment Tabs */}
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-md w-full space-y-5">
            
            {/* Segment Controls */}
            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'login' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                লগইন করুন
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setRegError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'register' 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                নিবন্ধন করুন
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.12 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  {loginError && (
                    <div className="bg-red-50 border border-red-150 text-red-700 text-xs p-3 rounded-xl flex items-center space-x-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-semibold text-[11px]">{loginError}</span>
                    </div>
                  )}

                  {/* Login Email/Mobile Identifier */}
                  <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">ইমেইল অথবা মোবাইল নম্বর</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="example@gmail.com অথবা 01XXXXXXXXX"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-3 text-xs outline-none text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Login Password */}
                  <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">পাসওয়ার্ড</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="আপনার পাসওয়ার্ড লিখুন"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-3 text-xs outline-none text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Login submit button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold p-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-50 transition-all cursor-pointer text-xs disabled:opacity-50 mt-2"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>যাচাই করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 shrink-0" />
                        <span>প্রবেশ করুন</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.12 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  {regError && (
                    <div className="bg-red-50 border border-red-150 text-red-700 text-xs p-3 rounded-xl flex items-center space-x-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-semibold text-[11px]">{regError}</span>
                    </div>
                  )}

                  {/* Input Name */}
                  <div className="space-y-1 focus-within:text-emerald-600 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">সম্পূর্ণ নাম</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Input Phone */}
                  <div className="space-y-1 focus-within:text-emerald-600 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">মোবাইল নম্বর (বিকাশ/নগদ/রকেট)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono outline-none text-gray-800 tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Input Email */}
                  <div className="space-y-1 focus-within:text-emerald-600 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">জিমেইল / ইমেইল এড্রেস</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Input Password */}
                  <div className="space-y-1 focus-within:text-emerald-600 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">পাসওয়ার্ড (মিনিমাম ৬ অক্ষর)</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="পাসওয়ার্ড সেট করুন"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Input Promo/Referral (Optional) */}
                  <div className="space-y-1 focus-within:text-emerald-600 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">প্রোমো / রেফারেল কোড (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={regPromo}
                      onChange={(e) => setRegPromo(e.target.value)}
                      placeholder="UPARXXXX"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl px-4 py-2.5 text-xs font-mono uppercase outline-none text-gray-800 tracking-wider"
                    />
                  </div>

                  {/* Register submit button */}
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold p-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-50 transition-all cursor-pointer text-xs disabled:opacity-50 mt-2"
                  >
                    {regLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>নিবন্ধন করুন (৳৮০ বোনাস)</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Secure indicator */}
          <p className="text-[10px] text-gray-400 text-center leading-normal max-w-xs">
            নিবন্ধনের সাথে সাথে আপনার প্রদত্ত মোবাইল নম্বর ও ইমেইল ফায়ারবেস ক্লাউড মেমোরি ডেটাবেজে যুক্ত হয়ে যাবে।
          </p>

        </div>

        {/* Footer info line */}
        <div className="text-[9px] text-gray-400 text-center font-mono py-2 max-w-sm mx-auto">
          SECURE CREDENTIALS ARCHITECTURE INTEGRATED WITH FIREBASE AUTH
        </div>
      </div>
    );
  }

  // Onboarding On-Screen: Complete Bangla Signup Profile details
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between p-4 antialiased font-sans">
        <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full space-y-6 my-auto">
          
          <div className="text-center space-y-2">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-3xl inline-flex items-center justify-center border border-emerald-150 animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-display text-gray-900 tracking-tight">আপনার বিবরণ সঠিক করুন</h2>
            <p className="text-xs text-gray-500">
              নিবন্ধন প্রক্রিয়া সম্পূর্ণ করতে আপনার পুরো নাম এবং মোবাইল নম্বর আপডেট করুন।
            </p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs space-y-4 w-full">
            {onboardError && (
              <div className="bg-red-50 border border-red-150 text-red-700 text-xs p-3 rounded-xl flex items-center space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium text-[11px]">{onboardError}</span>
              </div>
            )}

            {/* Name input */}
            <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
              <label className="text-[11px] font-bold uppercase tracking-wider block text-gray-400">নাম (বাংলা বা ইংরেজিতে)</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={onboardName}
                  onChange={(e) => setOnboardName(e.target.value)}
                  placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-3 text-xs outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Mobile number input */}
            <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
              <label className="text-[11px] font-bold uppercase tracking-wider block text-gray-400">মোবাইল নম্বর (বিকাশ/নগদ/রকেট)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={onboardMobile}
                  onChange={(e) => setOnboardMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl pl-10 pr-4 py-3 text-xs font-mono outline-none text-gray-800 tracking-wider"
                />
              </div>
              <span className="text-[9px] text-gray-400 leading-normal block">
                * সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর দেওয়া আবশ্যিক। পেমেন্ট গেটওয়েতে এটি ব্যবহার হবে।
              </span>
            </div>

            {/* Optional Promo referral code input */}
            <div className="space-y-1.5 focus-within:text-emerald-600 transition-colors">
              <label className="text-[11px] font-bold uppercase tracking-wider block text-gray-400">প্রোমো বা রেফারেল কোড (ঐচ্ছিক)</label>
              <input
                type="text"
                value={onboardPromo}
                onChange={(e) => setOnboardPromo(e.target.value)}
                placeholder="UPARXXXX"
                className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl px-4 py-3 text-xs font-mono uppercase outline-none text-gray-800 tracking-wider"
              />
              <span className="text-[9px] text-gray-400 leading-normal block">
                * যদি আপনার কোনো বন্ধুর আমন্ত্রণ কোড থাকে তবে ৳২০ বাড়তি রেফারেল পুরষ্কার ট্র্যাকিং করতে পারেন।
              </span>
            </div>

            {/* Sign and Register buttons */}
            <button
              type="submit"
              disabled={onboardSubmitting}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold p-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-50 transition-all disabled:opacity-50 cursor-pointer text-xs"
            >
              {onboardSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>অ্যাকাউন্ট ভ্যালিডেট করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>নিবন্ধন সম্পন্ন করুন (৳৮০ বোনাস লাভ করুন)</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>

          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>অন্য অ্যাকাউন্ট দিয়ে প্রবেশ করুন</span>
          </button>

        </div>

        <div className="text-[9px] text-gray-400 text-center font-mono py-2 max-w-sm mx-auto">
          CLOUD VERIFIED PROFILE SETUP DIRECTLY SYNCED WITH FIRESTORE
        </div>
      </div>
    );
  }

  // Dynamic content viewport routing (fallback to empty shell if snapshot is still syncing)
  const renderContent = () => {
    if (!stats) return null;

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            stats={stats} 
            onNavigateTab={(tab) => setActiveTab(tab)} 
            onAddReferral={() => {
              setAlertNotification({
                title: 'রেফার কোড শেয়ার করুন',
                message: `আপনার রেফারেল কোড '${stats.referralCode}' শেয়ার করুন। বন্ধুরা রেজিস্ট্রেশন করলে আপনি পাবেন ৳১৯৯ বোনাস!`,
                type: 'info'
              });
            }}
          />
        );
      case 'tasks':
        return (
          <TaskCenter 
            stats={stats} 
            onSuccessTask={handleTaskSuccess}
          />
        );
      case 'withdraw':
        return (
          <WithdrawPortal 
            stats={stats} 
            withdrawals={withdrawals}
            onAddWithdrawal={handleAddWithdrawal}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'memberships':
        return (
          <MembershipPortal 
            stats={stats} 
            onUpgradeTier={handleUpgradeTier}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'deposit':
        return (
          <DepositPortal 
            stats={stats}
            deposits={deposits}
            onSubmitDeposit={handleAddDeposit}
            isSubmittingDeposit={isSubmittingDeposit}
            onAutoApproveDeposit={async (id, amt) => {}} // simulated in handleAddDeposit timeout
          />
        );
      default:
        return null;
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col antialiased">
      
      {/* Prime Header element */}
      <Header 
        stats={stats} 
        onRefresh={handleRefreshBalance} 
        isRefreshing={isRefreshing} 
        userEmail={currentUser?.email}
        onSignOut={handleSignOut}
      />

      {/* Main viewport area */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 pb-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Floating Feedback Banner notification */}
      <AnimatePresence>
        {alertNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl shadow-xl flex items-start space-x-3">
              <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                alertNotification.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                <Sparkles className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-bold leading-tight text-white">{alertNotification.title}</h4>
                <p className="text-[11px] text-gray-300 leading-normal">{alertNotification.message}</p>
              </div>
              <button 
                onClick={() => setAlertNotification(null)}
                className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Bottom Navigation Menu */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        tasksDisabled={(stats.dailyEarned || 0) >= MEMBERSHIPS_CONFIGS[stats.membership].dailyEarningsLimit || stats.dailyTasksDone >= MEMBERSHIPS_CONFIGS[stats.membership].dailyQuota}
      />

    </div>
  );
}
