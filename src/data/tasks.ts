/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskChallenge } from '../types';

// Convert Bengali digits (০-৯) to English digits (0-9)
export function banglaToEnglishDigits(str: string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (m) => bnDigits.indexOf(m).toString());
}

// Convert English digits (0-9) to Bengali digits (০-৯)
export function englishToBanglaDigits(str: string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (m) => bnDigits[parseInt(m, 10)]);
}

// Check if answer is numeric and matches either English or Bengali digit form
export function matchNumericAnswer(correctVal: number, userAns: string): boolean {
  const sanitized = userAns.trim();
  const englishParsed = banglaToEnglishDigits(sanitized);
  return parseFloat(englishParsed) === correctVal;
}

// ==========================================
// 1. Math & Captcha Challenges (250 items)
// ==========================================
function generateMathCaptchaDataset(): TaskChallenge[] {
  const data: TaskChallenge[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let i = 1; i <= 250; i++) {
    if (i % 2 === 0) {
      // Even Index: Math Problem
      const num1 = (i * 3 + 17) % 80 + 10;
      const num2 = (i * 7 + 29) % 80 + 5;
      const isAdd = i % 4 === 0;
      const ans = isAdd ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
      const symbol = isAdd ? '+' : '-';
      const maxVal = Math.max(num1, num2);
      const minVal = Math.min(num1, num2);
      const bn1 = englishToBanglaDigits((isAdd ? num1 : maxVal).toString());
      const bn2 = englishToBanglaDigits((isAdd ? num2 : minVal).toString());

      data.push({
        id: `math-${i}`,
        type: 'math',
        questionBn: `নিচের গাণিতিক অংকটি সমাধান করুন (টাস্ক নং: ${i}/২৫০):`,
        context: `${bn1} ${symbol} ${bn2} = কত?`,
        correctAnswer: ans.toString(),
      });
    } else {
      // Odd Index: Captcha Code
      // Stable pseudo-random seed code based on index
      let code = '';
      let seed = i * 2947 + 5813;
      for (let c = 0; c < 6; c++) {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        code += chars.charAt(seed % chars.length);
      }

      data.push({
        id: `captcha-${i}`,
        type: 'math',
        questionBn: `নিচে প্রদর্শিত সিকিউরিটি ক্যাপচা কোডটি সঠিকভাবে টাইপ করুন (টাস্ক নং: ${i}/২৫০):`,
        context: code,
        correctAnswer: code,
      });
    }
  }
  return data;
}

