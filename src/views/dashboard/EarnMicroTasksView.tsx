import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EarnSection } from '../../components/EarnSection';
import { useUserBalance } from '../../lib/userBalance';
import {
  Flame,
  Coins,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Award,
  Clock,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Zap,
} from 'lucide-react';

export const EarnMicroTasksView: React.FC = () => {
  const { user, wallet, updateWallet, refreshMe } = useAuth();
  const {
    points: userPoints,
    availableUsd,
    totalEarnedUsd,
    pendingUsd,
    formattedUsd,
    formattedPoints,
    refreshBalance: syncBalanceHook,
  } = useUserBalance();
  const [copied, setCopied] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const pendingPoints = Math.round(pendingUsd * 1000);
  const effectiveUserId = user?.id || user?.username || 'usr_superadmin_001';

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(effectiveUserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshBalance = async () => {
    if (refreshingBalance) return;
    setRefreshingBalance(true);
    try {
      if (refreshMe) {
        await refreshMe();
      }
      syncBalanceHook();
    } catch (e) {
      console.warn('Error refreshing balance:', e);
    } finally {
      setTimeout(() => setRefreshingBalance(false), 600);
    }
  };

  // Direct handler passed to EarnSection to immediately add points and update both local and context wallet
  const handleAddPoints = (addedPts: number) => {
    const newPts = userPoints + addedPts;
    const addedUsd = addedPts / 1000;
    const newBal = Number((newPts / 1000).toFixed(4));

    localStorage.setItem('nexvora_user_points', newPts.toString());
    localStorage.setItem('points', newPts.toString());
    localStorage.setItem('user_points', newPts.toString());
    localStorage.setItem('nexvora_wallet_balance', newBal.toFixed(2));
    if (user?.id) {
      localStorage.setItem(`points_${user.id}`, newPts.toString());
    }

    window.dispatchEvent(new CustomEvent('pointsUpdated', { detail: { points: newPts, added: addedPts } }));
    window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { newBalance: newBal, points: newPts, added: addedPts } }));

    if (updateWallet) {
      updateWallet({
        availableBalance: (wallet?.availableBalance || 0) + addedUsd,
        totalEarned: (wallet?.totalEarned || 0) + addedUsd,
      });
    }

    if (refreshMe) {
      refreshMe().catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Balance Header */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info column */}
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Nexvora Earning Hub
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                <Zap className="w-3 h-3 text-emerald-400" />
                ইনস্ট্যান্ট ওয়ালেট ক্রেডিট
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                Active Partners
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
              টাস্ক ও মাল্টি-অফারওয়াল সেন্টার
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              স্পন্সরড অ্যাড, ভিডিও, CPAlead অফারওয়াল, ayeT-Studios/CPAGrip এবং ডেইলি মাইক্রোটাস্ক সম্পন্ন করুন। অর্জিত পয়েন্ট সরাসরি আপনার ওয়ালেট ব্যালেন্সে ইনস্ট্যান্ট জমা হবে।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                ১,০০০ Points = $১.০০ USD
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                সার্বক্ষণিক কাজ উপলব্ধ
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                নিরাপদ পেমেন্ট গ্যারান্টি
              </span>
            </div>
          </div>

          {/* Right points & balance card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col justify-between gap-4 min-w-[280px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Points Balance
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-medium">
                    Withdrawable Balance
                  </span>
                </div>
              </div>
              <button
                onClick={handleRefreshBalance}
                disabled={refreshingBalance}
                title="Refresh Wallet Balance"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingBalance ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {/* Main points display */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-['Space_Grotesk'] tracking-tight">
                  {userPoints.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-500/90 uppercase tracking-wider">
                  PTS
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">নগদ মূল্য:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  ${availableUsd.toFixed(2)} USD (≈ ৳{(availableUsd * 120).toFixed(0)} BDT)
                </span>
              </div>
            </div>

            {/* Quick stats mini-row */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">পেন্ডিং এসক্রো</span>
                <span className="font-mono font-semibold text-amber-300">
                  {pendingPoints.toLocaleString()} PTS (${pendingUsd.toFixed(2)})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">মোট লাইফটাইম আয়</span>
                <span className="font-mono font-semibold text-cyan-300">
                  ${totalEarnedUsd.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Tracking ID & Rules Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">আপনার ট্র্যাকিং একাউন্ট ID:</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300">
            <span className="truncate max-w-[160px] sm:max-w-[220px]">
              {effectiveUserId}
            </span>
            <button
              onClick={handleCopyUserId}
              className="p-1 hover:text-white transition cursor-pointer"
              title="কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {copied && <span className="text-emerald-400 text-[11px] font-medium">ক্লিপবোর্ডে কপি হয়েছে!</span>}
        </div>

        <button
          onClick={() => setShowFaq(!showFaq)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-end sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>কাজের নিয়ম ও সতর্কতা</span>
          {showFaq ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Rules and Guidelines */}
      {showFaq && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs leading-relaxed">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>সতর্কতা ও কাজের আবশ্যকীয় নির্দেশাবলী</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
              <p className="font-bold text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                VPN বা প্রক্সি নিষিদ্ধ
              </p>
              <p className="text-slate-400 text-[11px]">
                কখনো ভিপিএন বা ফেইক আইপি ব্যবহার করবেন না। সিস্টেম স্বয়ংক্রিয়ভাবে প্রক্সি শনাক্ত করলে পয়েন্ট বাতিল হতে পারে।
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
              <p className="font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                টাইমার পূর্ণ হওয়া পর্যন্ত অপেক্ষা
              </p>
              <p className="text-slate-400 text-[11px]">
                প্রতিটি টাস্কের জন্য নির্ধারিত সময় বিজ্ঞাপন পেজে সক্রিয় থাকুন। টাইমার শেষ হলে ক্লেইম পপআপ ভেসে উঠবে।
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
              <p className="font-bold text-emerald-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 shrink-0" />
                তাৎক্ষণিক উত্তোলন সুবিধা
              </p>
              <p className="text-slate-400 text-[11px]">
                অর্জিত পয়েন্ট সরাসরি ডলারে রূপান্তরিত হয় এবং বিকাশ, নগদ, রকেট বা ক্রিপ্টোর মাধ্যমে যেকোনো সময় ক্যাশআউট করা যায়।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Earning Center with 4 High-Converting Tabs */}
      <EarnSection 
        currentUser={user} 
        user={user}
        onAddPoints={handleAddPoints}
        onBalanceUpdate={handleRefreshBalance} 
      />
    </div>
  );
};

export default EarnMicroTasksView;
