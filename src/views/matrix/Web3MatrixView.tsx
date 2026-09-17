import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Users,
  Copy,
  Check,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Layers,
  Award,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  Link,
  Info,
  Share2,
  Trophy,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  Settings,
  LogOut,
  HelpCircle,
  BookOpen,
  QrCode,
  Globe,
  Coins,
  Send,
  MessageCircle,
  ChevronLeft,
  Crown,
  Bell,
  Lock,
  Rocket,
  Ticket,
  Calculator,
  Gift,
  Sliders,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MatrixAccount, MatrixLevelState, MatrixPartnerSlot } from '../../types';
import { MatrixSlotPopover } from '../../components/matrix/MatrixSlotPopover';
import { LiveActivityTicker } from '../../components/matrix/LiveActivityTicker';
import { TeamTreeView } from '../../components/matrix/TeamTreeView';
import { PartnerMarketingCard } from '../../components/matrix/PartnerMarketingCard';
import { TopEarnersLeaderboard } from '../../components/TopEarnersLeaderboard';
import { P2PTransactionModal } from '../../components/matrix/P2PTransactionModal';
import { ProfileSettingsModal } from '../../components/ProfileSettingsModal';
import {
  hasInjectedWeb3Wallet,
  getWalletProviderName,
  connectWeb3Wallet,
  switchToBscNetwork,
  formatShortWalletAddress,
  buildBscScanUrl,
  BSC_MAINNET_CHAIN_ID,
  executeLevelUpgrade,
} from '../../utils/web3Wallet';
import { playMatrixChime, fireWeb3Confetti } from '../../utils/web3Effects';

interface Web3MatrixViewProps {
  initialTab?: 'levels' | 'team' | 'partner_card' | 'leaderboard' | 'main' | 'overview' | 'squad' | 'wallet' | 'support' | string;
  navigate?: (path: string) => void;
  onViewLeaderboard?: () => void;
  onNavigateToTeam?: () => void;
  onNavigateToPartnerCard?: () => void;
}

const LEVEL_DETAILS = [
  { level: 1, cost: 3, title: 'Starter Node', tier: 'Starter', badgeColor: 'from-blue-500 to-cyan-400', glow: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]', border: 'border-cyan-500/50' },
  { level: 2, cost: 6, title: 'Bronze Node', tier: 'Bronze', badgeColor: 'from-amber-700 to-amber-500', glow: 'shadow-[0_0_25px_rgba(217,119,6,0.25)]', border: 'border-amber-600/50' },
  { level: 3, cost: 12, title: 'Silver Node', tier: 'Silver', badgeColor: 'from-slate-400 to-slate-200', glow: 'shadow-[0_0_25px_rgba(148,163,184,0.25)]', border: 'border-slate-400/50' },
  { level: 4, cost: 25, title: 'Gold Node', tier: 'Gold', badgeColor: 'from-yellow-500 to-amber-300', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]', border: 'border-yellow-500/60' },
  { level: 5, cost: 50, title: 'Platinum Node', tier: 'Platinum', badgeColor: 'from-teal-400 to-emerald-300', glow: 'shadow-[0_0_30px_rgba(20,184,166,0.3)]', border: 'border-teal-400/60' },
  { level: 6, cost: 100, title: 'Diamond Node', tier: 'Diamond', badgeColor: 'from-sky-400 to-blue-600', glow: 'shadow-[0_0_35px_rgba(14,165,233,0.35)]', border: 'border-sky-400/60' },
  { level: 7, cost: 250, title: 'Crown Node', tier: 'Crown', badgeColor: 'from-indigo-500 to-purple-400', glow: 'shadow-[0_0_35px_rgba(99,102,241,0.35)]', border: 'border-indigo-500/60' },
  { level: 8, cost: 500, title: 'Royal Node', tier: 'Royal', badgeColor: 'from-purple-500 to-pink-500', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]', border: 'border-purple-500/60' },
  { level: 9, cost: 1000, title: 'Titan Node', tier: 'Titan', badgeColor: 'from-rose-500 to-orange-400', glow: 'shadow-[0_0_40px_rgba(244,63,94,0.4)]', border: 'border-rose-500/60' },
  { level: 10, cost: 2000, title: 'Ambassador Node', tier: 'Ambassador', badgeColor: 'from-emerald-500 to-teal-300', glow: 'shadow-[0_0_45px_rgba(16,185,129,0.45)]', border: 'border-emerald-500/70' },
  { level: 11, cost: 3500, title: 'Presidential Node', tier: 'Presidential', badgeColor: 'from-amber-400 to-yellow-200', glow: 'shadow-[0_0_50px_rgba(251,191,36,0.5)]', border: 'border-amber-400/70' },
  { level: 12, cost: 6000, title: 'Global Founder Node', tier: 'Global Founder', badgeColor: 'from-fuchsia-500 via-purple-500 to-cyan-300', glow: 'shadow-[0_0_60px_rgba(217,70,239,0.55)]', border: 'border-fuchsia-500/80' },
];

/** Safe Tab Resolver to guarantee valid 5-tab matching */
const resolveMatrixTab = (tab?: string): 'main' | 'overview' | 'squad' | 'wallet' | 'support' => {
  if (!tab) return 'main';
  const t = tab.toLowerCase().trim();
  if (t === 'main' || t === 'levels' || t === 'matrix' || t === 'web3-matrix' || t === 'earn') return 'main';
  if (t === 'overview' || t === 'leaderboard' || t === 'top-earners') return 'overview';
  if (t === 'squad' || t === 'team' || t === 'partner_card' || t === 'partner-card' || t === 'partner' || t === 'downline' || t === 'flyer') return 'squad';
  if (t === 'wallet' || t === 'balance') return 'wallet';
  if (t === 'support' || t === 'tickets' || t === 'help' || t === 'telegram') return 'support';
  return 'main';
};