// ==========================================
// 2. GK Challenges (250 items)
// ==========================================
function generateGKDataset(): TaskChallenge[] {
  const data: TaskChallenge[] = [];

  const districts = [
    { name: 'ঢাকা', division: 'ঢাকা' },
    { name: 'গাজীপুর', division: 'ঢাকা' },
    { name: 'ফরিদপুর', division: 'ঢাকা' },
    { name: 'টাঙ্গাইল', division: 'ঢাকা' },
    { name: 'কিশোরগঞ্জ', division: 'ঢাকা' },
    { name: 'নারায়ণগঞ্জ', division: 'ঢাকা' },
    { name: 'মুন্সীগঞ্জ', division: 'ঢাকা' },
    { name: 'গোপালগঞ্জ', division: 'ঢাকা' },
    { name: 'চট্টগ্রাম', division: 'চট্টগ্রাম' },
    { name: 'কক্সবাজার', division: 'চট্টগ্রাম' },
    { name: 'রাঙ্গামাটি', division: 'চট্টগ্রাম' },
    { name: 'বান্দরবান', division: 'চট্টগ্রাম' },
    { name: 'খাগড়াছড়ি', division: 'চট্টগ্রাম' },
    { name: 'কুমিল্লা', division: 'চট্টগ্রাম' },
    { name: 'ফেনী', division: 'চট্টগ্রাম' },
    { name: 'নোয়াখালী', division: 'চট্টগ্রাম' },
    { name: 'চাঁদপুর', division: 'চট্টগ্রাম' },
    { name: 'ব্রাহ্মণবাড়িয়া', division: 'চট্টগ্রাম' },
    { name: 'সিলেট', division: 'সিলেট' },
    { name: 'মৌলভীবাজার', division: 'সিলেট' },
    { name: 'হবিগঞ্জ', division: 'সিলেট' },
    { name: 'সুনামগঞ্জ', division: 'সিলেট' },
    { name: 'খুলনা', division: 'খুলনা' },
    { name: 'যশোর', division: 'খুলনা' },
    { name: 'কুষ্টিয়া', division: 'খুলনা' },
    { name: 'বাগেরহাট', division: 'খুলনা' },
    { name: 'সাতক্ষীরা', division: 'খুলনা' },
    { name: 'ঝিনাইদহ', division: 'খুলনা' },
    { name: 'চুয়াডাঙ্গা', division: 'খুলনা' },
    { name: 'রাজশাহী', division: 'রাজশাহী' },
    { name: 'বগুড়া', division: 'রাজশাহী' },
    { name: 'পাবনা', division: 'রাজশাহী' },
    { name: 'নাটোর', division: 'রাজশাহী' },
    { name: 'নওগাঁ', division: 'রাজশাহী' },
    { name: 'সিরাজগঞ্জ', division: 'রাজশাহী' },
    { name: 'রংপুর', division: 'রংপুর' },
    { name: 'দিনাজপুর', division: 'রংপুর' },
    { name: 'কুড়িগ্রাম', division: 'রংপুর' },
    { name: 'লালমনিরহাট', division: 'রংপুর' },
    { name: 'গাইবান্ধা', division: 'রংপুর' },
    { name: 'নীলফামারী', division: 'রংপুর' },
    { name: 'পঞ্চগড়', division: 'রংপুর' },
    { name: 'বরিশাল', division: 'বরিশাল' },
    { name: 'পটুয়াখালী', division: 'বরিশাল' },
    { name: 'ভোলা', division: 'বরিশাল' },
    { name: 'পিরোজপুর', division: 'বরিশাল' },
    { name: 'ময়মনসিংহ', division: 'ময়মনসিংহ' },
    { name: 'শেরপুর', division: 'ময়মনসিংহ' },
    { name: 'নেত্রকোনা', division: 'ময়মনসিংহ' },
    { name: 'জামালপুর', division: 'ময়মনসিংহ' }
  ];

  const landmarks = [
    { name: 'কক্সবাজার সমুদ্র সৈকত', info: 'বিশ্বের দীর্ঘতম প্রাকৃতিক বালুকাময় সৈকত', district: 'কক্সবাজার' },
    { name: 'সেন্ট মার্টিন দ্বীপ', info: 'বাংলাদেশের একমাত্র প্রবাল দ্বীপ', district: 'কক্সবাজার' },
    { name: 'ষাট গম্বুজ মসজিদ', info: 'ইউনেস্কো বিশ্ব ঐতিহ্যবাহী ঐতিহাসিক মসজিদ', district: 'বাগেরহাট' },
    { name: 'পাহাড়পুর বৌদ্ধ বিহার (সোমপুর মহাবিহার)', info: 'নওগাঁর বিখ্যাত ঐতিহাসিক প্রাচীন নিদর্শন', district: 'নওগাঁ' },
    { name: 'মহাস্থানগড়', info: 'পুণ্ড্রবর্ধনের প্রাচীন রাজধানী ও ঐতিহাসিক স্থান', district: 'বগুড়া' },
    { name: 'লালবাগ কেল্লা', info: 'মুঘল আমলের ঐতিহ্যবাহী দুর্গ', district: 'ঢাকা' },
    { name: 'আহসান মঞ্জিল', info: 'বুড়িগঙ্গার তীরে অবস্থিত রাজকীয় প্রাসাদ', district: 'ঢাকা' },
    { name: 'সাজেক ভ্যালি', info: 'মেঘের রাজ্য হিসেবে পরিচিত পর্যটন স্পট', district: 'রাঙ্গামাটি' },
    { name: 'জাফলং ও বিছনাকান্দি', info: 'ভারতের সীমান্ত ঘেঁষা পাথুরে নদী ও পর্যটন কেন্দ্র', district: 'সিলেট' },
    { name: 'কুয়াকাটা সৈকত', info: 'সূর্যোদয় ও সূর্যাস্ত একসাথে অবলোকন করার দীর্ঘ সমুদ্র সৈকত', district: 'পটুয়াখালী' },
    { name: 'পাথরঘাটা বা হরিণঘাটা গোলপাতা বন', info: 'সুন্দরবনের পাশ্ববর্তী আকর্ষণীয় শ্বাসমূলীয় অরণ্য', district: 'বরগুনা' },
    { name: 'শালবন বিহার', info: 'ময়নামতির বিখ্যাত প্রাচীন পুরাকীর্তি ও মঠ', district: 'কুমিল্লা' },
    { name: 'কান্তজীউ মন্দির', info: 'টেরাকোটা কারুকার্যে খচিত ঐতিহাসিক মন্দির', district: 'দিনাজপুর' }
  ];

  const bangladeshFacts = [
    { q: 'বাংলাদেশের জাতীয় ফল কোনটি?', a: 'কাঁঠাল', opt: ['আম', 'কাঁঠাল', 'লিচু', 'তরমুজ'] },
    { q: 'পদ্মা সেতুর স্প্যান সংখ্যা কতটি?', a: '৪১টি', opt: ['৪০টি', '৪১টি', '৪২টি', '৩৯টি'] },
    { q: 'বাংলাদেশের জাতীয় স্মৃতিসৌধের স্থপতি কে?', a: 'সৈয়দ মাইনুল হোসেন', opt: ['হামিদুর রহমান', 'মুস্তাফা মনোয়ার', 'সৈয়দ মাইনুল হোসেন', 'কামরুল হাসান'] },
    { q: 'বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?', a: 'সাকা হাফং', opt: ['তাজিংডং', 'কেওক্রাডং', 'সাকা হাফং', 'জোকোথাং'] },
    { q: 'রবীন্দ্রনাথ ঠাকুর কত সালে নোবেল পুরস্কার লাভ করেন?', a: '১৯১৩ সালে', opt: ['১৯১৩ সালে', '১৯১১ সালে', '১৯১৫ সালে', '১৯১৯ সালে'] },
    { q: 'বাংলাদেশের জাতীয় ফুল কোনটি?', a: 'শাপলা', opt: ['গোলাপ', 'পদ্ম', 'শাপলা', 'শিউলি'] },
    { q: 'বাংলাদেশের জাতীয় কবি কে?', a: 'কাজী নজরুল ইসলাম', opt: ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'জসীমউদ্দীন', 'জীবনানন্দ দাশ'] },
    { q: 'বাংলাদেশের প্রথম রাষ্ট্রপতির নাম কী?', a: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান', opt: ['তাজউদ্দীন আহমদ', 'বঙ্গবন্ধু শেখ মুজিবুর রহমান', 'সৈয়দ নজরুল ইসলাম', 'মোহাম্মদ উল্লাহ'] },
    { q: 'বাংলাদেশের স্বাধীনতা দিবস কত তারিখে পালিত হয়?', a: '২৬শে মার্চ', opt: ['১৬ই ডিসেম্বর', '২৬শে মার্চ', '২১শে ফেব্রুয়ারি', '১৪ই এপ্রিল'] },
    { q: 'বাংলাদেশের বিজয় দিবস কত তারিখে পালিত হয়?', a: '১৬ই ডিসেম্বর', opt: ['১৬ই ডিসেম্বর', '২৬শে মার্চ', '২১শে ফেব্রুয়ারি', '৭ই মার্চ'] },
    { q: 'বাংলাদেশের জাতীয় প্রতীক শাপলা ফুলের দুই পাশে কী রয়েছে?', a: 'ধানের শীষ', opt: ['গম গাছ', 'পাট পাতা', 'ধানের শীষ', 'চা পাতা'] },
    { q: 'বাংলাদেশের সংবিধানে কয়টি অনুচ্ছেদ রয়েছে?', a: '১৫৩টি', opt: ['১৫০টি', '১৫৩টি', '১৬০টি', '১১২টি'] },
    { q: 'সুন্দরবনকে ওয়ার্ল্ড হেরিটেজ সাইট হিসেবে ঘোষণা করে কোন সংস্থা?', a: 'ইউনেস্কো (UNESCO)', opt: ['ইউনিসেফ', 'ইউনেস্কো (UNESCO)', 'বিশ্বব্যাংক', 'হু (WHO)'] },
    { q: 'বাংলাদেশের টাকার কোড নাম কী?', a: 'BDT', opt: ['BDT', 'TK', 'BAN', 'BD'] },
    { q: 'বাংলাদেশের জাতীয় ফল কাঁঠাল এর ইংরেজি নাম কী?', a: 'Jackfruit', opt: ['Mango', 'Jackfruit', 'Watermelon', 'Papaya'] },
    { q: 'জাতীয় স্মৃতিসৌধ কোথায় অবস্থিত?', a: 'সাভার, ঢাকা', opt: ['শাহবাগ, ঢাকা', 'সাভার, ঢাকা', 'মিরপুর, ঢাকা', 'টঙ্গী, গাজীপুর'] }
  ];

  const ictFacts = [
    { q: 'কম্পিউটারের প্রধান প্রসেসিং ইউনিট কোনটি?', a: 'সিপিইউ (CPU)', opt: ['সিপিইউ (CPU)', 'র্যাম (RAM)', 'মাদারবোর্ড', 'হার্ড ডিস্ক'] },
    { q: 'কম্পিউটারের অস্থায়ী স্মৃতিশক্তি বা মেমোরি কোনটি?', a: 'র্যাম (RAM)', opt: ['রম (ROM)', 'র্যাম (RAM)', 'হার্ড ডিস্ক', 'পেনড্রাইভ'] },
    { q: 'বিশ্বব্যাপী নেটওয়ার্কের নেটওয়ার্ক বা ইন্টারনেটের জনক কে?', a: 'ভিন্ট সার্ফ', opt: ['চার্লস ব্যাবেজ', 'বিল গেটস', 'ভিন্ট সার্ফ', 'স্টিভ জবস'] },
    { q: 'আধুনিক কম্পিউটারের জনক কে?', a: 'চার্লস ব্যাবেজ', opt: ['চার্লস ব্যাবেজ', 'অ্যালান টিউরিং', 'জন ভন নিউম্যান', 'স্টিভ জবস'] },
    { q: 'সোশ্যাল মিডিয়া ফেসবুক বা মেটার প্রতিষ্ঠাতা কে?', a: 'মার্ক জুকারবার্গ', opt: ['বিল গেটস', 'স্টিভ জবস', 'মার্ক জুকারবার্গ', 'এলন মাস্ক'] },
    { q: 'নিচের কোনটি সার্চ ইঞ্জিন নয়?', a: 'ফেসবুক', opt: ['গুগল', 'বিং', 'ইয়াহু', 'ফেসবুক'] },
    { q: 'মোবাইল অপারেটিং সিস্টেম অ্যান্ড্রয়েড কোন টেক জায়ান্টের মালিকানাধীন?', a: 'গুগল', opt: ['মাইক্রোসফট', 'অ্যাপল', 'গুগল', 'স্যামসাং'] },
    { q: '১ গিগাবাইট (1 GB) সমান কত মেগাবাইট?', a: '১০২৪ মেগাবাইট', opt: ['১০০০ মেগাবাইট', '১০২৪ মেগাবাইট', '১২০০ মেগাবাইট', '৫১২ মেগাবাইট'] }
  ];

  // Compile exactly 250 questions
  for (let i = 1; i <= 250; i++) {
    const section = i % 4;
    let questionText = '';
    let correctAnswer = '';
    let options: string[] = [];

    if (section === 0) {
      // Districts division questions
      const d = districts[(i * 11) % districts.length];
      questionText = `${d.name} জেলাটি বাংলাদেশের কোন প্রশাসনিক বা রাষ্ট্রীয় বিভাগের অন্তর্গত?`;
      correctAnswer = `${d.division} বিভাগ`;
      const allDivisions = ['ঢাকা বিভাগ', 'চট্টগ্রাম বিভাগ', 'সিলেট বিভাগ', 'খুলনা বিভাগ', 'রাজশাহী বিভাগ', 'রংপুর বিভাগ', 'বরিশাল বিভাগ', 'ময়মনসিংহ বিভাগ'];
      const otherDivs = allDivisions.filter(div => div !== correctAnswer);
      // Pick 3 random div options
      const optSet = new Set<string>();
      optSet.add(correctAnswer);
      let s = i;
      while (optSet.size < 4) {
        s = (s * 71 + 39) % otherDivs.length;
        optSet.add(otherDivs[s]);
      }
      options = Array.from(optSet);
    } else if (section === 1) {
      // Landmark details questions
      const lm = landmarks[(i * 9) % landmarks.length];
      questionText = `বিখ্যাত পর্যটন স্পট বা পুরাকীর্তি "${lm.name}" (যা "${lm.info}" নামে পরিচিত) বাংলাদেশের কোন জেলায় অবস্থিত?`;
      correctAnswer = `${lm.district} জেলা`;
      
      const distOptions = [`${lm.district} জেলা`];
      let s = i;
      while (distOptions.length < 4) {
        s = (s * 41 + 13) % districts.length;
        const candidate = `${districts[s].name} জেলা`;
        if (!distOptions.includes(candidate)) {
          distOptions.push(candidate);
        }
      }
      options = distOptions;
    } else if (section === 2) {
      // Bangladesh general facts
      const fact = bangladeshFacts[(i * 13) % bangladeshFacts.length];
      questionText = fact.q;
      correctAnswer = fact.a;
      options = [...fact.opt];
    } else {
      // ICT general facts
      const fact = ictFacts[(i * 17) % ictFacts.length];
      questionText = fact.q;
      correctAnswer = fact.a;
      options = [...fact.opt];
    }

    // Shuffle options array statically based on index to ensure deterministic order
    const shuffledOptions = [...options];
    for (let o = shuffledOptions.length - 1; o > 0; o--) {
      const targetIdx = (o + i) % shuffledOptions.length;
      const tmp = shuffledOptions[o];
      shuffledOptions[o] = shuffledOptions[targetIdx];
      shuffledOptions[targetIdx] = tmp;
    }

    data.push({
      id: `gk-${i}`,
      type: 'gk',
      questionBn: `প্রশ্ন ${i}: ${questionText}`,
      options: shuffledOptions,
      correctAnswer: correctAnswer,
    });
  }

  return data;
}

