import React, { useState, useEffect } from 'react';
import { Trophy, Crown, ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import { LeaderboardEarner, LeaderboardResponse } from '../types';

interface LeaderboardWidgetProps {
  onViewFullLeaderboard: () => void;
  className?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  onViewFullLeaderboard,
  className = '',
}) => {
  const [topEarners, setTopEarners] = useState<LeaderboardEarner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'today' | 'all_time'>('all_time');

  useEffect(() => {
    let isMounted = true;
    const fetchTop = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/leaderboard?period=${period}&limit=5`);
        if (!res.ok) throw new Error('Failed to load');
        const json: LeaderboardResponse = await res.json();
        if (isMounted && json.success) {
          setTopEarners(json.topEarners || []);
        }
      } catch (e) {
        console.error('Leaderboard widget fetch error', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTop();
    return () => {
      isMounted = false;
    };
  }, [period]);

  const top1 = topEarners[0];

  return (
    <div
      id="featured-leaderboard-widget"
      className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-xl relative overflow-hidden space-y-4 ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
            <Trophy className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk'] tracking-tight">
                Top Earners (টপ আর্নার্স)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400">লাইভ আয়ের ভিত্তিতে সেরা পারফরমার</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              period === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPeriod('all_time')}
            className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              period === 'all_time'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Champion Highlight Card if available */}
      {top1 && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={top1.avatarUrl}
                alt={top1.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(top1.name)}`;
                }}
              />
              <span className="absolute -top-1.5 -right-1 text-xs">👑</span>
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-xs sm:text-sm truncate">
                  {top1.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-amber-300 font-mono">
                {top1.username || `@earner_${top1.rank}`} • {top1.country}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-sm sm:text-base font-extrabold text-amber-300 font-['Space_Grotesk'] block">
              ${top1.totalEarned.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {top1.points.toLocaleString()} PTS
            </span>
          </div>
        </div>
      )}

      {/* Top 2 to 5 Compact List */}
      <div className="space-y-1.5">
        {loading && topEarners.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading top earners...</div>
        ) : (
          topEarners.slice(1, 5).map((earner) => (
            <div
              key={earner.userId}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/60 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                    earner.rank === 2
                      ? 'bg-slate-700 text-slate-200'
                      : earner.rank === 3
                      ? 'bg-amber-900/60 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {earner.rank === 2 ? '🥈' : earner.rank === 3 ? '🥉' : `#${earner.rank}`}
                </span>
                <img
                  src={earner.avatarUrl}
                  alt={earner.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(earner.name)}`;
                  }}
                />
                <span className="font-semibold text-slate-200 truncate max-w-[120px] sm:max-w-[160px]">
                  {earner.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-right shrink-0">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {earner.points.toLocaleString()} PTS
                </span>
                <span className="text-xs font-extrabold text-white font-['Space_Grotesk']">
                  ${earner.totalEarned.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Button to navigate to full leaderboard */}
      <button
        type="button"
        id="btn-view-full-leaderboard"
        onClick={onViewFullLeaderboard}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold text-xs transition-colors border border-slate-700/80 flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
      >
        <span>View Full Leaderboard (সম্পূর্ণ লিডারবোর্ড দেখুন)</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
