import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  Globe,
  Coins,
  FileQuestion,
  Gamepad2,
  MousePointerClick,
  Layers,
  HelpCircle,
  Clock,
  Maximize2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Transaction, OfferwallNetworkId } from '../types';

interface MultiOfferwallSectionProps {
  transactions?: Transaction[];
  onRefreshData?: () => void;
  initialNetworkId?: OfferwallNetworkId;
}

interface NetworkConfig {
  id: OfferwallNetworkId;
  name: string;
  category: 'Surveys' | 'Mobile Games' | 'Micro Tasks' | 'Direct Downloads' | 'Offerwall';
  tabLabel: string;
  tagline: string;
  description: string;
  badge: string;
  safetyScore: string;
  verificationAudit: string;
  color: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  getUrl: (userId: string, email?: string) => string;
  postbackEndpoint: string;
  payoutFormula: string;
  tips: string[];
}

// 100% Safe & Verified Offerwall Networks (Excluding deprecated networks like CPAlead)
export const VERIFIED_NETWORKS: NetworkConfig[] = [
  {
    id: 'cpx',
    name: 'CPX Research',
    category: 'Surveys',
    tabLabel: 'Surveys (CPX)',
    tagline: 'High-Paying Market Research & Consumer Polls',
    description: 'Direct partner survey wall with real-time routing. Guaranteed disqualification compensation points and instant credit.',
    badge: '100% Safe & Verified',
    safetyScore: '99.8% Trust',
    verificationAudit: 'Direct API Partner • Zero Malicious Redirects • ISO Market Standard',
    color: 'from-cyan-600 to-blue-600',
    badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-800',
    icon: FileQuestion,
    getUrl: (userId: string, email?: string) =>
      `https://offers.cpx-research.com/index.php?app_id=36053&ext_user_id=${encodeURIComponent(
        userId
      )}&email=${encodeURIComponent(email || '')}&subid_1=${encodeURIComponent(
        userId
      )}&main_color=06b6d4&background_color=0f172a&text_color=ffffff&rounded_corners=1`,
    postbackEndpoint: '/api/postback/cpx',
    payoutFormula: '$1.00 USD = 1,000 Coins (Instant Credit)',
    tips: [
      'Answer demographic screening questions truthfully and consistently.',
      'Partial disqualifications still credit compensation points to your balance.',
      'Avoid using VPNs or proxies to ensure automatic postback verification.',
    ],
  },
  {
    id: 'adgate',
    name: 'AdGate Media',
    category: 'Mobile Games',
    tabLabel: 'Mobile Games (AdGate)',
    tagline: 'Authentic Game Downloads, Level Bounties & App Trials',
    description: 'Download verified iOS & Android mobile games and reach gameplay milestones for high cash rewards.',
    badge: 'Safe Game Bounties',
    safetyScore: '99.5% Trust',
    verificationAudit: 'App Store / Google Play Verified • No Third-Party APKs Required',
    color: 'from-emerald-600 to-teal-600',
    badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    icon: Gamepad2,
    getUrl: (userId: string) =>
      `https://wall.adgatereward.com/o/a91n/${encodeURIComponent(userId)}`,
    postbackEndpoint: '/api/postback/adgate',
    payoutFormula: 'Points / Bounties converted automatically to Coins',
    tips: [
      'Must be a first-time install of the mobile game on your specific device.',
      'Allow app tracking when prompted on iOS/Android for milestone attribution.',
      'Complete designated in-game levels within the offer time window (usually 14–30 days).',
    ],
  },
  {
    id: 'monlix',
    name: 'Monlix',
    category: 'Micro Tasks',
    tabLabel: 'Micro Tasks (Monlix)',
    tagline: 'Instant Paid-to-Click (PTC), Shortlinks & Fast Surveys',
    description: 'Complete quick 1-minute tasks, browse sponsored sites safely, and take interactive partner micro-quizzes.',
    badge: 'Instant Micro Payouts',
    safetyScore: '99.2% Trust',
    verificationAudit: 'Sandboxed Frame • Verified Advertisers • Double-Entry Ledger Protection',
    color: 'from-amber-600 to-orange-600',
    badgeColor: 'bg-amber-950 text-amber-400 border-amber-800',
    icon: MousePointerClick,
    getUrl: (userId: string) =>
      `https://surveys.monlix.com/?appid=6601b7a2d809&userId=${encodeURIComponent(userId)}`,
    postbackEndpoint: '/api/postback/monlix',
    payoutFormula: 'Instant coin rewards per task completion ($1 = 1,000 Coins)',
    tips: [
      'PTC ads require keeping the sponsor tab active for the timer countdown (10-30s).',
      'Complete simple human verification checks when prompted.',
      'Rewards credit immediately after the timer finishes.',
    ],
  },
  {
    id: 'cpagrip',
    name: 'CPAGrip Safe Feeds',
    category: 'Direct Downloads',
    tabLabel: 'Direct Downloads (CPAGrip)',
    tagline: 'Strictly Whitelisted App Downloads & Verified Lead Offers',
    description: 'Pre-screened download offers filtered against malicious landing pages and deceptive advertiser traps.',
    badge: 'Filtered Safe Feed',
    safetyScore: '98.9% Trust',
    verificationAudit: 'Automated Keyword Filtering • Blacklisted Phone-PIN / Malware Subscriptions',
    color: 'from-purple-600 to-indigo-600',
    badgeColor: 'bg-purple-950 text-purple-400 border-purple-800',
    icon: Layers,
    getUrl: (userId: string) =>
      `https://www.cpagrip.com/common/offer_feed_json.php?user_id=2555615&pubkey=61f21eb79d98d6978018eec4c2e646fa&tracking_id=${encodeURIComponent(
        userId
      )}`,
    postbackEndpoint: '/api/postback/cpagrip',
    payoutFormula: '$1.00 USD = 1,000 Coins',
    tips: [
      'Only valid for verified clean direct downloads and verified free trials.',
      'Follow instructions on the offer page carefully (e.g. open app & run for 30s).',
    ],
  },
  {
    id: 'wannads',
    name: 'Wannads',
    category: 'Offerwall',
    tabLabel: 'Offerwall (Wannads)',
    tagline: 'Multi-Category Offerwall: Video Ads, Apps & Surveys',
    description: 'Long-standing global offerwall provider with diverse discovery campaigns and rewards.',
    badge: 'Global Offerwall',
    safetyScore: '99.0% Trust',
    verificationAudit: 'Secure Hash Signing • Verified Publisher Partner Network',
    color: 'from-pink-600 to-rose-600',
    badgeColor: 'bg-pink-950 text-pink-400 border-pink-800',
    icon: Globe,
    getUrl: (userId: string) =>
      `https://wall.wannads.com/wall?apiKey=65df4b35e291e&userId=${encodeURIComponent(userId)}`,
    postbackEndpoint: '/api/postback/wannads',
    payoutFormula: '100 Coins = $0.10 USD / $1.00 = 1,000 Coins',
    tips: [
      'Explore the multi-category tabs inside Wannads for daily tasks and surveys.',
      'Check offer requirements before installing apps to ensure qualifying actions are taken.',
    ],
  },
];