// ==========================================
// 3. Proofreading/Spelling Challenges (250 items)
// ==========================================
function generateProofreadingDataset(): TaskChallenge[] {
  const data: TaskChallenge[] = [];

  const wordPairs = [
    { incorrect: 'সত্রু', correct: 'শত্রু' },
    { incorrect: 'দূর্গা', correct: 'দুর্গা' },
    { incorrect: 'শারিরীক', correct: 'শারীরিক' },
    { incorrect: 'কনিষ্ট', correct: 'কনিষ্ঠ' },
    { incorrect: 'সান্তনা', correct: 'সান্ত্বনা' },
    { incorrect: 'নিরস', correct: 'নীরস' },
    { incorrect: 'ইতিমধ্যে', correct: 'ইতোমধ্যে' },
    { incorrect: 'উপরোক্ত', correct: 'উপরিউক্ত' },
    { incorrect: 'দারিদ্রতা', correct: 'দারিদ্র্য' },
    { incorrect: 'উৎকর্ষতা', correct: 'উৎকর্ষ' },
    { incorrect: 'সৌজন্যতা', correct: 'সৌজন্য' },
    { incorrect: 'কৌতহুল', correct: 'কৌতহুল' },
    { incorrect: 'বুদ্ধিজীবি', correct: 'বুদ্ধিজীবী' },
    { incorrect: 'আকাঙ্খা', correct: 'আকাঙ্ক্ষা' },
    { incorrect: 'শ্রদ্ধাঞ্জলী', correct: 'শ্রদ্ধাঞ্জলি' },
    { incorrect: 'মুমূর্ষ', correct: 'মুমূর্ষু' },
    { incorrect: 'ব্যাকরন', correct: 'ব্যাকরণ' },
    { incorrect: 'সমীচিন', correct: 'সমীচীন' },
    { incorrect: 'পিপিলিকা', correct: 'পিপীলিকা' },
    { incorrect: 'অপরাহ্ন', correct: 'অপরাহ্ণ' },
    { incorrect: 'গৃহীনি', correct: 'গৃহিণী' },
    { incorrect: 'লংঘন', correct: 'লঙ্ঘন' },
    { incorrect: 'মরিচিকা', correct: 'মরীচিকা' },
    { incorrect: 'দুষকর', correct: 'দুষ্কর' },
    { incorrect: 'আবিস্কার', correct: 'আবিষ্কার' },
    { incorrect: 'পরিস্কার', correct: 'পরিষ্কার' },
    { incorrect: 'নিস্কৃতি', correct: 'নিষ্কৃতি' },
    { incorrect: 'সাদৃশ্যতা', correct: 'সাদৃশ্য' },
    { incorrect: 'ঐক্যতা', correct: 'ঐক্য' },
    { incorrect: 'তীরষ্কার', correct: 'তিরস্কার' },
    { incorrect: 'পুরষ্কার', correct: 'পুরস্কার' },
    { incorrect: 'উজ্জল', correct: 'উজ্জ্বল' },
    { incorrect: 'কংকাল', correct: 'কঙ্কাল' },
    { incorrect: 'উদঘাটন', correct: 'উদ্ঘাটন' },
    { incorrect: 'তৎক্ষনাৎ', correct: 'তৎক্ষণাৎ' },
    { incorrect: 'মধ্যাহ্ন', correct: 'মধ্যাহ্ন' },
    { incorrect: 'পূর্বাহ্ণ', correct: 'পূর্বাহ্ণ' },
    { incorrect: 'সুষ্ঠ', correct: 'সুষ্ঠু' },
    { incorrect: 'উচিৎ', 'correct': 'উচিত' },
    { incorrect: 'অদ্ভুত', 'correct': 'অদ্ভুত' },
    { incorrect: 'ভূগোল', 'correct': 'ভূগোল' },
    { incorrect: 'সূর্য্য', 'correct': 'সূর্য' },
    { incorrect: 'ধূলো', 'correct': 'ধুলো' },
    { incorrect: 'পূবালী', 'correct': 'পুবালি' },
    { incorrect: 'গবেষনা', 'correct': 'গবেষণা' },
    { incorrect: 'ঘোষনা', 'correct': 'ঘোষণা' },
    { incorrect: 'প্রেরন', 'correct': 'প্রেরণ' },
    { incorrect: 'পোষ্ট', 'correct': 'পোস্ট' },
    { incorrect: 'মাষ্টার', 'correct': 'মাস্টার' },
    { incorrect: 'রেজিষ্ট্রেশন', 'correct': 'রেজিস্ট্রেশন' },
    { incorrect: 'ষ্টেশন', 'correct': 'স্টেশন' },
    { incorrect: 'খ্রিষ্টাব্দ', 'correct': 'خ্রিস্টাব্দ' },
    { incorrect: 'নূন্যতম', 'correct': 'ন্যূনতম' },
    { incorrect: 'ব্যাক্ষা', 'correct': 'ব্যাখ্যা' },
    { incorrect: 'স্থায়ীত্ব', 'correct': 'স্থায়িত্ব' },
    { incorrect: 'দায়ীত্ব', 'correct': 'দায়িত্ব' },
    { incorrect: 'প্রতিযোগীতা', 'correct': 'প্রতিযোগিতা' },
    { incorrect: 'सहযোগীতা', 'correct': 'সহযোগিতা' },
    { incorrect: 'উপযোগীতা', 'correct': 'উপযোগিতা' },
    { incorrect: 'নীরব', 'correct': 'নীরব' },
    { incorrect: 'জ্বলন্ত', 'correct': 'জ্বলন্ত' },
    { incorrect: 'উচ্ছ্বাস', 'correct': 'উচ্ছ্বাস' },
    { incorrect: 'কমিটি', 'correct': 'কমিটি' },
    { incorrect: 'ব্যাক্তি', 'correct': 'ব্যক্তি' }
  ];

  for (let i = 1; i <= 250; i++) {
    const pair = wordPairs[(i * 7) % wordPairs.length];
    
    if (i % 2 === 0) {
      // Type A: Written Spelling Question
      data.push({
        id: `proof-${i}`,
        type: 'proofreading',
        questionBn: `অশুদ্ধ শব্দটি হচ্ছে: "${pair.incorrect}"। এর সঠিক বাংলা বানান কী হবে? টাইপ করে লিখুন (টাস্ক নং: ${i}/২৫০):`,
        correctAnswer: pair.correct,
      });
    } else {
      // Type B: MCQ Selection Question
      const options = [
        pair.correct,
        pair.incorrect,
        pair.correct + 'ী',
        pair.incorrect + 'ু'
      ];

      // Shuffle options statically
      for (let o = options.length - 1; o > 0; o--) {
        const targetIdx = (o + i) % options.length;
        const tmp = options[o];
        options[o] = options[targetIdx];
        options[targetIdx] = tmp;
      }

      data.push({
        id: `proof-${i}`,
        type: 'proofreading',
        questionBn: `নিচে দেওয়া শুদ্ধ ও সঠিক বানান সমৃদ্ধ অপশনটি নির্বাচন করুন (টাস্ক নং: ${i}/২৫০):`,
        options: options,
        correctAnswer: pair.correct,
      });
    }
  }

  return data;
}

