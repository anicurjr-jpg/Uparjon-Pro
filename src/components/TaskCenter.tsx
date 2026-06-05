/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, HelpCircle, ArrowRight, Loader2, Sparkles, 
  Settings, Layers, RefreshCw, Cpu, Check, AlertTriangle, BookOpen
} from 'lucide-react';
import { UserStats, TaskChallenge, TaskType } from '../types';
import { MEMBERSHIPS_CONFIGS } from '../data/memberships';
import { 
  GK_CHALLENGES, PROOFREADING_CHALLENGES, LABELING_CHALLENGES, 
  SURVEY_CHALLENGES, MATH_CAPTCHA_CHALLENGES, generateMathChallenge, generateTextCaptcha,
  banglaToEnglishDigits, matchNumericAnswer, englishToBanglaDigits
} from '../data/tasks';
import { motion, AnimatePresence } from 'motion/react';

interface TaskCenterProps {
  stats: UserStats;
  onSuccessTask: (reward: number) => void;
}

export default function TaskCenter({ stats, onSuccessTask }: TaskCenterProps) {
  const currentTier = MEMBERSHIPS_CONFIGS[stats.membership];
  const dailyLimit = currentTier.dailyEarningsLimit;
  const earnedToday = stats.dailyEarned || 0;
  const quotaReached = earnedToday >= dailyLimit || stats.dailyTasksDone >= currentTier.dailyQuota;

  const [activeCategory, setActiveCategory] = useState<TaskType>('math');
  const [loading, setLoading] = useState(false);
  const [dualHandshakeMode, setDualHandshakeMode] = useState<'api' | 'fallback'>('api');
  const [challenge, setChallenge] = useState<TaskChallenge | null>(null);

  // Track the active sequential index (1 to 250) for each of the 5 categories
  const [taskIndices, setTaskIndices] = useState<Record<TaskType, number>>(() => {
    try {
      const saved = localStorage.getItem('task_indices_v3');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load task indices:", e);
    }
    return {
      math: 1,
      gk: 1,
      proofreading: 1,
      labeling: 1,
      survey: 1,
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('task_indices_v3', JSON.stringify(taskIndices));
    } catch (e) {
      console.error("Failed to save task indices:", e);
    }
  }, [taskIndices]);
  
  // Interaction bindings
  const [typedAnswer, setTypedAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [surveyResponse, setSurveyResponse] = useState('');
  
  // Feedback and validation
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'success' | 'error'; message: string; reward?: number } | null>(null);

  // Load a task when category changes, or when task index changes
  useEffect(() => {
    if (!quotaReached) {
      handleLoadChallenge();
    }
  }, [activeCategory, quotaReached, taskIndices[activeCategory]]);

  // Dual-Layer Resilient Task Fetcher
  const handleLoadChallenge = async () => {
    setLoading(true);
    setFeedback(null);
    setTypedAnswer('');
    setSelectedOption('');
    setSurveyResponse('');

    try {
      // 1. API Handshake attempt
      const response = await fetch('/api/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: activeCategory, 
          userId: 'anicurjr',
          taskIndex: taskIndices[activeCategory]
        })
      });
      
      const text = await response.text();
      
      // Check if it is valid JSON, or if it returned HTML index instead (common SPA fallback issue)
      if (text.trim().startsWith('<!DOCTYPE') || !response.ok) {
        throw new Error('Non-JSON response received from server endpoint. Initiating fallover.');
      }

      const data = JSON.parse(text);
      setChallenge(data.challenge);
      setDualHandshakeMode('api');
    } catch (error) {
      // 2. Local Fallback - Seamless and Infinite execution
      setDualHandshakeMode('fallback');
      const generated = generateLocalChallenge(activeCategory);
      setChallenge(generated);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalChallenge = (type: TaskType): TaskChallenge => {
    const currentIdx = taskIndices[type] || 1;
    let list: TaskChallenge[] = [];
    switch (type) {
      case 'math':
        list = MATH_CAPTCHA_CHALLENGES;
        break;
      case 'gk':
        list = GK_CHALLENGES;
        break;
      case 'proofreading':
        list = PROOFREADING_CHALLENGES;
        break;
      case 'labeling':
        list = LABELING_CHALLENGES;
        break;
      case 'survey':
        list = SURVEY_CHALLENGES;
        break;
      default:
        list = MATH_CAPTCHA_CHALLENGES;
    }
    
    // Safely retrieve the item from the list using the current index
    const index = Math.max(0, Math.min(list.length - 1, currentIdx - 1));
    return list[index];
  };

  const handleAdvanceTask = () => {
    setTaskIndices(prev => {
      const currentVal = prev[activeCategory] || 1;
      const nextVal = (currentVal % 250) + 1; // loop from 1 to 250
      return {
        ...prev,
        [activeCategory]: nextVal
      };
    });
  };

  // Submit and verify task handler
  const handleSubmitTask = async () => {
    if (!challenge) return;
    setSubmitting(true);
    setFeedback(null);

    // Prepare answer payload based on type
    let answerText = '';
    if (challenge.type === 'survey') {
      answerText = surveyResponse;
    } else if (challenge.options) {
      answerText = selectedOption;
    } else {
      answerText = typedAnswer;
    }

    if (!answerText.trim()) {
      setFeedback({ status: 'error', message: 'অনুগ্রহ করে সম্পূর্ণ উত্তর বা তথ্য পূরণ করুন।' });
      setSubmitting(false);
      return;
    }

    // Survey restriction parameters
    if (challenge.type === 'survey' && challenge.minCharRequired && answerText.trim().length < challenge.minCharRequired) {
      setFeedback({
        status: 'error',
        message: `আপনার মতামত অত্যন্ত সংক্ষিপ্ত। তথ্য মানসম্মত করতে কমপক্ষে ১৫টি অক্ষর লিখুন (বর্তমানে ${answerText.trim().length}টি রয়েছে)`
      });
      setSubmitting(false);
      return;
    }

    try {
      // 1. Dual-Layer Handler: Attempt API Verification
      const response = await fetch('/api/verify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          userAnswer: answerText,
          category: challenge.type,
          stats: stats,
        })
      });

      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE') || !response.ok) {
        throw new Error('API verify failed, switching to offline validation engine.');
      }

      const resData = JSON.parse(text);
      if (resData.correct) {
        processTaskSuccess();
      } else {
        setFeedback({ status: 'error', message: 'দুঃখিত! আপনার উত্তরটি সঠিক হয়নি। আবার চেষ্টা করুন।' });
      }
    } catch (e) {
      // 2. Offline / Local validation rule logic
      let verifySuccess = false;

      if (challenge.type === 'math') {
        const standardUser = banglaToEnglishDigits(answerText.trim());
        const standardCorrect = banglaToEnglishDigits(challenge.correctAnswer || '');
        verifySuccess = standardUser.toLowerCase() === standardCorrect.toLowerCase();
      } else if (challenge.type === 'survey') {
        verifySuccess = answerText.trim().length >= (challenge.minCharRequired || 15);
      } else {
        verifySuccess = answerText.trim() === (challenge.correctAnswer || '');
      }

      if (verifySuccess) {
        processTaskSuccess();
      } else {
        setFeedback({ status: 'error', message: 'দুঃখিত, উত্তরটি ভুল হয়েছে। দয়া করে সঠিক তথ্য টাইপ করুন।' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const processTaskSuccess = () => {
    const minReward = currentTier.rewardMin;
    const maxReward = currentTier.rewardMax;
    let selectedReward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;

    const remainingAllowance = Math.max(0, dailyLimit - earnedToday);
    if (selectedReward > remainingAllowance) {
      selectedReward = remainingAllowance;
    }

    if (selectedReward <= 0) {
      setFeedback({
        status: 'error',
        message: 'আজকের উপার্জনের বা জমার সীমা পূর্ণ হয়ে গিয়েছে! আগামীকাল পুনরায় চেষ্টা করুন।'
      });
      return;
    }

    setFeedback({
      status: 'success',
      message: `অভিনন্দন! আপনার কাজটি সফলভাবে মূল্যায়িত হয়েছে।`,
      reward: selectedReward,
    });

    // Advance task index sequentially
    handleAdvanceTask();

    onSuccessTask(selectedReward);
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* Top filter select bar */}
      <div className="bg-white rounded-2xl p-2 border border-gray-150 shadow-3xs flex space-x-1 overflow-x-auto select-none no-scrollbar">
        {[
          { id: 'math' as TaskType, title: 'অংক ও ক্যাপচা' },
          { id: 'gk' as TaskType, title: 'সাধারণ জ্ঞান' },
          { id: 'proofreading' as TaskType, title: 'বানান শুদ্ধি' },
          { id: 'labeling' as TaskType, title: 'লেবেলিং' },
          { id: 'survey' as TaskType, title: 'সার্ভে মতামত' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`task-btn-select-${tab.id}`}
            onClick={() => setActiveCategory(tab.id)}
            className={`text-xs font-semibold whitespace-nowrap px-3.5 py-1.8 rounded-xl transition-all ${
              activeCategory === tab.id
                ? 'bg-emerald-600 text-white shadow-3xs'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Network / Offline Resilience Indicator indicator */}
      <div className="flex items-center justify-between px-2 text-[10px]">
        <div className="flex items-center space-x-1.5 text-gray-505">
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>প্রসেসিং ইঞ্জিন:</span>
          {dualHandshakeMode === 'api' ? (
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">কুয়াড-ক্লাউড এপিআই</span>
          ) : (
            <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded animate-pulse">রিসিলিয়েন্ট লোকাল অটোমেটন</span>
          )}
        </div>
        <span className="text-gray-400 font-mono">ID: {challenge?.id || 'N/A'}</span>
      </div>

      {/* Main Task Console */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm relative">
        <AnimatePresence mode="wait">
          {quotaReached ? (
            <motion.div 
              key="quota-limiter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-3"
            >
              <div className="bg-amber-50 text-amber-600 p-4 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-md font-bold text-gray-800">আজকের দৈনিক কোটা সমাপ্ত</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed font-sans">
                আপনার মেম্বারশিপ প্যাকেজের দৈনিক কাজের সর্বোচ্চ সীমা (৳{dailyLimit} অথবা {currentTier.dailyQuota}টি কাজ) আপনি স্পর্শ করেছেন। আগামীকাল পুনরায় আপনার কোটা সচল হবে অথবা আরও বেশি আয়ের জন্য মেম্বারশিপ আপগ্রেড করতে পারেন।
              </p>
            </motion.div>
          ) : loading ? (
            <div key="loading-spinner" className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <span className="text-xs text-gray-450 font-medium">নিরাপদ ডাবল হ্যান্ডশেক লোড হচ্ছে...</span>
            </div>
          ) : challenge ? (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {challenge.type === 'math' ? 'অংক ও ক্যাপচা' : challenge.type === 'gk' ? 'সাধারণ জ্ঞান' : challenge.type === 'proofreading' ? 'বানান শুদ্ধি' : challenge.type === 'labeling' ? 'লেবেলিং' : 'সার্ভে মতামত'}
                </span>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border border-emerald-150 shrink-0">
                  টাস্ক নম্বর: {englishToBanglaDigits(taskIndices[activeCategory].toString())} / ২৫০
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 leading-relaxed font-sans">
                  {challenge.questionBn}
                </p>
              </div>

              {/* Dynamic content context display */}
              {challenge.context && (
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-3.5 text-center font-mono text-lg font-bold text-gray-800 tracking-wide">
                  {challenge.context}
                </div>
              )}

              {/* Input forms depending on challenge type */}
              <div className="pt-2">
                
                {/* 1. Multiple Options Choice */}
                {challenge.options && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {challenge.options.map((option, idx) => (
                      <button
                        key={idx}
                        id={`option-choice-btn-${idx}`}
                        onClick={() => {
                          if (!feedback) setSelectedOption(option);
                        }}
                        disabled={!!feedback || submitting}
                        className={`text-left p-3.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-between ${
                          selectedOption === option
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{option}</span>
                        {selectedOption === option && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Text / CAPTCHA Typed Answer */}
                {!challenge.options && challenge.type !== 'survey' && (
                  <div className="space-y-1">
                    <input
                      id="typed-challenge-input"
                      type="text"
                      className="w-full bg-gray-50 hover:bg-gray-100focus:bg-white text-sm font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-4 py-3 outline-none transition-all placeholder:text-gray-400 text-center"
                      placeholder="আপনার উত্তরটি এখানে সঠিকভাবে লিখুন"
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      disabled={!!feedback || submitting}
                      autoComplete="off"
                    />
                    <p className="text-[10px] text-gray-400 text-center">
                      (প্রয়োজনে বাংলা বা ইংরেজি সংখ্যা যেকোনো ফরম্যাটেই লিখতে পারেন)
                    </p>
                  </div>
                )}

                {/* 3. Narrative Survey Views */}
                {challenge.type === 'survey' && (
                  <div className="space-y-1.5">
                    <textarea
                      id="survey-challenge-textarea"
                      rows={3}
                      className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white text-xs font-medium rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-3 py-2.5 outline-none transition-all placeholder:text-gray-400 leading-relaxed"
                      placeholder="এখানে আপনার গঠনমূলক মন্তব্য লিখুন (কমপক্ষে ১৫টি অক্ষর হতে হবে)..."
                      value={surveyResponse}
                      onChange={(e) => setSurveyResponse(e.target.value)}
                      disabled={!!feedback || submitting}
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 px-1">
                      <span>মতামত মান যাচাইকারক স্বয়ংক্রিয় সক্রিয়</span>
                      <span className={surveyResponse.length >= 15 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                        অক্ষর সংখ্যা: {surveyResponse.length}/১৫
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Feedback Alert box */}
              {feedback && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-3.5 rounded-xl flex items-start space-x-2.5 border ${
                    feedback.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {feedback.status === 'success' ? (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-bold leading-none">{feedback.message}</p>
                    {feedback.reward && (
                      <p className="text-sm font-bold text-emerald-700 flex items-center font-mono">
                        <Sparkles className="w-4 h-4 mr-1 text-emerald-500 fill-current animate-pulse" />
                        আয় হয়েছে: +৳{feedback.reward} টাকা!
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Control Submissions Actions */}
              <div className="pt-2 flex space-x-2">
                {!feedback ? (
                  <button
                    id="submit-challenge-btn"
                    onClick={handleSubmitTask}
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>যাচাই করা হচ্ছে...</span>
                      </>
                    ) : (
                      <span>টাস্ক জমা দিন</span>
                    )}
                  </button>
                ) : (
                  <button
                    id="next-challenge-btn"
                    onClick={handleLoadChallenge}
                    className="flex-1 bg-gray-950 hover:bg-gray-900 border border-black text-white font-semibold text-xs py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-1"
                  >
                    <span>পরবর্তী কাজ লোড করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  id="skip-challenge-btn"
                  onClick={handleLoadChallenge}
                  disabled={submitting}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-500 py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  title="অন্য কাজ পরিবর্তন করুন"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              কাজ লোড করা সম্ভব হয়নি। পরিবর্তন করতে রিফ্রেশ বোতামে চাপ দিন।
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Guidelines Sheet info */}
      <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-[11px] text-gray-500 space-y-2 leading-relaxed">
        <h4 className="font-bold text-gray-700 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          কিভাবে কাজ করবেন এবং বেশি টাকা আয় করবেন?
        </h4>
        <p>
          ১. <strong>বানান এবং গাণিতিক কোড:</strong> আপনার সাবমিট করা উত্তরটি যেন একদম নিখুঁত হয় তা নিশ্চিত করুন। যুক্তবর্ণ ব্যবহারের ক্ষেত্রে সঠিক ল্যাঙ্গুয়েজ কিপ্যাড ব্যবহার করুন।
        </p>
        <p>
          ২. <strong>মেম্বারশিপ আপগ্রেড:</strong> দৈনিক কাজের কোটা বাড়ানো এবং কোনো নূন্যতম উত্তোলনের সীমা ছাড়া প্রতিটি কাজে ৮ গুণ বেশি পেমেন্ট পাওয়ার জন্য আজই <strong>সিলভার</strong> বা <strong>ডায়মন্ড মেম্বারশিপে</strong> আপগ্রেড করুন।
        </p>
      </div>

    </div>
  );
}