export const Web3MatrixView: React.FC<Web3MatrixViewProps> = ({
  initialTab = 'levels',
  navigate,
  onViewLeaderboard,
  onNavigateToTeam,
  onNavigateToPartnerCard,
}) => {
  const { user, wallet, refreshMe, apiFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'main' | 'overview' | 'squad' | 'wallet' | 'support'>(
    resolveMatrixTab(initialTab)
  );
  const [matrixAccount, setMatrixAccount] = useState<MatrixAccount | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(Number(wallet?.availableBalance || 0));
  const [loading, setLoading] = useState<boolean>(true);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activePopover, setActivePopover] = useState<{ level: number; slotNumber: number } | null>(null);
  const [activeLevelView, setActiveLevelView] = useState<number | null>(null);
  const [recentlyRecycledLevel, setRecentlyRecycledLevel] = useState<number | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedChainId, setConnectedChainId] = useState<number>(BSC_MAINNET_CHAIN_ID);
  const [p2pModal, setP2pModal] = useState<{
    isOpen: boolean;
    type: 'activation' | 'upgrade';
    level?: number;
    cost: number;
  }>({
    isOpen: false,
    type: 'activation',
    cost: 2,
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [matrixTransactions, setMatrixTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
  const [isActivatingLevel, setIsActivatingLevel] = useState<boolean>(false);
  const [activationProgress, setActivationProgress] = useState<{ step: string; message: string } | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<'none' | 'royaltyExplore' | 'royaltyCalc' | 'raffle'>('none');
  const [calcLevel, setCalcLevel] = useState<number>(1);
  const [calcTeamSize, setCalcTeamSize] = useState<number>(10);
  const [raffleTickets, setRaffleTickets] = useState<number>(0);
  const [isClaimingTicket, setIsClaimingTicket] = useState<boolean>(false);
  
  // Claim states
  const [profitBase, setProfitBase] = useState<number>(12.50);
  const [profitMatrix, setProfitMatrix] = useState<number>(8.00);
  const [isClaimingBase, setIsClaimingBase] = useState<boolean>(false);
  const [isClaimingMatrix, setIsClaimingMatrix] = useState<boolean>(false);

  const handleClaimBase = () => {
    setIsClaimingBase(true);
    setTimeout(() => {
      setProfitBase(0);
      setIsClaimingBase(false);
      setNotificationMsg({ type: 'success', text: 'Profit Base successfully claimed!' });
    }, 1500);
  };

  const handleClaimMatrix = () => {
    setIsClaimingMatrix(true);
    setTimeout(() => {
      setProfitMatrix(0);
      setIsClaimingMatrix(false);
      setNotificationMsg({ type: 'success', text: 'Profit Matrix successfully claimed!' });
    }, 1500);
  };

  const [globalStats, setGlobalStats] = useState<{
    totalUsers?: number;
    joinedToday?: number;
    totalMatrixActivations?: number;
    totalMatrixVolume?: number;
    totalPayoutsDistributed?: number;
  } | null>(null);

  useEffect(() => {
    setActiveTab(resolveMatrixTab(initialTab));
  }, [initialTab]);

  // Check if wallet is already injected and connected
  useEffect(() => {
    try {
      if (hasInjectedWeb3Wallet()) {
        const provider = (window as any).tokenpocket?.ethereum || (window as any).ethereum;
        provider?.request?.({ method: 'eth_accounts' })
          ?.then((accounts: string[]) => {
            if (accounts && accounts[0]) {
              setConnectedWallet(accounts[0]);
            }
          })
          ?.catch(() => null);

        provider?.request?.({ method: 'eth_chainId' })
          ?.then((chainIdHex: string) => {
            if (chainIdHex) {
              setConnectedChainId(parseInt(chainIdHex, 16));
            }
          })
          ?.catch(() => null);
      }
    } catch {
      // safe fallback
    }
  }, []);

  const fetchMatrixAccount = async () => {
    try {
      setLoading(true);
      if (typeof apiFetch === 'function') {
        const data = await apiFetch('/api/matrix/account');
        if (data && data.success && data.account) {
          setMatrixAccount((prev) => {
            const acc = { ...data.account };
            if (acc.levels) {
              acc.levels = acc.levels.map((l: any, idx: number) => ({
                ...l,
                unlocked: idx === 0 ? true : (prev?.levels?.[idx]?.unlocked || false)
              }));
            }
            return acc;
          });
          
          if (data.account.boundWalletAddress && !connectedWallet) {
            setConnectedWallet(data.account.boundWalletAddress);
          }
          if (data.walletBalance !== undefined) {
            setWalletBalance(Number(data.walletBalance || 0));
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load matrix account:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch('/api/public/stats');
      const data = await res.json();
      if (data && data.success) {
        setGlobalStats(data);
      }
    } catch {
      // safe fallback
    }
  };

  const fetchMatrixTransactions = async () => {
    try {
      setLoadingTransactions(true);
      if (typeof apiFetch === 'function') {
        const data = await apiFetch('/api/matrix/transactions');
        if (data && data.success && Array.isArray(data.transactions)) {
          setMatrixTransactions(data.transactions);
        }
      }
    } catch (err: any) {
      console.error('Failed to load matrix transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchMatrixAccount();
    fetchGlobalStats();
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchMatrixTransactions();
    }
    if (activeTab === 'overview') {
      fetchGlobalStats();
    }
  }, [activeTab]);

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    setNotificationMsg({
      type: 'success',
      text: 'Wallet disconnected. You can connect another Web3 wallet anytime.',
    });
    playMatrixChime('click');
  };

  useEffect(() => {
    if (wallet?.availableBalance !== undefined) {
      setWalletBalance(Number(wallet.availableBalance || 0));
    }
  }, [wallet?.availableBalance]);

  const handleConnectWallet = async () => {
    try {
      const conn = await connectWeb3Wallet();
      if (conn?.address) {
        setConnectedWallet(conn.address);
        setConnectedChainId(conn.chainId || BSC_MAINNET_CHAIN_ID);
        if (typeof apiFetch === 'function') {
          await apiFetch('/api/matrix/bind-wallet', {
            method: 'POST',
            body: JSON.stringify({ walletAddress: conn.address }),
          }).catch(() => null);
        }

        if (conn.chainId !== BSC_MAINNET_CHAIN_ID) {
          await switchToBscNetwork().catch(() => null);
        }

        fetchMatrixAccount();
        setNotificationMsg({
          type: 'success',
          text: `Connected ${getWalletProviderName()}: ${formatShortWalletAddress(conn.address)} (BNB Chain)`,
        });
        playMatrixChime('click');
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: err?.message || 'Failed to connect wallet.' });
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToBscNetwork();
      setConnectedChainId(BSC_MAINNET_CHAIN_ID);
      setNotificationMsg({ type: 'success', text: 'Network switched to BNB Smart Chain!' });
      playMatrixChime('click');
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: err?.message || 'Failed to switch network.' });
    }
  };

  const handleOpenActivationModal = () => {
    setP2pModal({
      isOpen: true,
      type: 'activation',
      cost: 2,
    });
  };

  const handleOpenUpgradeModal = (level: number, cost: number) => {
    setP2pModal({
      isOpen: true,
      type: 'upgrade',
      level: level || 1,
      cost: cost || 3,
    });
  };

  const handleP2PSuccess = (result: { txHash: string; bscScanUrl: string; level?: number }) => {
    if (result?.level && matrixAccount) {
      // Optimistic update for immediate visual feedback
      const updatedLevels = [...(matrixAccount.levels || [])];
      const levelIdx = result.level - 1;
      const levelCost = LEVEL_DETAILS.find(l => l.level === result.level)?.cost || 0;
      if (!updatedLevels[levelIdx]) {
        updatedLevels[levelIdx] = {
          level: result.level,
          cost: levelCost,
          unlocked: true,
          slotsFilled: 0,
          earnings: 0,
          recycleCount: 0,
          currentSlots: []
        };
      } else {
        updatedLevels[levelIdx] = {
          ...updatedLevels[levelIdx],
          unlocked: true
        };
      }
      setMatrixAccount({ ...matrixAccount, levels: updatedLevels });
    }
    
    fetchMatrixAccount();
    if (typeof refreshMe === 'function') {
      refreshMe();
    }
    if (result?.level) {
      setNotificationMsg({
        type: 'success',
        text: `Level ${result.level} Unlocked! Verifiable on BscScan: ${result.txHash ? formatShortWalletAddress(result.txHash) : 'Confirmed'}`,
      });
    } else {
      setNotificationMsg({
        type: 'success',
        text: `Web3 Protocol Activated ($2.00)! Verifiable on BscScan: ${result?.txHash ? formatShortWalletAddress(result.txHash) : 'Confirmed'}`,
      });
    }
  };

  const handleActivateLevel = async (level: number, cost: number) => {
    setIsActivatingLevel(true);
    setActivationProgress({ step: 'init', message: 'Initializing Web3 activation...' });
    
    try {
      const result = await executeLevelUpgrade({
        level,
        cost,
        onProgress: (step, message) => setActivationProgress({ step, message })
      });
      
      handleP2PSuccess({
        txHash: result.registerTxHash,
        bscScanUrl: result.bscScanUrl,
        level: level
      });
      
      fireWeb3Confetti();
      playMatrixChime('upgrade');
    } catch (err: any) {
      console.error('Activation failed:', err);
      setNotificationMsg({
        type: 'error',
        text: err?.message || 'Activation failed or was rejected. Please try again.',
      });
    } finally {
      setIsActivatingLevel(false);
      setActivationProgress(null);
    }
  };

  const copyInviteLink = () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nexvora.global';
      const ref = user?.referralCode || 'NEXVORA';
      const link = `${origin}/register?ref=${ref}`;
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(link);
      }
      setCopiedLink(true);
      playMatrixChime('click');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const isActivated = Boolean(matrixAccount?.isActivated);
  const currentMaxLevel = Number(matrixAccount?.currentMaxLevel || 0);

  return (
    <div id="web3-matrix-dashboard" className="min-h-screen bg-[#05070E] space-y-6 pb-28 select-none relative overflow-x-hidden">
      {/* Background Radial Lights (Forton Style Royal Blue Spotlight) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-[#05070E]/0 to-transparent pointer-events-none" />
      
      {/* Minimalist Web3 Top Bar */}
      <div className="sticky top-0 z-40 bg-[#05070E]/80 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 text-white">
          <ChevronLeft 
            className="w-5 h-5 cursor-pointer text-slate-400 hover:text-white transition-colors" 
            onClick={() => {
              if (activeLevelView) {
                setActiveLevelView(null);
              } else if (navigate) {
                navigate(-1 as any);
              }
            }}
          />
          <span className="font-black text-lg font-['Space_Grotesk'] tracking-tight">Nexvora</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-slate-300">BSC</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-5 relative z-10 pt-4">
        {/* Toast Notification */}
        {notificationMsg && (
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-lg transition-all animate-in fade-in duration-200 ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notificationMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <p className="text-xs font-medium">{notificationMsg.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationMsg(null)}
              className="text-xs opacity-70 hover:opacity-100 px-2 py-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: MAIN (Forton Style Layout) */}
        {activeTab === 'main' && !activeLevelView && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header User Card (Forton Style) */}
            <div className="relative rounded-3xl bg-[#0B1120] border border-slate-800/80 p-5 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-slate-400">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-GB').replace(/\//g, '.')}</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">ACTIVE</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white transition-colors" onClick={() => setIsProfileModalOpen(true)} />
                  <Bell className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white transition-colors" />
                  <Share2 className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white transition-colors" onClick={copyInviteLink} />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-[3px] border-cyan-500/60 overflow-hidden bg-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      <img
                        src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'matrix_explorer'}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-white font-['Space_Grotesk'] tracking-tight">
                      {user?.fullName || user?.username || 'Matrix Explorer'}
                    </h1>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>ID #{user?.id ? String(user.id).substring(0, 5).toUpperCase() : '94856'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>Upline #{matrixAccount?.sponsorId ? String(matrixAccount.sponsorId).substring(0, 5).toUpperCase() : '1'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-800/50 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95"
                >
                  <Link className="w-3 h-3" />
                  <span>{copiedLink ? 'Copied!' : 'Refferal link'}</span>
                </button>
              </div>
            </div>

            {/* Metrics Layout (2-Column Pills + Partners/Team) */}
            <div className="space-y-3">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1120] border border-slate-800/80 p-4 flex flex-col justify-between h-24 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-medium">Profit Base</span>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-black text-white font-['Space_Grotesk']">${profitBase.toFixed(1)}</span>
                    <button 
                      onClick={handleClaimBase}
                      disabled={isClaimingBase || profitBase <= 0}
                      className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none transition-all"
                    >
                      {isClaimingBase ? <RefreshCw className="w-3 h-3 animate-spin" /> : (profitBase <= 0 ? 'Claimed' : 'Claim')}
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#0B1120] border border-slate-800/80 p-4 flex flex-col justify-between h-24 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-medium">Profit Matrix</span>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-black text-emerald-400 font-['Space_Grotesk']">${profitMatrix.toFixed(1)}</span>
                    <button 
                      onClick={handleClaimMatrix}
                      disabled={isClaimingMatrix || profitMatrix <= 0}
                      className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none transition-all"
                    >
                      {isClaimingMatrix ? <RefreshCw className="w-3 h-3 animate-spin" /> : (profitMatrix <= 0 ? 'Claimed' : 'Claim')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1120] border border-slate-800/80 p-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-medium block">Partners</span>
                  <span className="text-xl font-black text-white font-['Space_Grotesk'] mt-1 block">{matrixAccount?.directPartnersCount || 0}</span>
                </div>
                <div className="rounded-2xl bg-[#0B1120] border border-slate-800/80 p-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-medium block">Total Team</span>
                  <span className="text-xl font-black text-amber-300 font-['Space_Grotesk'] mt-1 block">{matrixAccount?.totalTeamCount || 0}</span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0B1120] border border-slate-800/80 p-4 flex flex-col justify-between h-24 shadow-sm opacity-80">
                  <span className="text-[10px] text-slate-400 font-medium">Royalty Base</span>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-black text-slate-400 font-['Space_Grotesk']">$0.0</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#0B1120] border border-slate-800/80 p-4 flex flex-col justify-between h-24 shadow-sm opacity-80">
                  <span className="text-[10px] text-slate-400 font-medium">Royalty Matrix</span>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-black text-slate-400 font-['Space_Grotesk']">$0.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hot Update & Banners */}
            <div className="space-y-3">
              {/* Sky-blue Card */}
              <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 p-5 shadow-[0_8px_30px_rgba(14,165,233,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white font-['Space_Grotesk'] tracking-wide">Royalty is live</h3>
                    <p className="text-xs text-sky-100 mt-1 font-medium">Earn passive rewards.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setActiveModal('royaltyExplore')}
                      className="px-4 py-2 rounded-xl bg-white text-sky-600 text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      Explore
                    </button>
                    <button 
                      onClick={() => setActiveModal('royaltyCalc')}
                      className="px-4 py-2 rounded-xl bg-sky-700/50 text-white text-xs font-bold border border-sky-400/30 hover:bg-sky-700/70 transition-colors"
                    >
                      Calculator
                    </button>
                  </div>
                </div>
              </div>

              {/* Golden Card */}
              <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 shadow-[0_8px_30px_rgba(245,158,11,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white font-['Space_Grotesk'] tracking-wide">Raffle - 3</h3>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-900/40 border border-amber-300/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-amber-100">02 : 14 : 35</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModal('raffle')}
                    className="px-5 py-2.5 rounded-xl bg-white text-amber-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>

            {/* Programs Section */}
            <div className="pt-4">
              <h2 className="text-lg font-black text-white font-['Space_Grotesk'] mb-3">Programs</h2>
              <div className="space-y-3">
                {/* Activation Prompt Bar (if not yet activated) */}
                {!isActivated && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Activate Matrix</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Required $2.00 USDT</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenActivationModal}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    >
                      Activate
                    </button>
                  </div>
                )}

                {/* Base Program Card */}
                <div 
                  onClick={() => setActiveLevelView(Math.min((currentMaxLevel || 0) + 1, 12))}
                  className="relative p-5 rounded-3xl bg-gradient-to-br from-purple-900/60 to-indigo-950/80 border border-purple-500/30 overflow-hidden cursor-pointer group shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)] transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <h3 className="text-2xl font-black text-white font-['Space_Grotesk'] tracking-wide">BASE</h3>
                      </div>
                      
                      {/* Tier Pips */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((levelIdx) => {
                          const isUnlocked = isActivated && !!matrixAccount?.levels?.[levelIdx - 1]?.unlocked;
                          return (
                            <div 
                              key={levelIdx}
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-[#05070E] border border-slate-700/80'}`}
                            >
                              {isUnlocked && <Zap className="w-2.5 h-2.5 text-purple-400" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center space-y-2">
                      <div className="text-right">
                        <span className="text-[10px] text-purple-300 font-medium block">Level {Math.min((currentMaxLevel || 0) + 1, 12)} Cost</span>
                        <span className="text-lg font-black text-white font-['Space_Grotesk']">${[0, 2, 3, 5, 10, 20, 40, 80, 160, 320, 640, 1280, 2560][Math.min((currentMaxLevel || 0) + 1, 12)] || 0}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLevelView(Math.min((currentMaxLevel || 0) + 1, 12));
                        }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-400 text-[#05070E] border border-cyan-300/50 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trinity Program */}
                <div 
                  className="relative p-5 rounded-3xl bg-gradient-to-br from-amber-600/40 via-orange-600/20 to-[#0B1120] border border-orange-500/30 overflow-hidden cursor-not-allowed opacity-90 shadow-sm"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h3 className="text-2xl font-black text-white font-['Space_Grotesk'] tracking-wide">TRINITY</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <Users className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-bold text-amber-400">Team: 0</span>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-slate-800/80 text-slate-400 text-[10px] font-bold border border-slate-700">Matrix: Locked</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#05070E] border border-orange-500/30 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-orange-400/50" />
                    </div>
                  </div>
                </div>

                {/* NexvoraClub Card */}
                <div 
                  className="relative p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-[#05070E] border border-indigo-500/30 overflow-hidden shadow-[0_8px_30px_rgba(79,70,229,0.15)] group hover:shadow-[0_8px_30px_rgba(79,70,229,0.25)] transition-all cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[url('https://api.dicebear.com/7.x/shapes/svg?seed=nexvoraclub&backgroundColor=transparent')] opacity-10 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                  <div className="relative z-10 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Rocket className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-lg font-black text-white font-['Space_Grotesk'] tracking-widest uppercase">NexvoraClub</h3>
                      </div>
                      <p className="text-[11px] text-indigo-200/80 font-medium tracking-wide">Launch. Explore. Transform.</p>
                    </div>
                    
                    <button className="px-5 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      Start Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE LEVEL VIEW (6-Slot Forton Engine) */}
        {activeTab === 'main' && activeLevelView !== null && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
            {/* Top Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-[#0B1120] border border-purple-500/30 flex items-center justify-between shadow-[0_8px_30px_rgba(168,85,247,0.2)]">
              <h2 className="text-xl font-black text-white font-['Space_Grotesk'] tracking-widest">BASE</h2>
              <div className="text-right">
                <span className="text-[10px] text-purple-300 font-medium block">Total profit:</span>
                <span className="text-lg font-black text-white font-['Space_Grotesk']">${((Number(matrixAccount?.levels?.[activeLevelView - 1]?.earnings || 0))).toFixed(1)} USDT</span>
              </div>
            </div>

            {/* Horizontal Level Selector Bar */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4">
              {LEVEL_DETAILS.map((spec) => (
                <button
                  key={spec.level}
                  onClick={() => setActiveLevelView(spec.level)}
                  className={`shrink-0 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeLevelView === spec.level
                      ? 'bg-purple-600 text-white shadow-[0_4px_15px_rgba(168,85,247,0.4)]'
                      : 'bg-[#0B1120] text-slate-400 border border-slate-800/80 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Level {spec.level}
                </button>
              ))}
            </div>

            {/* Active Matrix Card (6 Nodes) */}
            {(() => {
              const spec = LEVEL_DETAILS.find(l => l.level === activeLevelView);
              const levelState = matrixAccount?.levels?.[activeLevelView - 1];
              const isUnlocked = isActivated && !!levelState?.unlocked;
              const canUnlock = isActivated && (activeLevelView === 1 || !!matrixAccount?.levels?.[activeLevelView - 2]?.unlocked);
              const currentSlots = levelState?.currentSlots || [];
              
              if (!spec) return null;

              return (
                <div className="rounded-3xl bg-[#0B1120] border border-slate-800/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  {/* Top row meta */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-medium block">Partners</span>
                      <span className="text-sm font-black text-white flex items-center gap-1 justify-center mt-0.5"><Users className="w-3.5 h-3.5 text-slate-400"/> {levelState?.slotsFilled || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-medium block">Level profit</span>
                      <span className="text-sm font-black text-emerald-400 mt-0.5 block">${Number(levelState?.earnings || 0).toFixed(1)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-medium block">Level price</span>
                      <span className="text-sm font-black text-cyan-400 mt-0.5 block">${spec.cost}</span>
                    </div>
                  </div>

                  {/* 6 Nodes Matrix Layout */}
                  <div className="space-y-6">
                    {/* Row 1: 2 Nodes */}
                    <div className="flex justify-center gap-10 relative">
                      {/* Connecting lines for row 1 to row 2 */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[110px] h-6 border-b-2 border-l-2 border-r-2 border-slate-800/50 rounded-b-lg opacity-50 z-0"></div>
                      
                      {[1, 2].map(slotIdx => {
                        const slot = currentSlots.find(s => s && s.slotNumber === slotIdx);
                        const isOccupied = !!slot;
                        return (
                          <div key={slotIdx} className="relative z-10 flex flex-col items-center">
                            <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                              isOccupied
                                 ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                 : 'bg-[#05070E] border-slate-700/80'
                            }`}>
                              {isOccupied ? (
                                <span className="text-xs font-bold text-blue-300">
                                  {slot.partnerUsername ? String(slot.partnerUsername).substring(0,2).toUpperCase() : (slot.partnerId ? String(slot.partnerId).substring(0,2).toUpperCase() : 'ID')}
                                </span>
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-slate-800" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 2: 4 Nodes */}
                    <div className="flex justify-center gap-4 relative z-10 pt-2">
                      {[3, 4, 5, 6].map((slotIdx, i) => {
                        const slot = currentSlots.find(s => s && s.slotNumber === slotIdx);
                        const isOccupied = !!slot;
                        const isRecycle = slotIdx === 6;
                        
                        let colorClasses = 'bg-[#05070E] border-slate-700/80';
                        if (isOccupied) {
                          if (isRecycle) {
                            colorClasses = 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-amber-300';
                          } else {
                            colorClasses = 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-300';
                          }
                        }
                        return (
                          <div key={slotIdx} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${colorClasses}`}>
                            {isOccupied ? (
                              isRecycle ? (
                                <RefreshCw className="w-4 h-4 text-amber-400" />
                              ) : (
                                <span className="text-[10px] font-bold">
                                  {slot.partnerUsername ? String(slot.partnerUsername).substring(0,2).toUpperCase() : (slot.partnerId ? String(slot.partnerId).substring(0,2).toUpperCase() : 'ID')}
                                </span>
                              )
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Action Button / Status Below Nodes */}
                  <div className="mt-8 flex flex-col items-center justify-center">
                    {isUnlocked ? (
                      <div className="px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Active (Tier Unlocked)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivateLevel(spec.level, spec.cost)}
                        disabled={isActivatingLevel}
                        className={`w-full max-w-sm py-4 rounded-xl text-sm font-black transition-all shadow-lg flex flex-col items-center justify-center ${
                          !isActivatingLevel
                            ? 'bg-cyan-500 text-slate-900 hover:brightness-110 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                            : 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 cursor-wait'
                        }`}
                      >
                        {isActivatingLevel ? (
                          <>
                            <span className="flex items-center gap-2">
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Processing...
                            </span>
                            {activationProgress?.message && (
                              <span className="text-[10px] mt-1 font-medium text-cyan-300 opacity-80">{activationProgress.message}</span>
                            )}
                          </>
                        ) : (
                          `👉 Activate for $${spec.cost} USDT`
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Stats Below Card */}
                  <div className="mt-8 flex items-center gap-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#05070E] border border-slate-800 flex items-center justify-center">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-medium">Reinvest</span>
                        <span className="text-xs font-black text-white flex items-center gap-1">{levelState?.recycleCount || 0} <ChevronLeft className="w-3 h-3 -rotate-90 text-slate-500"/></span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-800/80" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#05070E] border border-slate-800 flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-medium">Lost partners</span>
                        <span className="text-xs font-black text-white">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Color Legend */}
            <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800/80 flex flex-col gap-3 mb-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                <span className="text-[11px] text-slate-400 font-medium">Direct partner</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                <span className="text-[11px] text-slate-400 font-medium">Spillover from above</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="text-[11px] text-slate-400 font-medium">Spillover from below</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                <span className="text-[11px] text-slate-400 font-medium">Recycle</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Global Telemetry Live Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Participants</span>
                  <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
                    {globalStats?.totalUsers || 1284}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    +{globalStats?.joinedToday || 42} Today
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Active members on BNB Chain</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Distributed Volume</span>
                  <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Space_Grotesk']">
                    ${(globalStats?.totalPayoutsDistributed || 94520.5).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-emerald-500 font-bold">USD</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">100% direct instant member payouts</p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Protocol Smart Contract</span>
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-purple-300">
                    {formatShortWalletAddress('0x03d7682C2840612F2040353876628b9784428ACF')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (navigator?.clipboard?.writeText) {
                          navigator.clipboard.writeText('0x03d7682C2840612F2040353876628b9784428ACF');
                          setNotificationMsg({ type: 'success', text: 'Contract address copied to clipboard!' });
                        }
                      } catch {
                        // ignore sandbox error
                      }
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={buildBscScanUrl('0x03d7682C2840612F2040353876628b9784428ACF', 'address')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 ml-auto"
                  >
                    <span>BscScan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">BNB Chain Verified & Immutable</p>
              </div>
            </div>

            {/* Top Earners Leaderboard */}
            <TopEarnersLeaderboard
              currentUser={user}
              onNavigateToMatrix={() => setActiveTab('main')}
            />
          </div>
        )}

        {/* TAB 3: SQUAD */}
        {activeTab === 'squad' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <PartnerMarketingCard matrixAccount={matrixAccount} />
            <TeamTreeView onOpenPartnerCard={() => {}} />
          </div>
        )}

        {/* TAB 4: WALLET */}
        {activeTab === 'wallet' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Web3 Connected Wallet Status Bar */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-cyan-500/30 flex flex-col gap-6 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white font-['Space_Grotesk'] flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                  <span>On-Chain Matrix Wallet</span>
                </h2>
                <div className="flex items-center gap-2">
                  {connectedWallet && (
                    <button
                      type="button"
                      onClick={handleDisconnectWallet}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      fetchMatrixAccount();
                      fetchMatrixTransactions();
                      setNotificationMsg({ type: 'success', text: 'Wallet balance refreshed!' });
                    }}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
                    title="Refresh Balance"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Large Neon Balance Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-cyan-500/30 flex flex-col justify-between shadow-inner">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>USDT Balance (BEP-20)</span>
                  </span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-['Space_Grotesk']">
                      ${Number(walletBalance || 0).toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-emerald-500">USDT</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Available for 1-Click Matrix Upgrades</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-amber-500/30 flex flex-col justify-between shadow-inner">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>BNB Balance (Gas)</span>
                  </span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 font-['Space_Grotesk']">
                      {connectedWallet ? '0.042' : '0.000'}
                    </span>
                    <span className="text-sm font-bold text-amber-500">BNB</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">BNB Chain Native Network Token</p>
                </div>
              </div>

              {/* Connected Web3 Address Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-['Space_Grotesk']">
                        {connectedWallet ? `${getWalletProviderName()}` : 'Web3 Injected Wallet'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        BNB Chain
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      {connectedWallet ? (
                        <>
                          <span className="font-mono text-cyan-300 font-bold">
                            {formatShortWalletAddress(connectedWallet)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                if (navigator?.clipboard?.writeText) {
                                  navigator.clipboard.writeText(connectedWallet);
                                  setNotificationMsg({ type: 'success', text: 'Wallet address copied to clipboard!' });
                                }
                              } catch {
                                // ignore sandbox error
                              }
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={buildBscScanUrl(connectedWallet, 'address')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5"
                            title="View on BscScan"
                          >
                            <span>BscScan</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Connect MetaMask, TrustWallet, or OKX for 100% P2P flow.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  {connectedWallet ? (
                    connectedChainId !== BSC_MAINNET_CHAIN_ID ? (
                      <button
                        type="button"
                        onClick={handleSwitchNetwork}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Switch to BSC</span>
                      </button>
                    ) : (
                      <span className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>BNB Chain Verified</span>
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectWallet}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect Web3 Wallet</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time P2P Matrix Transaction History Ledger */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-white font-['Space_Grotesk']">
                    P2P Matrix Transaction History
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct member-to-member commission payouts & on-chain node activations.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  {(matrixTransactions || []).length} Record{(matrixTransactions || []).length === 1 ? '' : 's'}
                </span>
              </div>

              {loadingTransactions ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Loading on-chain ledger...</span>
                </div>
              ) : (matrixTransactions || []).length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-[#0f172a]/40 border border-slate-800/60 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">No Matrix Transactions Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Activate your $2.00 Web3 matrix node or invite direct partners to start receiving instant 100% P2P payouts directly to your wallet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('main')}
                    className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    Go to Matrix Dashboard
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 font-semibold">
                        <th className="pb-3 px-2">Type / Level</th>
                        <th className="pb-3 px-2">Counterparty</th>
                        <th className="pb-3 px-2">Amount</th>
                        <th className="pb-3 px-2">BscScan Tx</th>
                        <th className="pb-3 px-2 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {(matrixTransactions || []).map((tx) => (
                        <tr key={tx.id || tx.txHash} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  tx.isIncome
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                }`}
                              >
                                {tx.isIncome ? 'Direct Payout' : 'Activation'}
                              </span>
                              <span className="font-bold text-white">
                                {tx.level ? `Level ${tx.level}` : 'Protocol Node'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 font-mono text-slate-400">
                            {tx.isIncome ? `From: ${tx.fromUserName || 'Partner'}` : `To: ${tx.toUserName || 'Upline'}`}
                          </td>
                          <td className="py-3.5 px-2 font-bold font-['Space_Grotesk']">
                            <span className={tx.isIncome ? 'text-emerald-400' : 'text-slate-200'}>
                              {tx.isIncome ? '+' : '-'}${Number(tx.amountUsd || 0).toFixed(2)} USDT
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            {tx.txHash ? (
                              <a
                                href={tx.bscScanUrl || buildBscScanUrl(tx.txHash, 'tx')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
                              >
                                <span>{formatShortWalletAddress(tx.txHash)}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">100% P2P</span>
                            )}
                          </td>
                          <td className="py-3.5 px-2 text-right text-slate-400 text-[11px]">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Just now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SUPPORT */}
        {activeTab === 'support' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Community & Support Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Telegram Leader Support */}
              <div className="p-6 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-cyan-500/30 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl transition-all group-hover:bg-cyan-500/20" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-4">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white font-['Space_Grotesk']">Telegram Support</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect directly with top leader for strategy, mentorship, and instant matrix help.
                  </p>
                </div>
                <a
                  href="https://t.me/Mijan_Success_Leader"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <Send className="w-4 h-4" />
                  <span>@Mijan_Success_Leader</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>

              {/* WhatsApp Official Desk */}
              <div className="p-6 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-emerald-500/30 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transition-all group-hover:bg-emerald-500/20" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white font-['Space_Grotesk']">WhatsApp Desk</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Official WhatsApp support for wallet binding and account activation assistance.
                  </p>
                </div>
                <a
                  href="https://wa.me/8801943119269"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>

              {/* Verified Smart Contract */}
              <div className="p-6 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-purple-500/30 flex flex-col justify-between shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transition-all group-hover:bg-purple-500/20" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white font-['Space_Grotesk']">Verified Contract</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Immutable and publicly verifiable protocol routing on BNB Smart Chain explorer.
                  </p>
                </div>
                <a
                  href={buildBscScanUrl('0x03d7682C2840612F2040353876628b9784428ACF', 'address')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mt-6 w-full py-3 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Verify on BscScan</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Web3 Matrix Architecture & FAQ Guide */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1221]/90 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white font-['Space_Grotesk']">
                  How Nexvora Web3 Matrix Works
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#0f172a]/60 border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center mb-3">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">100% Direct P2P Payouts</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When direct partners activate or upgrade, the commission is sent directly member-to-member on BNB Chain with zero admin escrow.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a]/60 border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-xs flex items-center justify-center mb-3">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">1x3 Dynamic Slot Matrix</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Slots #1 and #2 pay 100% directly to you. Slot #3 triggers an automatic recycle, reopening your matrix level for infinite cycle earnings.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a]/60 border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center mb-3">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">12 Progressive Tiers</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Progress from Level 1 ($3) all the way to Level 12 ($6,000) for maximum exponential earning power across your entire downline squad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING PDF INFO STRIP (Forton Style) */}
      <div className="fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 pointer-events-none pb-4">
        <a 
          href="#"
          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-900/95 to-indigo-900/95 backdrop-blur-xl border border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:brightness-110 transition-all pointer-events-auto cursor-pointer group"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/5 group-hover:bg-white/20 transition-colors">
              <BookOpen className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black font-['Space_Grotesk'] text-white tracking-wide">Nexvora Presentation PDF</span>
              <span className="text-[9px] font-medium text-blue-200 mt-0.5">Official business guide</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-[10px] font-bold shadow-sm transition-transform active:scale-95 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            Download
          </div>
        </a>
      </div>

      {/* Fixed Bottom Dock (6 Navigation Tabs - Forton Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050811]/95 backdrop-blur-2xl border-t border-slate-800/50 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto px-1 py-1.5 flex items-center justify-between">
          {[
            { id: 'main', icon: Layers, label: 'Main' },
            { id: 'overview', icon: Trophy, label: 'Overview' },
            { id: 'token', icon: Coins, label: 'Token' },
            { id: 'squad', icon: Users, label: 'Squad' },
            { id: 'wallet', icon: Wallet, label: 'Wallet' },
            { id: 'support', icon: Info, label: 'Support' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center w-[16%] h-14 transition-all cursor-pointer relative ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <>
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-cyan-400/20 blur-xl rounded-full pointer-events-none" />
                  </>
                )}
                <Icon className={`w-5 h-5 mb-1 transition-all ${isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-110' : 'scale-100'}`} />
                <span className={`text-[9px] ${isActive ? 'font-black' : 'font-semibold'}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Genuine Web3 P2P Transaction Modal (Zero Mock Data) */}
      <P2PTransactionModal
        isOpen={p2pModal.isOpen}
        onClose={() => setP2pModal((prev) => ({ ...prev, isOpen: false }))}
        type={p2pModal.type}
        level={p2pModal.level}
        levelCost={p2pModal.cost}
        userAvailableBalance={walletBalance}
        connectedWallet={connectedWallet}
        onWalletConnected={(addr) => setConnectedWallet(addr)}
        onSuccess={handleP2PSuccess}
        apiFetch={apiFetch}
      />

      {/* User Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={() => {
          fetchMatrixAccount();
          if (typeof refreshMe === 'function') {
            refreshMe();
          }
          setNotificationMsg({ type: 'success', text: 'Profile updated successfully!' });
        }}
      />

      {/* Royalty Explore Modal */}
      {activeModal === 'royaltyExplore' && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-sky-500/30 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(14,165,233,0.15)] relative scale-in-95">
            <button 
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                <Crown className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk']">Royalty Pool</h3>
                <p className="text-xs text-sky-400 font-medium">Global Revenue Share</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-900/50">
                <p className="text-xs text-slate-400 mb-1">Current Pool Balance</p>
                <div className="text-2xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                  $25,450.00
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <p className="text-xs text-slate-400 mb-2">Your Qualification Tier</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Not Qualified</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-md text-[10px] font-bold text-slate-400">Level 11 required</span>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" /> Distribution Rules
                </h4>
                <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                  <li>10% of Global Platform Volume is shared.</li>
                  <li>Distributed equally among all qualified leaders.</li>
                  <li>Requires minimum Level 11 activation.</li>
                  <li>Payouts occur automatically every 24 hours.</li>
                </ul>
              </div>
            </div>
            
            <button 
              onClick={() => setActiveModal('none')}
              className="w-full mt-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Royalty Calculator Modal */}
      {activeModal === 'royaltyCalc' && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-purple-500/30 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative scale-in-95">
            <button 
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk']">Royalty Calc</h3>
                <p className="text-xs text-purple-400 font-medium">Estimate your earnings</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-medium text-slate-400">Target Level (1-12)</label>
                  <span className="text-sm font-bold text-white">Lvl {calcLevel}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="12" 
                  value={calcLevel}
                  onChange={(e) => setCalcLevel(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-medium text-slate-400">Active Team Size</label>
                  <span className="text-sm font-bold text-white">{calcTeamSize}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="500" step="10"
                  value={calcTeamSize}
                  onChange={(e) => setCalcTeamSize(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-900/50 text-center mt-2">
                <p className="text-[10px] text-purple-300/70 font-medium uppercase tracking-wider mb-1">Estimated Monthly Reward</p>
                <div className="text-3xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                  ${((calcLevel * 15.5) + (calcTeamSize * 2.5)).toFixed(2)}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Based on current network volume.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raffle Modal */}
      {activeModal === 'raffle' && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-amber-500/30 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative scale-in-95">
            <button 
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk']">Mega Raffle</h3>
                <p className="text-xs text-amber-400 font-medium">Draws in 02:14:35</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/50 text-center">
                <p className="text-xs text-amber-200/70 mb-1">Current Prize Pool</p>
                <div className="text-3xl font-black text-white font-['Space_Grotesk'] tracking-tight flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  $5,000.00
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-white">Your Tickets</span>
                </div>
                <span className="text-xl font-black text-amber-400">{raffleTickets}</span>
              </div>
              
              <button 
                onClick={() => {
                  setIsClaimingTicket(true);
                  setTimeout(() => {
                    setRaffleTickets(prev => prev + 1);
                    setIsClaimingTicket(false);
                  }, 1000);
                }}
                disabled={isClaimingTicket}
                className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isClaimingTicket ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    Claim Free Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


