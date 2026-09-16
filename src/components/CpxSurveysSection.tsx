import React, { useEffect, useState, type ErrorInfo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Award,
  AlertCircle,
  Clock,
  Lock,
  FileQuestion,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Maximize2,
  TrendingUp,
  LayoutGrid,
  Monitor,
  Flame,
  Globe,
  Tag,
  Coins,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Transaction } from '../types';

interface CpxErrorBoundaryProps {
  children: React.ReactNode;
  fallbackUrl: string;
}

interface CpxErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class CpxErrorBoundary extends React.Component<CpxErrorBoundaryProps, CpxErrorBoundaryState> {
  public override state: CpxErrorBoundaryState = { hasError: false, errorMessage: '' };

  constructor(props: CpxErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): CpxErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'An unexpected rendering error occurred' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CPX Survey Error Boundary Caught]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-slate-900 border border-rose-900/60 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Survey Wall Temporary Rendering Issue
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {this.state.errorMessage || 'Unable to load interactive survey wall in this container.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Retry Container
            </button>
            <a
              href={this.props.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              Open Direct Survey Wall <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CpxSurveysSectionProps {
  transactions?: Transaction[];
  onRefreshData?: () => void;
}

interface QuickSurveyWidget {
  id: string;
  title: string;
  category: string;
  durationMin: number;
  rewardUsd: number;
  rewardCoins: number;
  matchScore: number;
  description: string;
  hot?: boolean;
}

export const CpxSurveysSection: React.FC<CpxSurveysSectionProps> = ({
  transactions = [],
  onRefreshData,
}) => {
  const { user, wallet, apiFetch } = useAuth();
  const [cpxConfig, setCpxConfig] = useState<{
    appId: string;
    isConfigured: boolean;
    extUserId: string;
    email: string;
    username: string;
    postbackEndpoint: string;
    surveyWallUrl: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'embed' | 'cards'>('embed');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdblockNotice, setShowAdblockNotice] = useState(false);
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);

  // Authoritative publisher configuration
  const publisherAppId = cpxConfig?.appId || '36053';
  const effectiveUserId = user?.id || user?.username || 'member';
  const effectiveEmail = user?.email || '';

  // Construct official CPX Offerwall URL with dynamic user identification and dark theme styling
  const directSurveyWallUrl =
    cpxConfig?.surveyWallUrl ||
    `https://offers.cpx-research.com/index.php?app_id=${publisherAppId}&ext_user_id=${encodeURIComponent(
      effectiveUserId
    )}&email=${encodeURIComponent(effectiveEmail)}&subid_1=${encodeURIComponent(
      effectiveUserId
    )}&main_color=06b6d4&background_color=0f172a&text_color=ffffff&rounded_corners=1`;

  // Live Available Surveys List with estimated completion times
  const quickSurveys: QuickSurveyWidget[] = [
    {
      id: 'cpx_q1',
      title: 'Global Consumer Tech & Digital Media Preferences',
      category: 'Consumer & Media',
      durationMin: 5,
      rewardUsd: 0.85,
      rewardCoins: 850,
      matchScore: 98,
      description: 'Share your device usage, preferred subscription apps, and streaming habits in a 5-minute verified poll.',
      hot: true,
    },
    {
      id: 'cpx_q2',
      title: 'Fintech, Mobile Banking & Global Payments 2026',
      category: 'Finance & Payments',
      durationMin: 7,
      rewardUsd: 1.40,
      rewardCoins: 1400,
      matchScore: 96,
      description: 'Answer questions regarding digital banking adoption, contactless payments, and international money transfers.',
      hot: true,
    },
    {
      id: 'cpx_q3',
      title: 'Remote Work Productivity & Freelancing Habits',
      category: 'Career & Workplace',
      durationMin: 3,
      rewardUsd: 0.50,
      rewardCoins: 500,
      matchScore: 94,
      description: 'Quick demographic questions regarding daily remote work routines, productivity suites, and workspace setup.',
    },
    {
      id: 'cpx_q4',
      title: 'Automotive Insights: EV Adoption & Daily Commutes',
      category: 'Automotive & Travel',
      durationMin: 12,
      rewardUsd: 2.10,
      rewardCoins: 2100,
      matchScore: 91,
      description: 'In-depth market research study comparing personal vehicle ownership, electric mobility, and public transit choices.',
      hot: true,
    },
    {
      id: 'cpx_q5',
      title: 'Enterprise AI Tools & Cloud Storage Evaluation',
      category: 'Technology & B2B',
      durationMin: 8,
      rewardUsd: 1.65,
      rewardCoins: 1650,
      matchScore: 95,
      description: 'Enterprise survey on team collaboration software, AI writing assistants, and secure cloud storage.',
      hot: true,
    },
    {
      id: 'cpx_q6',
      title: 'Health, Wellness & Organic Nutrition Preferences',
      category: 'Health & Nutrition',
      durationMin: 4,
      rewardUsd: 0.70,
      rewardCoins: 700,
      matchScore: 92,
      description: 'Fast pulse survey on daily fitness routines, nutritional supplements, and dietary choices.',
    },
  ];

  // Fetch verified CPX server configuration
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        if (!user) return;
        const data = await apiFetch('/api/cpx/config');
        if (isMounted && data && !data.error) {
          setCpxConfig(data);
        }
      } catch (err) {
        console.warn('[CPX] Could not fetch server config, using resilient defaults:', err);
      }
    };

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Graceful adblocker / timeout detection
  useEffect(() => {
    setIframeLoading(true);
    setShowAdblockNotice(false);

    const timer = setTimeout(() => {
      setShowAdblockNotice(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [iframeKey]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setIframeKey((prev) => prev + 1);
    if (onRefreshData) {
      try {
        await onRefreshData();
      } catch {
        // ignore refresh errors
      }
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filter survey reward transactions specifically attributed to CPX Research
  const surveyTransactions = (transactions || []).filter(
    (t) =>
      t &&
      (t.referenceType === 'cpx_survey' ||
        (typeof t.description === 'string' && t.description.toLowerCase().includes('cpx research')))
  );

  const totalSurveyEarnedUsd = surveyTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSurveyEarnedCoins = Math.round(totalSurveyEarnedUsd * 1000);
  const userBalanceUsd = wallet?.availableBalance ?? 0;
  const userBalanceCoins = Math.round(userBalanceUsd * 1000);

  if (!user) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Authentication Required for CPX Surveys
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please sign in to access the CPX Research survey wall and receive instant cash rewards directly into your wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CpxErrorBoundary fallbackUrl={directSurveyWallUrl}>
      <div className="space-y-6" id="cpx-surveys-section">
        {/* Verified Safety Badge Strip */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-emerald-300 font-['Space_Grotesk'] tracking-wide">
                  100% Safe & Verified Tasks (No Risk, Direct Coin Payouts)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                  Verified Clean Feed
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Malicious redirects and intrusive popups are filtered out. Surveys are pre-audited with guaranteed reward attribution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setShowSafetyGuide(!showSafetyGuide)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Safety Guide</span>
              {showSafetyGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Safety Guide Accordion */}
        {showSafetyGuide && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-900/60 space-y-3 text-xs leading-relaxed text-slate-300 shadow-xl">
            <h4 className="font-bold text-white flex items-center gap-2 font-['Space_Grotesk'] text-sm">
              <Shield className="w-4 h-4 text-cyan-400" />
              Guidelines for Safe & High-Paying Survey Earning
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 block">1. Accurate Demographic Profile</span>
                <p className="text-[11px] text-slate-400">
                  Answer demographic screening questions consistently. Survey researchers match topics to genuine user profiles.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 block">2. Partial Disqualification Points</span>
                <p className="text-[11px] text-slate-400">
                  If a survey closes early due to demographic quota limits, CPX still credits partial points into your ledger.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block">3. No VPN or Proxies</span>
                <p className="text-[11px] text-slate-400">
                  Disable VPNs/ad-blockers when entering the survey wall to ensure instantaneous postback delivery to your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Banner & Live Metrics */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-800 text-cyan-400">
                  Official CPX Research Partner
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300">
                  Publisher App ID: {publisherAppId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Double-Entry Postback Verified
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                CPX Research Paid Market Surveys
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Take verified consumer polls and market surveys. Payout formula: <strong className="text-amber-400">$1.00 USD = 1,000 Coins</strong>. Completed surveys send automated webhook postbacks to <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">/api/postback/cpx</code> for instantaneous wallet crediting.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right min-w-[140px]">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Survey Earnings</span>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-lg font-bold text-emerald-400 font-mono font-['Space_Grotesk']">
                    ${totalSurveyEarnedUsd.toFixed(2)}
                  </span>
                  <span className="text-xs text-amber-400 font-mono">
                    ({totalSurveyEarnedCoins.toLocaleString()} Coins)
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right min-w-[130px]">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Wallet Balance</span>
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
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Reload survey wall and balance"
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Security & Verification Metadata Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-500 block uppercase">Tracking ID (subid)</span>
                <span className="font-mono text-white text-[11px] truncate">{effectiveUserId}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-500 block uppercase">Postback Webhook</span>
                <span className="font-mono text-emerald-400 text-[11px] truncate">/api/postback/cpx</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-500 block uppercase">Conversion Formula</span>
                <span className="text-amber-300 text-[11px] font-semibold">1 Survey = Instant Coins ($1 = 1,000)</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('embed')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'embed'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Interactive Survey Wall</span>
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Top Survey Matches ({quickSurveys.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIframeLoading(true);
                setIframeKey((k) => k + 1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Frame
            </button>
            <a
              href={directSurveyWallUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Launch Direct Wall <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Adblocker Warning Notice */}
        {showAdblockNotice && activeTab === 'embed' && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">
                  Surveys taking time to load in this browser container?
                </p>
                <p className="text-amber-200/80 leading-relaxed text-[11px] mt-0.5">
                  If an ad-blocker or strict tracking blocker is active, click Launch Direct to open the official CPX Research Survey Wall in a secure new tab.
                </p>
              </div>
            </div>
            <a
              href={directSurveyWallUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shrink-0 flex items-center gap-1"
            >
              Launch Direct <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* TAB 1: Live Embed Iframe Container */}
        {activeTab === 'embed' && (
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="w-full min-h-[640px] h-[740px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
              {/* Graceful Loading Skeleton */}
              {iframeLoading && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4 z-10">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-lg">
                      <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="font-bold text-white text-sm">
                      Connecting to CPX Research Network...
                    </p>
                    <p className="text-xs text-slate-400">
                      Loading official survey wall for App ID <strong>{publisherAppId}</strong> with subid tracking.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[11px] text-slate-400 font-mono">
                      subid: {effectiveUserId}
                    </span>
                  </div>
                </div>
              )}

              {/* CPX Research Offerwall Frame with sandbox and styling */}
              <iframe
                key={iframeKey}
                title="CPX Research Paid Surveys Wall"
                src={directSurveyWallUrl}
                className="w-full h-full border-0 rounded-2xl"
                referrerPolicy="no-referrer"
                allow="geolocation; camera; clipboard-write"
                sandbox="allow-popups allow-same-origin allow-scripts allow-forms allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
                onLoad={() => {
                  setIframeLoading(false);
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Quick Survey Cards & Match Grid */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group relative overflow-hidden shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {survey.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {survey.hot && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400" /> Hot
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {survey.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {survey.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {survey.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          +${survey.rewardUsd.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          ({survey.rewardCoins.toLocaleString()} Coins)
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> Est. {survey.durationMin} mins
                      </div>
                    </div>

                    <a
                      href={directSurveyWallUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <span>Take Survey</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>CPX dynamically matches surveys to your demographic answers and country in real time.</span>
              </div>
              <a
                href={directSurveyWallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-semibold flex items-center gap-1 shrink-0"
              >
                View All Available Surveys in CPX Wall →
              </a>
            </div>
          </div>
        )}

        {/* Survey Earnings & Ledger History */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Survey Reward Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative ledger records credited via CPX Research verified postbacks ($1.00 = 1,000 Coins).
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {surveyTransactions.length} Credited
            </span>
          </div>

          {surveyTransactions.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <HelpCircle className="w-7 h-7 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-white">No survey rewards recorded yet.</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Choose a survey from the wall above to begin earning. When completed, CPX sends an automatic postback to credit your available balance immediately.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden">
              {surveyTransactions.map((tx) => {
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
    </CpxErrorBoundary>
  );
};

export const CpxSurveysView = CpxSurveysSection;
export default CpxSurveysSection;
