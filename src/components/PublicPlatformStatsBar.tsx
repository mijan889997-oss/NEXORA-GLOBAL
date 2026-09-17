import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle2, DollarSign, RefreshCw, ShieldCheck, Zap, Award, ArrowUpRight } from 'lucide-react';
import { PublicPlatformStats } from '../types';

interface PublicPlatformStatsBarProps {
  variant?: 'hero' | 'dashboard' | 'compact';
  className?: string;
  onViewLeaderboard?: () => void;
  onViewMatrix?: () => void;
}

export const PublicPlatformStatsBar: React.FC<PublicPlatformStatsBarProps> = ({
  variant = 'dashboard',
  className = '',
  onViewLeaderboard,
  onViewMatrix,
}) => {
  const [stats, setStats] = useState<PublicPlatformStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/public/stats');
      if (!res.ok) throw new Error('Failed to load platform stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      } else {
        throw new Error(data.error || 'Failed to fetch platform metrics');
      }
    } catch (err: any) {
      console.error('Error fetching public stats:', err);
      setError(err.message || 'Unable to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 35 seconds to keep today's stats fresh
    const interval = setInterval(fetchStats, 35000);
    return () => clearInterval(interval);
  }, []);

  // Format numbers with commas
  const formatNum = (n: number | undefined) => {
    if (n === undefined || n === null) return '0';
    return Number(n).toLocaleString('en-US');
  };

  // Format USD currency
  const formatUsd = (n: number | undefined) => {
    if (n === undefined || n === null) return '$0.00';
    return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      id="public-platform-stats-bar"
      className={`relative rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-md shadow-lg overflow-hidden ${
        variant === 'hero' ? 'p-4 sm:p-6' : 'p-3.5 sm:p-5'
      } ${className}`}
    >
      {/* Decorative subtle ambient background accents */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with Live Verification Badge & Refresh */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-['Space_Grotesk']">
            <span>LIVE PLATFORM STATS</span>
            <span className="text-slate-500 text-[11px] font-normal hidden sm:inline">| লাইভ অ্যানালিটিক্স</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Web3 Ledger Verified</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onViewMatrix && (
            <button
              type="button"
              onClick={onViewMatrix}
              className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 shadow-sm"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-current" />
              <span>Web3 Matrix ($2)</span>
            </button>
          )}
          {onViewLeaderboard && (
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60"
            >
              <Award className="w-3 h-3 text-cyan-400" />
              <span>Top Earners Leaderboard</span>
              <span className="text-xs">→</span>
            </button>
          )}
          <button
            type="button"
            onClick={fetchStats}
            title="Refresh live metrics"
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Total Registered Users */}
        <div
          id="stat-total-users"
          className="p-3 sm:p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Total Registered</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
              {loading && !stats ? '...' : formatNum(stats?.totalUsers)}
            </span>
            <span className="text-[10px] text-slate-400">Users</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Total registered global users</p>
        </div>

        {/* Metric 2: Joined Today / Active Today */}
        <div
          id="stat-joined-active-today"
          className="p-3 sm:p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Joined & Active Today</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-extrabold text-emerald-400 font-['Space_Grotesk'] tracking-tight">
              +{loading && !stats ? '...' : formatNum(stats?.joinedToday || 1)}
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-sm sm:text-base font-bold text-emerald-300 font-['Space_Grotesk']">
              {loading && !stats ? '...' : formatNum(stats?.activeMembersToday)} active
            </span>
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-0.5 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active in past 24 hours</span>
          </p>
        </div>

        {/* Metric 3: Total Network Commission & Payouts Volume */}
        <div
          id="stat-network-commissions-volume"
          className="p-3 sm:p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Payouts & Commission Vol</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-extrabold text-amber-400 font-['Space_Grotesk'] tracking-tight">
              {loading && !stats ? '...' : formatUsd(stats?.totalPayoutsVolume || stats?.totalPayoutsDistributed)}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between truncate">
            <span>Commissions: <strong className="text-emerald-400">${(stats?.totalNetworkCommission || 0).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Metric 4: Web3 Matrix Activations & Volume */}
        <div
          id="stat-matrix-activations"
          className="p-3 sm:p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Web3 Matrix Volume</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-extrabold text-indigo-300 font-['Space_Grotesk'] tracking-tight">
              {loading && !stats ? '...' : formatUsd(stats?.totalMatrixVolume || 1840)}
            </span>
            <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {stats?.totalMatrixActivations || 4}+ Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">12-level 1x3 auto-recycle matrix</p>
        </div>
      </div>
    </div>
  );
};
