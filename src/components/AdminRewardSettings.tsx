import React, { useState, useEffect } from 'react';
import { AdminTasksManager } from './AdminTasksManager';
import { AdminVideoTaskSettings } from './AdminVideoTaskSettings';
import { Sparkles, Sliders, Layers, Play } from 'lucide-react';

export interface RewardConfig {
  task1Points: number; // Adsterra Task 01
  task2Points: number; // Adsterra Task 02
  monetagPoints: number; // Monetag Task 03
  cpaleadTask1Points: number; // CPAlead DirectCPI
  cpaleadTask2Points: number; // CPAlead CDNFlair
  ayetPoints: number; // ayeT-Studios Task
  cpagripPoints: number; // CPAGrip Campaign
  microtask1Points: number; // Web Visit
  microtask2Points: number; // YouTube Subscribe
  microtask3Points: number; // Short Survey
  timerDuration: number; // in seconds
  userProfitSharePercent: number; // % to user
  cpaleadPointMultiplier: number; // points per $1.00 USD
  offerwall1BaseUrl: string; // CPAlead DirectCPI
  offerwall2BaseUrl: string; // CPAlead CDNFlair
  ayetOfferwallUrl: string; // ayeT-Studios Embed URL
  cpagripOfferwallUrl: string; // CPAGrip Embed URL
  offerwallCustomSubidPrefix?: string;
}

export const DEFAULT_CONFIG: RewardConfig = {
  task1Points: 25, // Adsterra Task 01 (~$0.025 USD)
  task2Points: 30, // Adsterra Task 02 (~$0.030 USD)
  monetagPoints: 40, // Monetag Task (~$0.040 USD)
  cpaleadTask1Points: 150, // CPAlead DirectCPI (~$0.15 USD)
  cpaleadTask2Points: 250, // CPAlead CDNFlair (~$0.25 USD)
  ayetPoints: 200, // ayeT-Studios (~$0.20 USD)
  cpagripPoints: 180, // CPAGrip (~$0.18 USD)
  microtask1Points: 20, // Website visit (~$0.02 USD)
  microtask2Points: 35, // YouTube subscribe (~$0.035 USD)
  microtask3Points: 50, // Quick Survey (~$0.05 USD)
  timerDuration: 15,
  userProfitSharePercent: 50,
  cpaleadPointMultiplier: 1000,
  offerwall1BaseUrl: 'https://www.directcpi.com/wall/wqh8Nz',
  offerwall2BaseUrl: 'https://www.cdnflair.com/wall/yOYtWCo5',
  ayetOfferwallUrl: 'https://www.ayetstudios.com/offers/web?apiKey=65a12f94b8e',
  cpagripOfferwallUrl: 'https://www.cpagrip.com/show.php?l=0&u=382910&id=4291',
  offerwallCustomSubidPrefix: '',
};