// ==========================================
// 4. Sentiment Labeling Challenges (250 items)
// ==========================================
function generateLabelingDataset(): TaskChallenge[] {
  const data: TaskChallenge[] = [];

  const products = [
    'স্মার্টফোন', 'হেডফোন', 'স্মার্টওয়াচ', 'ক্যাম্পিং ব্যাগ', 'ল্যাপটপ', 
    'পাওয়ার ব্যাংক', 'রাইস কুকার', 'ডিজিটাল ক্যামেরা', 'টি-শার্ট', 'শীতল এসি'
  ];

  const posTemplates = [
    'পণ্যটির মান অসাধারণ, সবার কেনা উচিত এবং আমি খুব সন্তুষ্ট।',
    'খুবই চমৎকার সার্ভিস এবং প্রোডাক্টটি দেখতে বেশ আকর্ষণীয় ও আধুনিক।',
    '১০০% জেনুইন অরিজিনাল জিনিস পেয়েছি, ডেলিভারিও অনেক ফার্স্ট ছিল।',
    'অল্প দামের মধ্যে সেরা একটি প্রোডাক্ট, যার কোয়ালিটি বেশ উঁচুমাপের।',
    'এটি ব্যবহার করে আমি অত্যন্ত আনন্দিত ও সন্তুষ্ট, কোনো ত্রুটি নেই।'
  ];

  const negTemplates = [
    'অত্যন্ত ফালতু কোয়ালিটির পণ্য! কেউ ভুলেও এটি কিনবেন না।',
    '২ দিন ব্যবহারের পরেই নষ্ট হয়ে গেছে, পুরাই টাকা অপচয়!',
    'ডেলিভারি দিতে অনেক বেশি দেরি করেছে এবং কাঁচ ভাঙা ছিল।',
    'সম্পূর্ণ ডুপ্লিকেট নকল মাল দিয়েছে, একদম ঠকিয়ে দেওয়া হয়েছে।',
    'কাস্টমার সাপোর্ট অনেক জঘন্য ও ধীরগতির, কল করলেও তারা ধরে না।'
  ];

  const neuTemplates = [
    'পণ্যটি মোটামুটি কাজের, তবে এর প্যাকেজিং আরও উন্নত করলে ভালো হতো।',
    'দাম অনুযায়ী মানের দিক থেকে সাধারণ কাজ চালানোর মতো প্রোডাক্ট।',
    'কাজ করা যায় কিন্তু ফিনিশিং পুরোপুরি প্রফেশনাল লেভেলের বলে মনে হয়নি।',
    'ডেলিভারি সময়মতো এসেছে, ভালোমন্দ রিভিউ আরও কিছুদিন ব্যবহার করে দেব।',
    'সাধারণ মানের পণ্য, তুলনামূলকভাবে খুব আহামরি বা খারাপ কোনোটিই নয়।'
  ];

  const newsCategories = [
    { title: 'খেলাধুলা', sentences: [
      'আজকের ঐতিহাসিক ফুটবল ডার্বি ম্যাচে বাংলাদেশ দল দারুণ জয় পেয়েছে।',
      'বিশ্বকাপের রুদ্ধশ্বাস ফাইনালে শেষ মুহূর্তের রোমাঞ্চকর পয়েন্ট অর্জন।',
      'চলতি সপ্তাহে অনুশীলনী ক্যাম্পিং শুরু করতে চলেছেন জাতীয় দলের খেলোয়াড়রা।',
      'আইপিএল ও বিপিএল আসরের নতুন নিলাম নিয়ে চূড়ান্ত খসড়া প্রকাশ।'
    ]},
    { title: 'বিজ্ঞান ও প্রযুক্তি', sentences: [
      'মঙ্গল গ্রহে তরল পানির নতুন আলামত ও প্রবাহের ছবি আবিষ্কার করেছে নাসা।',
      'নতুন কৃত্তিম বুদ্ধিমত্তা এআই চিপ বাজারে ছাড়ার আনুষ্ঠানিক ঘোষণা দিল ইন্টেল।',
      'পাসওয়ার্ড ছাড়াই সাইবার ডিভাইস লগইন করার অভিনব পদ্ধতি তৈরি হলো।',
      'কম্পিউটারের প্রসেসর গতি কয়েকগুণ বাড়ানোর জন্য ন্যানো-প্রযুক্তি সচল।'
    ]},
    { title: 'অর্থনীতি ও ব্যবসা', sentences: [
      'আজ দেশের শেয়ার বাজারের মূল সূচকে বড় পতন ও ব্যবসায়িক নিষ্ক্রিয়তা।',
      'দেশীয় রপ্তানি বাড়াতে নতুন শুল্ক ছাড় সুবিধা ঘোষণা দিয়েছে বাণিজ্য মন্ত্রণালয়।',
      'ব্যাংক ঋণের সুদের হার বৃদ্ধি পাওয়ায় মধ্যবিত্ত পরিবারে উদ্বেগের সৃষ্টি।',
      'ক্ষুদ্র উদ্যোক্তাদের জন্য সহজ শর্তে ঋণ দেওয়ার উদ্যোগ নিয়েছে কেন্দ্রীয় ব্যাংক।'
    ]},
    { title: 'বিনোদন ও সিনেমা', sentences: [
      'ঈদ উৎসবে মুক্তি পাওয়া নতুন সিনেমাটি দেখতে সিনেমা হলে উপচে পড়া ভিড়।',
      'অসামান্য অভিনয়ের জন্য জাতীয় চলচ্চিত্র বাৎসরিক পুরস্কারে ভূষিত হলেন নায়ক।',
      'নতুন গানের মিউজিক অ্যালবাম ও ভিডিওটি সোশ্যাল সাইটে রেকর্ড ভিউ অর্জন করেছে।',
      'বিশ্বখ্যাত চলচ্চিত্র উৎসবে মনোনীত হলো বাংলাদেশের একটি সমাদৃত নাটক।'
    ]}
  ];

  for (let i = 1; i <= 250; i++) {
    if (i <= 130) {
      // Sentiment Analysis Labeling (130 Items)
      const p = products[i % products.length];
      const sentimentType = i % 3; // 0=pos, 1=neg, 2=neu
      let text = '';
      let correctAns = '';

      if (sentimentType === 0) {
        text = `"${posTemplates[(i * 3) % posTemplates.length].replace('পণ্য', p).replace('প্রোডাক্ট', p)}"`;
        correctAns = 'ইতিবাচক (Positive)';
      } else if (sentimentType === 1) {
        text = `"${negTemplates[(i * 3) % negTemplates.length].replace('পণ্য', p).replace('প্রোডাক্ট', p)}"`;
        correctAns = 'নেতিবাচক (Negative)';
      } else {
        text = `"${neuTemplates[(i * 3) % neuTemplates.length].replace('পণ্য', p).replace('প্রোডাক্ট', p)}"`;
        correctAns = 'নিরপেক্ষ (Neutral)';
      }

      data.push({
        id: `label-${i}`,
        type: 'labeling',
        questionBn: `নিচের মন্তব্যটির মনোভাব (Sentiment Emotion) সঠিকভাবে সিলেক্ট করুন (টাস্ক নং: ${i}/২৫০):`,
        context: text,
        options: ['ইতিবাচক (Positive)', 'নেতিবাচক (Negative)', 'নিরপেক্ষ (Neutral)'],
        correctAnswer: correctAns,
      });

    } else {
      // News/Category Classification Labeling (120 Items)
      const catObj = newsCategories[i % newsCategories.length];
      const sentence = catObj.sentences[(i * 5) % catObj.sentences.length];

      data.push({
        id: `label-${i}`,
        type: 'labeling',
        questionBn: `নিচের অনুচ্ছেদ বা সংবাদটি তথ্য বিশ্লেষণ করে সঠিক ক্যাটাগরি হিসেবে সিলেক্ট করুন (টাস্ক নং: ${i}/২৫০):`,
        context: `"${sentence}"`,
        options: ['খেলাধুলা', 'বিজ্ঞান ও প্রযুক্তি', 'অর্থনীতি ও ব্যবসা', 'বিনোদন ও সিনেমা'],
        correctAnswer: catObj.title,
      });
    }
  }

  return data;
}

