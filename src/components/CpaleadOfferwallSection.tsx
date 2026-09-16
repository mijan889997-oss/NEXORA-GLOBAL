import React, { useState, useEffect, useRef } from 'react';
import {
  Coins,
  Sparkles,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Gift,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Transaction } from '../types';

interface CpaleadOfferwallSectionProps {
  transactions?: Transaction[];
  onRefreshData?: () => void;
}

export const CpaleadOfferwallSection: React.FC<CpaleadOfferwallSectionProps> = ({
  transactions = [],
  onRefreshData,
}) => {
  const { user, wallet } = useAuth();
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedSubId, setCopiedSubId] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic user ID parameter for CPAlead subid
  const effectiveUserId = user?.id || 'guest_user';
  const offerwallUrl = `https://www.fastrsrvr.com/wall/yOYtWCo5?subid=${encodeURIComponent(effectiveUserId)}`;

  // Filter CPAlead transactions
  const cpaleadTransactions = (transactions || []).filter(
    (t) =>
      t.referenceType === 'cpalead_offer' ||
      (t.description && t.description.toLowerCase().includes('cpalead'))
  );

  const totalEarnedUsd = cpaleadTransactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  // 1.00 USD = 1,000 Coins
  const totalEarnedCoins = Math.round(totalEarnedUsd * 1000);

  // User available coins calculated from wallet balance
  const userBalance = wallet?.availableBalance ?? 0;
  const userCoinsBalance = Math.round(userBalance * 1000);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(offerwallUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopySubId = async () => {
    try {
      await navigator.clipboard.writeText(effectiveUserId);
      setCopiedSubId(true);
      setTimeout(() => setCopiedSubId(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRefresh = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!user) {
    return (
      <div className="p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Coins className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 border border-amber-800/60 text-amber-400">
              CPAlead Offers
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              $1.00 = 1,000 Coins
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white font-['Space_Grotesk']">
            Sign In to Access CPAlead Offers & Earn Coins
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Complete quick surveys, app installs, and simple quests. Sign in to automatically bind your user ID for instant coin crediting to your ledger balance.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <a
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-lg"
          >
            Sign In to Account
          </a>
          <a
            href="/register"
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Create Free Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="cpalead-offers-section" ref={containerRef}>
      {/* Top Banner & Metric Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 border border-amber-900/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Coins className="w-3.5 h-3.5" />
                CPAlead Offers
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <Sparkles className="w-3 h-3" />
                Conversion Rule: $1.00 = 1,000 Coins
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                SubID: #{effectiveUserId.substring(0, 8)}...
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              CPAlead Offers / Earn Coins
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Explore high-paying mobile app downloads, quick sign-ups, and interactive offers from CPAlead. Every dollar in completed offer payouts is automatically converted to <strong className="text-amber-400">1,000 Coins</strong> and credited directly to your platform ledger balance.
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Instant Postback Attribution
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Verified Ledger Sync
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 min-w-[240px]">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-900/40">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Total Coins Earned</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-400 font-['Space_Grotesk']">
                {totalEarnedCoins.toLocaleString()} <span className="text-xs text-amber-300/70 font-normal">Coins</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                ≈ ${totalEarnedUsd.toFixed(2)} USD value
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Completed Leads</span>
                <Gift className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-white font-['Space_Grotesk']">
                {cpaleadTransactions.length}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Postback transactions logged
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Available Balance</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xl font-bold text-cyan-400 font-['Space_Grotesk']">
                ${userBalance.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                ≈ {userCoinsBalance.toLocaleString()} Coins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Offerwall Container & Controls */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                  CPAlead Live Offerwall
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                  FASTRESRVR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Wall ID: <span className="font-mono text-slate-300">yOYtWCo5</span> • SubID: <span className="font-mono text-amber-300">{effectiveUserId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySubId}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Copy your dynamic SubID"
            >
              {copiedSubId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSubId ? 'Copied SubID' : 'Copy SubID'}</span>
            </button>

            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Reload Offerwall"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Refresh</span>
            </button>

            <a
              href={offerwallUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Embedded Iframe Area */}
        <div className="relative w-full bg-slate-950 min-h-[750px]">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-6">
              <div className="space-y-4 text-center max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-bounce">
                  <Coins className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    Loading CPAlead Offerwall...
                  </p>
                  <p className="text-xs text-slate-400">
                    Connecting with SubID: #{effectiveUserId} for automatic coin credits.
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="w-full h-full bg-amber-500 rounded-full animate-pulse" />
                </div>
                <div className="pt-2">
                  <a
                    href={offerwallUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    Taking too long? Open in new tab <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* CPAlead Official Offerwall Embedded Iframe */}
          <iframe
            key={`cpalead-frame-${iframeKey}`}
            id="cpalead-offerwall-iframe"
            sandbox="allow-popups allow-same-origin allow-scripts allow-forms allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            src={offerwallUrl}
            style={{ width: '100%', height: '750px', border: 'none' }}
            frameBorder="0"
            title="CPAlead Offerwall"
            onLoad={() => setIframeLoading(false)}
          />
        </div>
      </div>

      {/* How It Works & Conversion Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="text-sm font-bold text-white">Pick an Offer</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select any active campaign on the CPAlead offerwall (apps, surveys, trials, game milestones).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="text-sm font-bold text-white">Complete the Requirements</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Follow the simple on-screen instructions (e.g. install & run an app or finish survey answers).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="text-sm font-bold text-white">Earn Coins Instantly</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            CPAlead postback notifies our server. $1.00 payout = 1,000 Coins credited to your ledger balance.
          </p>
        </div>
      </div>

      {/* CPAlead Rewards Ledger */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              CPAlead Reward Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified automated postback credits for completed CPAlead offers.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 w-fit">
            {cpaleadTransactions.length} Total Rewards
          </span>
        </div>

        {cpaleadTransactions.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-950/60 border border-slate-850 text-center space-y-2">
            <Coins className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">
              No CPAlead offers completed yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select any campaign from the live CPAlead offerwall above. Once completed, your earned coins and dollar payout will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cpaleadTransactions.map((tx) => {
              const coinsEarned = Math.round(tx.amount * 1000);
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-850 hover:border-slate-750 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {tx.description || 'CPAlead Offer Completion'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800/60">
                        {coinsEarned.toLocaleString()} Coins
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Ref: #{tx.referenceId || tx.id}</span>
                      <span>•</span>
                      <span>{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm sm:text-base font-bold text-emerald-400 font-['Space_Grotesk']">
                      +${tx.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Balance: ${tx.balanceAfter?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CpaleadOfferwallSection;