export const AdminRewardSettings: React.FC = () => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'tasks_manager' | 'video_settings' | 'global_config'>('tasks_manager');
  const [config, setConfig] = useState<RewardConfig>(DEFAULT_CONFIG);
  const [targetUserId, setTargetUserId] = useState<string>('usr_superadmin_001');
  const [manualPoints, setManualPoints] = useState<number>(50);
  const [savedMsg, setSavedMsg] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('nexvora_reward_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
        });
      } catch (e) {
        setConfig(DEFAULT_CONFIG);
      }
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem('nexvora_reward_config', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('rewardConfigUpdated', { detail: config }));
    window.dispatchEvent(new Event('storage'));
    setSavedMsg('✅ রিওয়ার্ড, অফারওয়াল ও টাস্ক সেটিংস সফলভাবে সেভ করা হয়েছে!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি ডিফল্ট সেটিংস রিসেট করতে চান?')) {
      setConfig(DEFAULT_CONFIG);
      localStorage.setItem('nexvora_reward_config', JSON.stringify(DEFAULT_CONFIG));
      window.dispatchEvent(new CustomEvent('rewardConfigUpdated', { detail: DEFAULT_CONFIG }));
      window.dispatchEvent(new Event('storage'));
      setSavedMsg('🔄 বাস্তবসম্মত ডিফল্ট সেটিংস সফলভাবে লোড করা হয়েছে!');
      setTimeout(() => setSavedMsg(''), 3500);
    }
  };

  const sampleSubid = (config.offerwallCustomSubidPrefix ? `${config.offerwallCustomSubidPrefix}_` : '') + targetUserId;
  const sampleWall1Url = `${config.offerwall1BaseUrl || DEFAULT_CONFIG.offerwall1BaseUrl}?subid=${sampleSubid}`;
  const sampleWall2Url = `${config.offerwall2BaseUrl || DEFAULT_CONFIG.offerwall2BaseUrl}?subid=${sampleSubid}`;
  const sampleAyetUrl = `${config.ayetOfferwallUrl || DEFAULT_CONFIG.ayetOfferwallUrl}&external_identifier=${sampleSubid}`;
  const sampleCpagripUrl = `${config.cpagripOfferwallUrl || DEFAULT_CONFIG.cpagripOfferwallUrl}&tracking_id=${sampleSubid}`;

  const inputClass =
    'w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';

  const inputStyle: React.CSSProperties = {
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
  };

  return (
    <div className="max-w-4xl mx-auto my-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm font-sans space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚙️ টাস্ক, অফারওয়াল ও রিওয়ার্ড কন্ট্রোল হাব</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ভিডিও টাস্ক সেটিংস, স্পন্সর লিঙ্কসমূহ (Adsterra, Monetag, Freecash) ও অফারওয়াল রিওয়ার্ড সিস্টেম নিয়ন্ত্রণ করুন। (১,০০০ PTS = $১.০০ USD)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeAdminSubTab === 'global_config' && (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-600 transition-colors"
            >
              🔄 ডিফল্ট রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveAdminSubTab('tasks_manager')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeAdminSubTab === 'tasks_manager'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>টাস্ক ম্যানেজার</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminSubTab('video_settings')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeAdminSubTab === 'video_settings'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>ভিডিও টাস্ক সেটিংস</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminSubTab('global_config')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeAdminSubTab === 'global_config'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>অফারওয়াল সেটিংস</span>
        </button>
      </div>

      {activeAdminSubTab === 'tasks_manager' ? (
        <div className="pt-2">
          <AdminTasksManager />
        </div>
      ) : activeAdminSubTab === 'video_settings' ? (
        <div className="pt-2">
          <AdminVideoTaskSettings />
        </div>
      ) : (
        <>
          {savedMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span>{savedMsg}</span>
              <button onClick={() => setSavedMsg('')} className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">✕</button>
            </div>
          )}

          {/* Section 1: Quick Sponsored Tasks (Adsterra & Monetag) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>⚡ কুইক স্পন্সরড টাস্ক সেটিংস (Adsterra & Monetag)</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">বাস্তবসম্মত রেট: ২০ - ৫০ PTS ($০.০২ - $০.০৫)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Adsterra ০১ পয়েন্ট:
            </label>
            <input
              type="number"
              min="1"
              value={config.task1Points}
              onChange={(e) => setConfig({ ...config, task1Points: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${(config.task1Points / 1000).toFixed(3)} USD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Adsterra ০২ পয়েন্ট:
            </label>
            <input
              type="number"
              min="1"
              value={config.task2Points}
              onChange={(e) => setConfig({ ...config, task2Points: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${(config.task2Points / 1000).toFixed(3)} USD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Monetag প্রিমিয়াম পয়েন্ট:
            </label>
            <input
              type="number"
              min="1"
              value={config.monetagPoints}
              onChange={(e) => setConfig({ ...config, monetagPoints: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${(config.monetagPoints / 1000).toFixed(3)} USD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              টাইমার ডিউরেশন (সেকেন্ড):
            </label>
            <input
              type="number"
              min="5"
              value={config.timerDuration}
              onChange={(e) => setConfig({ ...config, timerDuration: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              বিজ্ঞাপন দেখার কাউন্টডাউন
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: CPAlead Offerwall Controls */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>🌐 CPAlead অফারওয়াল ও টাস্ক সেটিংস</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">DirectCPI (~150 PTS) & CDNFlair (~250 PTS)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              CPAlead DirectCPI টাস্ক পয়েন্ট:
            </label>
            <input
              type="number"
              min="10"
              value={config.cpaleadTask1Points || 150}
              onChange={(e) => setConfig({ ...config, cpaleadTask1Points: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${((config.cpaleadTask1Points || 150) / 1000).toFixed(2)} USD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              CPAlead CDNFlair টাস্ক পয়েন্ট:
            </label>
            <input
              type="number"
              min="10"
              value={config.cpaleadTask2Points || 250}
              onChange={(e) => setConfig({ ...config, cpaleadTask2Points: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${((config.cpaleadTask2Points || 250) / 1000).toFixed(2)} USD
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            CPAlead অফারওয়াল ০১ URL (DirectCPI):
          </label>
          <input
            type="text"
            value={config.offerwall1BaseUrl}
            onChange={(e) => setConfig({ ...config, offerwall1BaseUrl: e.target.value })}
            placeholder="https://www.directcpi.com/wall/wqh8Nz"
            className={inputClass}
            style={inputStyle}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block break-all font-mono">
            লাইভ প্রিভিউ: <strong className="text-blue-600 dark:text-blue-400">{sampleWall1Url}</strong>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            CPAlead অফারওয়াল ০২ URL (CDNFlair):
          </label>
          <input
            type="text"
            value={config.offerwall2BaseUrl}
            onChange={(e) => setConfig({ ...config, offerwall2BaseUrl: e.target.value })}
            placeholder="https://www.cdnflair.com/wall/yOYtWCo5"
            className={inputClass}
            style={inputStyle}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block break-all font-mono">
            লাইভ প্রিভিউ: <strong className="text-blue-600 dark:text-blue-400">{sampleWall2Url}</strong>
          </span>
        </div>
      </div>

      {/* Section 3: ayeT-Studios / CPAGrip Offerwall Settings */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>🎯 ayeT-Studios ও CPAGrip অফারওয়াল সেটিংস</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">অ্যাক্টিভ পাবলিশার ও কন্টেন্ট লকার ইন্টিগ্রেশন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              ayeT-Studios টাস্ক পয়েন্ট:
            </label>
            <input
              type="number"
              min="10"
              value={config.ayetPoints || 200}
              onChange={(e) => setConfig({ ...config, ayetPoints: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${((config.ayetPoints || 200) / 1000).toFixed(2)} USD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              CPAGrip ক্যাম্পেইন পয়েন্ট:
            </label>
            <input
              type="number"
              min="10"
              value={config.cpagripPoints || 180}
              onChange={(e) => setConfig({ ...config, cpagripPoints: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${((config.cpagripPoints || 180) / 1000).toFixed(2)} USD
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            ayeT-Studios Offerwall Embed URL:
          </label>
          <input
            type="text"
            value={config.ayetOfferwallUrl || 'https://www.ayetstudios.com/offers/web?apiKey=65a12f94b8e'}
            onChange={(e) => setConfig({ ...config, ayetOfferwallUrl: e.target.value })}
            placeholder="https://www.ayetstudios.com/offers/web?apiKey=YOUR_API_KEY"
            className={inputClass}
            style={inputStyle}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block break-all font-mono">
            লাইভ প্রিভিউ: <strong className="text-purple-600 dark:text-purple-400">{sampleAyetUrl}</strong>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            CPAGrip Content Locker / Offerwall URL:
          </label>
          <input
            type="text"
            value={config.cpagripOfferwallUrl || 'https://www.cpagrip.com/show.php?l=0&u=382910&id=4291'}
            onChange={(e) => setConfig({ ...config, cpagripOfferwallUrl: e.target.value })}
            placeholder="https://www.cpagrip.com/show.php?l=0&u=382910&id=4291"
            className={inputClass}
            style={inputStyle}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block break-all font-mono">
            লাইভ প্রিভিউ: <strong className="text-rose-600 dark:text-rose-400">{sampleCpagripUrl}</strong>
          </span>
        </div>
      </div>

      {/* Section 4: Daily Microtasks Configuration */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>📋 ডেইলি মাইক্রোটাস্ক রিওয়ার্ড সেটিংস (Daily Microtasks)</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">ওয়েব ভিজিট, ইউটিউব ও সার্ভে টাস্ক</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              ওয়েবসাইট ভিজিট পয়েন্ট:
            </label>
            <input
              type="number"
              min="5"
              value={config.microtask1Points || 20}
              onChange={(e) => setConfig({ ...config, microtask1Points: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${((config.microtask1Points || 20) / 1000).toFixed(3)} USD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              ইউটিউব চ্যানেল ভিজিট পয়েন্ট:
            </label>
            <input
              type="number"
              min="5"
              value={config.microtask2Points || 35}
              onChange={(e) => setConfig({ ...config, microtask2Points: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${((config.microtask2Points || 35) / 1000).toFixed(3)} USD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              কুইক সার্ভে পয়েন্ট:
            </label>
            <input
              type="number"
              min="5"
              value={config.microtask3Points || 50}
              onChange={(e) => setConfig({ ...config, microtask3Points: Number(e.target.value) })}
              className={inputClass}
              style={inputStyle}
            />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              = ${((config.microtask3Points || 50) / 1000).toFixed(3)} USD
            </span>
          </div>
        </div>
      </div>

      {/* Section 5: Revenue Multiplier & SubID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            পয়েন্ট কনভার্সন রেট ($১.০০ USD পে-আউট = কত পয়েন্ট):
          </label>
          <input
            type="number"
            min="100"
            value={config.cpaleadPointMultiplier || 1000}
            onChange={(e) => setConfig({ ...config, cpaleadPointMultiplier: Number(e.target.value) })}
            className={inputClass}
            style={inputStyle}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            স্ট্যান্ডার্ড: 1,000 PTS = $1.00 USD (১ পয়েন্ট = $০.০০১)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            কাস্টম SubID প্রিফিক্স (ঐচ্ছিক):
          </label>
          <input
            type="text"
            value={config.offerwallCustomSubidPrefix || ''}
            onChange={(e) => setConfig({ ...config, offerwallCustomSubidPrefix: e.target.value })}
            placeholder="e.g. nex"
            className={inputClass}
            style={inputStyle}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
            ইউজার ট্র্যাকিং ID: <strong className="text-slate-700 dark:text-slate-300">{sampleSubid}</strong>
          </span>
        </div>
      </div>

      {/* Section 6: Revenue Share Split */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
          <span>ইউজার বনাম প্ল্যাটফর্ম প্রফিট মার্জিন:</span>
          <span className="text-blue-600 dark:text-blue-400">
            ইউজার শেয়ার: {config.userProfitSharePercent}% | প্ল্যাটফর্ম মার্জিন: {100 - config.userProfitSharePercent}%
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="90"
          step="5"
          value={config.userProfitSharePercent}
          onChange={(e) => setConfig({ ...config, userProfitSharePercent: Number(e.target.value) })}
          className="w-full cursor-pointer accent-blue-600"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          $১.০০ USD বিজ্ঞাপন রেভিনিউ থেকে ইউজার পাবে {config.userProfitSharePercent}% = {((config.cpaleadPointMultiplier || 1000) * (config.userProfitSharePercent / 100)).toFixed(0)} PTS (${(config.userProfitSharePercent / 100).toFixed(2)}) এবং প্ল্যাটফর্ম পাবে ${(1 - config.userProfitSharePercent / 100).toFixed(2)} USD।
        </p>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSaveConfig}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>💾 সকল রিওয়ার্ড ও অফারওয়াল সেটিংস সেভ করুন</span>
      </button>

      {/* Section 7: Manual Wallet Credit */}
      <div className="pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          💳 সরাসরি ইউজারের ওয়ালেটে ব্যালেন্স যোগ করুন
        </h4>
        <div className="flex flex-wrap gap-2.5">
          <input
            type="text"
            placeholder="ইউজার আইডি (e.g. usr_superadmin_001)"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="flex-2 min-w-[200px] px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm"
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="পয়েন্ট পরিমাণ"
            value={manualPoints}
            onChange={(e) => setManualPoints(Number(e.target.value))}
            className="flex-1 min-w-[120px] px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-lg text-sm"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={async () => {
              if (!targetUserId) {
                alert('ইউজার আইডি দিন');
                return;
              }
              try {
                const token = localStorage.getItem('nexvora_token');
                const res = await fetch('/api/user/add-points', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({
                    userId: targetUserId,
                    points: manualPoints,
                    taskType: 'manual',
                    taskTitle: 'Admin Manual Credit Adjustment'
                  })
                });
                const data = await res.json();
                const cur = Number(localStorage.getItem(`points_${targetUserId}`) || localStorage.getItem('user_points') || '0');
                const updated = cur + Number(manualPoints);
                localStorage.setItem(`points_${targetUserId}`, updated.toString());
                localStorage.setItem('user_points', updated.toString());

                window.dispatchEvent(new CustomEvent('balanceUpdated', {
                  detail: { points: updated, added: manualPoints, wallet: data?.wallet, newBalance: data?.availableBalance }
                }));
                window.dispatchEvent(new Event('storage'));

                alert(`🎉 সাফল্য! ইউজার [${targetUserId}] এর ওয়ালেটে ${manualPoints} পয়েন্ট যোগ করা হয়েছে।`);
              } catch (err) {
                alert('পয়েন্ট যোগ করতে সমস্যা হয়েছে');
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
          >
            + ব্যালেন্সে যোগ করুন
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AdminRewardSettings;