// ==========================================
// 5. Survey & Opinion Writing Challenges (250 items)
// ==========================================
function generateSurveyDataset(): TaskChallenge[] {
  const data: TaskChallenge[] = [];

  const surveyTopics = [
    'ইন্টারনেট খরচ ও কলরেট কমানোর বিষয়ে',
    'লোকাল বাস ও গণপরিবহনে অতিরিক্ত ভাড়া আদায় প্রতিরোধে',
    'অনলাইন শিক্ষার সুযোগ আরও আধুনিকায়ন নিয়ে',
    'আপনার এলাকায় বিদ্যুৎ সরবরাহ ও ঘন ঘন লোডশেডিং নিয়ে',
    'আইটি ও প্রযুক্তিতে তরুণদের দক্ষতা ট্রেনিং দেওয়ার গুরুত্ব সম্পর্কে',
    'ফ্রি ফ্রিল্যান্সিং সেশন ও ফ্রিল্যান্সারদের সুরক্ষায়',
    'সবজি ও নিত্যপ্রয়োজনীয় জিনিসপত্রের অতিরিক্ত বাজারমূল্য নিয়ন্ত্রণে',
    'আইফোন বা দামি গ্যাজেটের শুল্ক কমানো ও সহজলভ্যকরণ প্রসঙ্গে',
    'অনলাইন পেমেন্ট গেটওয়ে বিকাশ ও নগদ এর চার্জ কমানো সম্পর্কে',
    'শহরের ট্রাফিক জ্যাম সমস্যা দূরীকরণ ও সড়ক নিয়মাবলী বাস্তবায়নে',
    'পড়ালেখার পাশাপাশি শিক্ষার্থীদের স্ব-নির্ভর আয় করার উদ্যোগ সম্পর্কে',
    'স্মার্ট বাংলাদেশ গড়ার উদ্যোগে সরকারি সেবাসমূহ ডিজিটাল করার বিষয়ে',
    'যুবকদের ফাস্ট-ফুড ও অস্বাস্থ্যকর কার্বনেটেড ড্রিংকস খাওয়া বর্জন বিষয়ে',
    'আপনার এলাকায় ড্রেনেজ সংস্কার ও পরিচ্ছন্নতা সপ্তাহ আযোজনে'
  ];

  const templates = [
    'মোবাইল বা ডিজিটাল সার্ভিস সেবার ক্ষেত্রে [Topic] উন্নত করার জন্য আপনার ব্যক্তিগত ২ টি সেরা প্রস্তাবনা কী হবে? (কমপক্ষে ১৫টি অক্ষরের মতামত দিন)',
    'আপনার এলাকায় জীবনযাত্রার মান বৃদ্ধিতে [Topic] সরকারি বা বেসরকারি প্রশাসন থেকে কী ধরনের সাহায্য প্রয়োজন? (কমপক্ষে ১৫টি অক্ষরের মতামত দিন)',
    'আজকের ডিজিটাল যুগে [Topic] তরুণ এবং শিক্ষার্থীদের কীভাবে আরও সহায়তা বা উদ্যোগ নিয়ে কাজ করতে পারে? (কমপক্ষে ১৫টি অক্ষরের মতামত দিন)',
    '[Topic] কার্যকর বাস্তবায়ন করার জন্য আপনার এলাকার নাগরিকদের দায়িত্বশীল আচরণ কেমন হওয়া দরকার? (কমপক্ষে ১৫টি অক্ষরের মতামত দিন)',
    'ভবিষ্যৎ স্মার্ট সমাজ গঠনে [Topic] সফল করার প্রধান প্রধান ৩ টি প্রতিবন্ধকতা ও তা উৎরে ওঠার উপায় সম্পর্কে লিখুন।'
  ];

  for (let i = 1; i <= 250; i++) {
    const topic = surveyTopics[(i * 11) % surveyTopics.length];
    const temp = templates[(i * 9) % templates.length];
    const finalQuestion = temp.replace('[Topic]', topic);

    data.push({
      id: `survey-${i}`,
      type: 'survey',
      questionBn: `সার্ভে টাস্ক ${i}: ${finalQuestion} (কমপক্ষে ১৫টি অক্ষরের মতামত লিখুন):`,
      minCharRequired: 15,
    });
  }

  return data;
}

// Static instantiation of exactly 250 elements each
export const GK_CHALLENGES: TaskChallenge[] = generateGKDataset();
export const PROOFREADING_CHALLENGES: TaskChallenge[] = generateProofreadingDataset();
export const LABELING_CHALLENGES: TaskChallenge[] = generateLabelingDataset();
export const SURVEY_CHALLENGES: TaskChallenge[] = generateSurveyDataset();
export const MATH_CAPTCHA_CHALLENGES: TaskChallenge[] = generateMathCaptchaDataset();

// Keep backward compatibility, wrap dynamic generation with seeds or return fixed index if loaded under fallback
export function generateMathChallenge(): TaskChallenge {
  const items = MATH_CAPTCHA_CHALLENGES.filter(x => x.id.startsWith('math'));
  const randomIdx = Math.floor(Math.random() * items.length);
  return items[randomIdx];
}

export function generateTextCaptcha(): TaskChallenge {
  const items = MATH_CAPTCHA_CHALLENGES.filter(x => x.id.startsWith('captcha'));
  const randomIdx = Math.floor(Math.random() * items.length);
  return items[randomIdx];
}