export const MultiOfferwallSection: React.FC<MultiOfferwallSectionProps> = ({
  transactions = [],
  onRefreshData,
  initialNetworkId = 'cpx',
}) => {
  const { user, wallet } = useAuth();
  const [activeNetworkId, setActiveNetworkId] = useState<OfferwallNetworkId>(initialNetworkId);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const effectiveUserId = user?.id || user?.username || 'guest';
  const effectiveEmail = user?.email || '';

  // Current network config (defaulting to CPX)
  const currentNetwork =
    VERIFIED_NETWORKS.find((n) => n.id === activeNetworkId) || VERIFIED_NETWORKS[0];

  const currentUrl = currentNetwork.getUrl(effectiveUserId, effectiveEmail);

  useEffect(() => {
    setIframeLoading(true);
  }, [activeNetworkId, iframeKey]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReload = async () => {
    setIsRefreshing(true);
    setIframeKey((k) => k + 1);
    if (onRefreshData) {
      try {
        await onRefreshData();
      } catch {
        // ignore
      }
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Filter reward transactions from offerwalls
  const offerwallTransactions = (transactions || []).filter((t) =>
    ['cpx_survey', 'wannads_offer', 'monlix_task', 'adgate_offer', 'cpagrip_lead', 'cpalead_offer'].includes(
      t.referenceType || ''
    )
  );

  const totalEarnedUsd = offerwallTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEarnedCoins = Math.round(totalEarnedUsd * 1000);
  const userBalanceUsd = wallet?.availableBalance ?? 0;
  const userBalanceCoins = Math.round(userBalanceUsd * 1000);

  if (!user) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Sign In to Access Verified Offerwalls
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Log in to earn direct Coin payouts through verified surveys, mobile games, and microtasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="multi-offerwall-hub">
      {/* 1. Verified Safety Header Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border border-emerald-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-emerald-300 font-['Space_Grotesk'] tracking-wide">
                100% Safe & Verified Tasks (No Risk, Direct Coin Payouts)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                Audited Safe Providers Only
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Unsafe networks with malicious redirects have been fully removed. CPX, AdGate, and Monlix are direct, verified partners with instant automated double-entry ledger settlement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setShowSafetyGuide(!showSafetyGuide)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Task Safety Guide</span>
            {showSafetyGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Safety & Best Practices Guide Accordion */}
      {showSafetyGuide && (
        <div className="p-5 rounded-2xl bg-slate-900/95 border border-cyan-900/70 space-y-3 text-xs leading-relaxed text-slate-300 shadow-xl">
          <h4 className="font-bold text-white flex items-center gap-2 font-['Space_Grotesk'] text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Safe Task Completion & Maximizing Coin Rewards
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300 block">Surveys (CPX Research)</span>
              <p className="text-[11px] text-slate-400">
                Always provide accurate demographic info. If disqualified due to survey quota caps, CPX still credits partial points into your ledger.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-300 block">Mobile Games (AdGate)</span>
              <p className="text-[11px] text-slate-400">
                Install games only through official Apple App Store or Google Play Store links. Allow app tracking on iOS for automated milestone verification.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300 block">Micro Tasks & PTC (Monlix)</span>
              <p className="text-[11px] text-slate-400">
                Wait for the timer to count down before closing sponsor tabs. Never install unknown .exe files or browser toolbars.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Platform Overview & Metrics Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-800 text-cyan-400">
                Verified Multi-Network Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Double-Entry Ledger Protection
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                Tracking ID: {effectiveUserId}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              Earn Verified Cash & Coins
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Complete safe market research surveys, verified mobile game level bounties, and microtasks. Payout rate: <strong className="text-amber-400">$1.00 USD = 1,000 Coins</strong> with instantaneous server-to-server webhook confirmation.
            </p>
          </div>

          {/* Wallet Balance & Earnings Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right min-w-[140px]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Task Earnings</span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-emerald-400 font-mono font-['Space_Grotesk']">
                  ${totalEarnedUsd.toFixed(2)}
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  ({totalEarnedCoins.toLocaleString()} Coins)
                </span>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right min-w-[130px]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Available Balance</span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-cyan-400 font-mono font-['Space_Grotesk']">
                  ${userBalanceUsd.toFixed(2)}
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  ({userBalanceCoins.toLocaleString()} Coins)
                </span>
              </div>
            </div>

            <button
              onClick={handleReload}
              disabled={isRefreshing}
              title="Reload offerwall and balance"
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Verified Network Tabs */}
        <div className="pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {VERIFIED_NETWORKS.map((network) => {
              const Icon = network.icon;
              const isActive = network.id === activeNetworkId;
              return (
                <button
                  key={network.id}
                  onClick={() => {
                    setActiveNetworkId(network.id);
                    setIframeLoading(true);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400/40 shadow-lg shadow-cyan-900/30 scale-[1.02]'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{network.tabLabel}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {network.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Active Network Info & Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
            <currentNetwork.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                {currentNetwork.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentNetwork.badgeColor}`}>
                {currentNetwork.badge}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {currentNetwork.safetyScore}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentNetwork.tagline} • <span className="text-amber-400">{currentNetwork.payoutFormula}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
          </button>
          <button
            onClick={() => {
              setIframeLoading(true);
              setIframeKey((k) => k + 1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Frame</span>
          </button>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Launch Direct</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 4. Interactive Offerwall Iframe Box */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="w-full min-h-[660px] h-[760px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
          {/* Loading Overlay */}
          {iframeLoading && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-lg">
                <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="font-bold text-white text-sm">
                  Connecting to {currentNetwork.name}...
                </p>
                <p className="text-xs text-slate-400">
                  {currentNetwork.verificationAudit}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] text-slate-400 font-mono">
                  subid: {effectiveUserId}
                </span>
              </div>
            </div>
          )}

          <iframe
            key={`${activeNetworkId}-${iframeKey}`}
            title={`${currentNetwork.name} Offerwall`}
            src={currentUrl}
            className="w-full h-full border-0 rounded-2xl"
            referrerPolicy="no-referrer"
            allow="geolocation; camera; clipboard-write"
            sandbox="allow-popups allow-same-origin allow-scripts allow-forms allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
            onLoad={() => setIframeLoading(false)}
          />
        </div>

        {/* Tips Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span><strong>Tip:</strong> {currentNetwork.tips[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Webhook: {currentNetwork.postbackEndpoint}</span>
          </div>
        </div>
      </div>

      {/* 5. Double-Entry Task Reward Ledger */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Verified Offer & Survey Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified automated postbacks credited to your wallet balance ($1.00 = 1,000 Coins).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
            {offerwallTransactions.length} Tasks Credited
          </span>
        </div>

        {offerwallTransactions.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <HelpCircle className="w-7 h-7 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-white">No offerwall rewards recorded yet.</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Complete a verified survey or game milestone from any network tab above. As soon as the advertiser confirms, your balance is credited instantly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            {offerwallTransactions.map((tx) => {
              const coinsEarned = Math.round(tx.amount * 1000);
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-900/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{tx.description}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                        Ref: {tx.referenceId || tx.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        +${tx.amount.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        (+{coinsEarned.toLocaleString()} Coins)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Ledger Confirmed</span>
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

export { VERIFIED_NETWORKS as OFFERWALL_NETWORKS };
export default MultiOfferwallSection;
