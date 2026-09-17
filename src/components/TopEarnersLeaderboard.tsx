import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Coins,
  ShieldCheck,
  TrendingUp,
  Zap,
  Layers,
} from 'lucide-react';
import { LeaderboardEarner, LeaderboardResponse, User } from '../types';

interface TopEarnersLeaderboardProps {
  currentUser?: User | null;
  onNavigateToTasks?: () => void;
  onNavigateToMatrix?: () => void;
  className?: string;
}

export const TopEarnersLeaderboard: React.FC<TopEarnersLeaderboardProps> = ({
  currentUser,
  onNavigateToTasks,
  onNavigateToMatrix,
  className = '',
}) => {
  const [period, setPeriod] = useState<'today' | 'weekly' | 'all_time'>('all_time');
  const [filterType, setFilterType] = useState<'all' | 'matrix' | 'tasks'>('all');
  const [limit, setLimit] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (selectedPeriod: string, selectedLimit: number, selectedFilter: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/public/leaderboard?period=${selectedPeriod}&limit=${selectedLimit}&filterType=${selectedFilter}`);
      if (!res.ok) throw new Error('Failed to load leaderboard');
      const json: LeaderboardResponse = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error('Could not fetch top earners');
      }
    } catch (err: any) {
      console.error('Leaderboard fetch error:', err);
      setError(err.message || 'Error fetching leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(period, limit, filterType);
  }, [period, limit, filterType]);

  const top1 = data?.topEarners?.[0];
  const top2 = data?.topEarners?.[1];
  const top3 = data?.topEarners?.[2];
  const runnersUp = data?.topEarners?.slice(3) || [];

  // Check if current user is in top earners
  const currentUserEntry = currentUser
    ? data?.topEarners?.find((e) => e.userId === currentUser.id)
    : null;

  const formatPoints = (pts: number) => Number(pts).toLocaleString('en-US');
  const formatUsd = (amt: number) => `$${Number(amt).toFixed(2)}`;

  return (
    <div id="top-earners-leaderboard-view" className={`space-y-6 ${className}`}>
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                  Top Earners Leaderboard (লিডারবোর্ড)
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3" /> Live Real Data
                </span>
              </div>
              <p className="text-xs text-slate-400">
                শীর্ষ উপার্জনকারী সদস্যদের তালিকা। সম্পূর্ণ ভেরিফাইড লেজার এবং লাইভ ট্রানজেকশন ডেটা।
              </p>
            </div>
          </div>
        </div>

        {/* Refresh button and quick task & matrix links */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onNavigateToMatrix && (
            <button
              type="button"
              onClick={onNavigateToMatrix}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Web3 Matrix ($2)</span>
            </button>
          )}
          {onNavigateToTasks && (
            <button
              type="button"
              onClick={onNavigateToTasks}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Earn Points & Climb</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => fetchLeaderboard(period, limit, filterType)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Category Tabs (All / Web3 Matrix / Tasks) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-cyan-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All Top Earners (সকল শীর্ষ উপার্জনকারী)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              filterType === 'matrix'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Web3 Matrix Earners ($2 to $6,000)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              filterType === 'tasks'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Micro-Task Earners</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 ml-auto sm:ml-0 px-2">
          <span>Show:</span>
          <button
            type="button"
            onClick={() => setLimit(10)}
            className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
              limit === 10
                ? 'bg-slate-800 text-cyan-400 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top 10
          </button>
          <button
            type="button"
            onClick={() => setLimit(20)}
            className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
              limit === 20
                ? 'bg-slate-800 text-cyan-400 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top 20
          </button>
        </div>
      </div>

      {/* Period Toggles (Today / Weekly / All-Time) */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 w-fit">
        <button
          type="button"
          onClick={() => setPeriod('today')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            period === 'today'
              ? 'bg-slate-800 text-amber-300 shadow-sm font-bold border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>Today's Top (আজকের সেরা)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod('weekly')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            period === 'weekly'
              ? 'bg-slate-800 text-amber-300 shadow-sm font-bold border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>Weekly Top (সাপ্তাহিক সেরা)</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod('all_time')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            period === 'all_time'
              ? 'bg-slate-800 text-amber-300 shadow-sm font-bold border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Crown className="w-3 h-3" />
          <span>All-Time Top (সর্বকালের সেরা)</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="p-12 text-center space-y-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-300">Calculating real-time platform earnings & rankings...</p>
          <p className="text-xs text-slate-500">Connecting to verified transactional ledgers</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-900/50 text-center space-y-2">
          <p className="text-sm font-bold text-red-400">Failed to load leaderboard data</p>
          <p className="text-xs text-slate-400">{error}</p>
          <button
            type="button"
            onClick={() => fetchLeaderboard(period, limit, filterType)}
            className="mt-2 px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* TOP 3 PODIUM (Gold, Silver, Bronze) */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Silver Runner-Up (Desktop order: Left) */}
          {top2 ? (
            <div
              id="podium-rank-2"
              className="relative order-2 md:order-1 p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg hover:border-slate-500/60 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-600 text-slate-200 shadow-sm">
                  <span>🥈</span>
                  <span>Rank #2 • Runner-Up</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {top2.country}
                </span>
              </div>

              <div className="text-center my-2 space-y-2">
                <div className="relative inline-block mx-auto">
                  <img
                    src={top2.avatarUrl}
                    alt={top2.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-400 shadow-md mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(top2.name)}`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-500">
                    2
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base truncate">{top2.name}</h3>
                  {top2.username && (
                    <p className="text-xs text-slate-400 font-mono truncate">{top2.username}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                {top2.matrixLevel ? (
                  <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                    <span className="text-amber-300 flex items-center gap-1 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Matrix Level:</span>
                    </span>
                    <span className="font-bold text-amber-300 font-['Space_Grotesk']">
                      Level {top2.matrixLevel} (${(top2.matrixCommissions || 0).toFixed(2)})
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tasks Completed:</span>
                  </span>
                  <span className="font-bold text-white">{top2.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total Points:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{formatPoints(top2.points)} PTS</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-1">
                  <span className="text-slate-400">Total Earned:</span>
                  <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
                    {formatUsd(top2.totalEarned)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs flex items-center justify-center">
              Awaiting 2nd place contender
            </div>
          )}

          {/* #1 Gold Crown Champion (Desktop order: Center, elevated) */}
          {top1 ? (
            <div
              id="podium-rank-1"
              className="relative order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/70 shadow-2xl hover:border-amber-400 transition-all flex flex-col justify-between -mt-0 md:-mt-2"
            >
              {/* Gold Champion Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                  <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Rank #1 • Crown Champion</span>
                </span>
                <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                  {top1.country}
                </span>
              </div>

              <div className="text-center my-3 space-y-2.5">
                <div className="relative inline-block mx-auto">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                    <Crown className="w-6 h-6 fill-amber-400" />
                  </div>
                  <img
                    src={top1.avatarUrl}
                    alt={top1.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl mx-auto ring-4 ring-amber-500/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(top1.name)}`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 text-xs font-black flex items-center justify-center border-2 border-slate-900 shadow-md">
                    1
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-white text-lg truncate flex items-center justify-center gap-1.5">
                    <span>{top1.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </h3>
                  {top1.username && (
                    <p className="text-xs text-amber-300/80 font-mono truncate">{top1.username}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-amber-500/20 bg-amber-950/20 rounded-xl p-3 space-y-2">
                {top1.matrixLevel ? (
                  <div className="flex items-center justify-between text-xs bg-amber-500/20 border border-amber-500/40 px-2.5 py-1.5 rounded-lg">
                    <span className="text-amber-200 flex items-center gap-1 font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Web3 Node:</span>
                    </span>
                    <span className="font-extrabold text-amber-300 font-['Space_Grotesk']">
                      Level {top1.matrixLevel} (${(top1.matrixCommissions || 0).toFixed(2)})
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tasks Completed:</span>
                  </span>
                  <span className="font-bold text-white">{top1.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total Points:</span>
                  </span>
                  <span className="font-mono font-extrabold text-amber-300">{formatPoints(top1.points)} PTS</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-amber-500/20">
                  <span className="text-amber-200">Total Earned:</span>
                  <span className="text-xl font-black text-amber-300 font-['Space_Grotesk']">
                    {formatUsd(top1.totalEarned)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-1 md:order-2 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs flex items-center justify-center">
              Awaiting 1st place champion
            </div>
          )}

          {/* #3 Bronze Master (Desktop order: Right) */}
          {top3 ? (
            <div
              id="podium-rank-3"
              className="relative order-3 p-5 rounded-2xl bg-slate-900/90 border border-amber-800/40 shadow-lg hover:border-amber-700/60 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/60 border border-amber-800/80 text-amber-300 shadow-sm">
                  <span>🥉</span>
                  <span>Rank #3 • Master</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {top3.country}
                </span>
              </div>

              <div className="text-center my-2 space-y-2">
                <div className="relative inline-block mx-auto">
                  <img
                    src={top3.avatarUrl}
                    alt={top3.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 shadow-md mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(top3.name)}`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-900 text-amber-200 text-xs font-bold flex items-center justify-center border border-amber-700">
                    3
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base truncate">{top3.name}</h3>
                  {top3.username && (
                    <p className="text-xs text-slate-400 font-mono truncate">{top3.username}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                {top3.matrixLevel ? (
                  <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                    <span className="text-amber-300 flex items-center gap-1 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Matrix Level:</span>
                    </span>
                    <span className="font-bold text-amber-300 font-['Space_Grotesk']">
                      Level {top3.matrixLevel} (${(top3.matrixCommissions || 0).toFixed(2)})
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tasks Completed:</span>
                  </span>
                  <span className="font-bold text-white">{top3.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total Points:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{formatPoints(top3.points)} PTS</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-1">
                  <span className="text-slate-400">Total Earned:</span>
                  <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
                    {formatUsd(top3.totalEarned)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-3 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs flex items-center justify-center">
              Awaiting 3rd place contender
            </div>
          )}
        </div>
      )}

      {/* RUNNERS UP LIST (Ranks 4 to Limit) */}
      {runnersUp.length > 0 && (
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-['Space_Grotesk']">
              <Medal className="w-4 h-4 text-cyan-400" />
              <span>Full Leaderboard Standings (ক্রমতালিকা)</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Showing Ranks 4 – {data?.topEarners?.length} of {data?.totalParticipants}
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-center w-16">Rank</th>
                  <th className="py-2.5 px-3">Earner</th>
                  <th className="py-2.5 px-3 text-center">Tasks</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                  <th className="py-2.5 px-3 text-right">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {runnersUp.map((earner) => {
                  const isCurrent = currentUser?.id === earner.userId;
                  return (
                    <tr
                      key={earner.userId}
                      id={`leaderboard-row-${earner.rank}`}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400 text-white font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono ${
                            earner.rank <= 10
                              ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          #{earner.rank}
                        </span>
                      </td>

                      {/* Earner Avatar + Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={earner.avatarUrl}
                            alt={earner.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(earner.name)}`;
                            }}
                          />
                          <div className="truncate max-w-[150px] sm:max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs truncate">
                                {earner.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-600 text-white shrink-0">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                              {earner.username && <span className="font-mono">{earner.username}</span>}
                              {earner.matrixLevel ? (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-0.5">
                                  <Zap className="w-2.5 h-2.5 fill-current" />
                                  <span>L{earner.matrixLevel} (${(earner.matrixCommissions || 0).toFixed(0)})</span>
                                </span>
                              ) : null}
                              {earner.country && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                                  {earner.country}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Completed Tasks Count */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{earner.completedTasks}</span>
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {formatPoints(earner.points)} PTS
                        </span>
                      </td>

                      {/* Total Earned USD */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-extrabold text-white text-xs font-['Space_Grotesk']">
                          {formatUsd(earner.totalEarned)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Ranking Card / Footer if logged in */}
      {currentUser && (
        <div
          id="user-personal-leaderboard-card"
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
              {currentUserEntry ? `#${currentUserEntry.rank}` : '🏆'}
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.fullName}</span>
                <span className="text-slate-400 font-normal">(@{currentUser.username})</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {currentUserEntry
                  ? `You are currently ranked #${currentUserEntry.rank} on the ${period === 'today' ? "today's" : period === 'weekly' ? 'weekly' : 'all-time'} leaderboard with ${formatPoints(currentUserEntry.points)} PTS.`
                  : `Complete more microtasks and courses to earn points and qualify for the Top 20 Leaderboard!`}
              </p>
            </div>
          </div>

          {onNavigateToTasks && (
            <button
              type="button"
              onClick={onNavigateToTasks}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Start Tasks to Climb
            </button>
          )}
        </div>
      )}
    </div>
  );
};
