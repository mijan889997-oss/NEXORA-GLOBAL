import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Wallet,
  Zap,
  TrendingUp,
  CreditCard,
  Building2,
  Coins,
} from 'lucide-react';

export interface PayoutItem {
  id: string;
  user: string;
  amount: number;
  method: string;
  status: string;
  timestamp: string;
  type: string;
}

export interface PayoutStats {
  totalDisbursedToday: number;
  averageProcessingTime: string;
  successRate: string;
  supportedMethods: string[];
}

export const LivePayoutsSection: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchPayouts = async () => {
    try {
      const res = await fetch('/api/public/live-payouts');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPayouts(data.payouts || []);
          if (data.stats) setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Could not fetch live payouts feed:', err);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchPayouts();
    // Auto refresh every 45 seconds for dynamic feel
    const interval = setInterval(fetchPayouts, 45000);
    return () => clearInterval(interval);
  }, []);

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  // Method Styling & Badge
  const getMethodBadge = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('bkash')) {
      return {
        label: 'bKash',
        badgeClass: 'bg-pink-950/60 text-pink-400 border-pink-500/40',
        dotClass: 'bg-pink-400',
        icon: <Wallet className="w-3.5 h-3.5 text-pink-400" />,
      };
    }
    if (m.includes('nagad')) {
      return {
        label: 'Nagad',
        badgeClass: 'bg-orange-950/60 text-orange-400 border-orange-500/40',
        dotClass: 'bg-orange-400',
        icon: <CreditCard className="w-3.5 h-3.5 text-orange-400" />,
      };
    }
    if (m.includes('rocket')) {
      return {
        label: 'Rocket',
        badgeClass: 'bg-purple-950/60 text-purple-400 border-purple-500/40',
        dotClass: 'bg-purple-400',
        icon: <Zap className="w-3.5 h-3.5 text-purple-400" />,
      };
    }
    if (m.includes('usdt') || m.includes('crypto')) {
      return {
        label: 'USDT TRC20',
        badgeClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
        dotClass: 'bg-emerald-400',
        icon: <Coins className="w-3.5 h-3.5 text-emerald-400" />,
      };
    }
    return {
      label: method,
      badgeClass: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40',
      dotClass: 'bg-cyan-400',
      icon: <Building2 className="w-3.5 h-3.5 text-cyan-400" />,
    };
  };

  const filteredList = payouts.filter((p) => {
    if (filterMethod === 'ALL') return true;
    return p.method.toLowerCase().includes(filterMethod.toLowerCase());
  });

  return (
    <section id="live-payouts-proof-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Settlement Feed • 100% Verified Ledger Proof</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
              Recent Member Cashouts & Disbursed Earnings
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Real-time payment settlements delivered directly to members via verified mobile banking (bKash, Nagad, Rocket) and instant crypto channels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayouts}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              title="Refresh transaction ticker"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
            {navigate && (
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all"
              >
                <span>Start Earning</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary Bar */}
        {stats && (
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Disbursed Today
              </span>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-['Space_Grotesk'] mt-0.5">
                ${stats.totalDisbursedToday.toFixed(2)} USD
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Avg. Processing Speed
              </span>
              <div className="text-lg sm:text-xl font-bold text-cyan-400 font-['Space_Grotesk'] mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{stats.averageProcessingTime}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Settlement Success
              </span>
              <div className="text-lg sm:text-xl font-bold text-indigo-400 font-['Space_Grotesk'] mt-0.5">
                {stats.successRate}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Payout Channels
              </span>
              <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                bKash • Nagad • Rocket • USDT
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {['ALL', 'bKash', 'Nagad', 'Rocket', 'USDT'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterMethod(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterMethod === tab
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab === 'ALL' ? 'All Channels' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>User identifiers masked to protect account privacy</span>
          </div>
        </div>

        {/* Table / List View */}
        <div className="relative z-10 mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-['Space_Grotesk']">
                  <th className="py-3.5 px-4 sm:px-6">Member ID</th>
                  <th className="py-3.5 px-4 sm:px-6">Disbursement Channel</th>
                  <th className="py-3.5 px-4 sm:px-6">Amount (USD)</th>
                  <th className="py-3.5 px-4 sm:px-6">Settlement Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Time Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>Loading live payout proofs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No payouts recorded under this specific channel recently.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const badge = getMethodBadge(item.method);
                    const bdtApprox = (item.amount * 120).toFixed(0);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-900/50 transition-colors group"
                      >
                        {/* Member Identity */}
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-300">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 text-[11px] font-bold">
                              {item.user.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                {item.user}
                              </span>
                              <span className="block text-[10px] text-slate-500">Verified Member</span>
                            </div>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.badgeClass}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Payout Amount */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="font-['Space_Grotesk']">
                            <span className="text-sm font-extrabold text-emerald-400">
                              +${item.amount.toFixed(2)}
                            </span>
                            <span className="ml-1.5 text-[10px] text-slate-400">
                              (≈ ৳{bdtApprox} BDT)
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{item.status}</span>
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-slate-400">
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{getRelativeTime(item.timestamp)}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Trust Assurance */}
        <div className="relative z-10 mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Encrypted settlement protocol • Strict anti-money laundering compliance verified</span>
          </div>
          <div>
            <span>Direct manual & automated gateway routing enabled</span>
          </div>
        </div>
      </div>
    </section>
  );
};
