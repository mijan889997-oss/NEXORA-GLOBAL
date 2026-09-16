import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserBalance } from '../../lib/userBalance';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Sparkles,
  Info,
  DollarSign,
  ArrowDownLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { Withdrawal, PaymentMethodType, PaymentGatewayConfig } from '../../types';

interface WithdrawalsViewProps {
  navigate?: (path: string) => void;
  onBalanceUpdated?: () => void;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ navigate, onBalanceUpdated }) => {
  const { user, wallet, refreshMe, apiFetch } = useAuth();
  const userBalance = useUserBalance();

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethodType>('bKash Personal');
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // History & Gateways states
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Live calculated balance & threshold limits
  const availableBalance = Math.max(wallet?.availableBalance ?? 0, userBalance.availableUsd);
  const pendingBalance = wallet?.pendingBalance ?? userBalance.pendingUsd ?? 0;
  const totalEarned = Math.max(wallet?.totalEarned ?? 0, (wallet?.availableBalance ?? 0) + (wallet?.totalWithdrawn ?? 0), userBalance.totalEarnedUsd, availableBalance);
  const totalWithdrawn = wallet?.totalWithdrawn ?? userBalance.totalWithdrawnUsd ?? 0;

  // Method-specific minimums
  const minThreshold = withdrawMethod === 'USDT / Binance Pay' ? 1.0 : 0.5;
  const isThresholdMet = availableBalance >= minThreshold;
  const progressToThreshold = Math.min(100, Math.max(0, Math.round((availableBalance / minThreshold) * 100)));

  // Load withdrawals history and methods
  const loadWithdrawalsData = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      // Ensure global wallet balance is synchronized from authoritative server state
      await refreshMe();

      const [wdRes, gwRes] = await Promise.all([
        apiFetch('/api/withdrawals/my').catch(() => ({ withdrawals: [] })),
        apiFetch('/api/withdrawals/methods').catch(() => ({ methods: [] })),
      ]);

      if (wdRes?.withdrawals && Array.isArray(wdRes.withdrawals)) {
        setWithdrawals(wdRes.withdrawals);
      }
      if (gwRes?.methods && Array.isArray(gwRes.methods)) {
        setGateways(gwRes.methods);
      }
    } catch (err) {
      console.warn('Failed to load withdrawals data:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadWithdrawalsData();
  }, [user]);

  // Handle Quick Amount Preset selection
  const handleSetPresetAmount = (presetVal: number | 'max') => {
    if (presetVal === 'max') {
      setWithdrawAmount(availableBalance.toFixed(2));
    } else {
      setWithdrawAmount(presetVal.toFixed(2));
    }
    setWithdrawMsg(null);
  };

  // Handle Withdrawal Request Submission
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);

    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawMsg({
        type: 'error',
        text: 'Please enter a valid positive withdrawal amount. / অনুগ্রহ করে একটি সঠিক উত্তোলনের পরিমাণ লিখুন।',
      });
      return;
    }

    if (amountNum < minThreshold) {
      setWithdrawMsg({
        type: 'error',
        text: `Minimum withdrawal amount for ${withdrawMethod} is $${minThreshold.toFixed(2)} USD. / সর্বনিম্ন উত্তোলনের পরিমাণ $${minThreshold.toFixed(2)} ডলার।`,
      });
      return;
    }

    if (amountNum > availableBalance + 0.0001) {
      setWithdrawMsg({
        type: 'error',
        text: `Insufficient funds. Your available balance is $${availableBalance.toFixed(2)} USD, but you requested $${amountNum.toFixed(2)} USD.`,
      });
      return;
    }

    if (!accountDetails.trim()) {
      setWithdrawMsg({
        type: 'error',
        text: 'Please enter your account identifier or mobile wallet number. / অ্যাকাউন্ট নম্বর লিখুন।',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod: withdrawMethod,
          accountDetails: {
            emailOrWalletAddress: accountDetails.trim(),
            accountNumber: accountDetails.trim(),
            accountHolderName: accountHolderName.trim() || user?.fullName || 'N/A',
          },
          clientBalance: availableBalance,
        }),
      });

      setWithdrawMsg({
        type: 'success',
        text: res.message || '🎉 Withdrawal request submitted successfully! Status is set to Pending Review.',
      });

      // Clear input fields
      setWithdrawAmount('');
      setAccountDetails('');
      setAccountHolderName('');

      // Deduct from client-side stored points and balances if demo/test balance is active
      const remainingBalance = Math.max(0, Number((availableBalance - amountNum).toFixed(4)));
      const remainingPoints = Math.max(0, Math.round(remainingBalance * 1000));
      localStorage.setItem('nexvora_user_points', remainingPoints.toString());
      localStorage.setItem('points', remainingPoints.toString());
      localStorage.setItem('user_points', remainingPoints.toString());
      localStorage.setItem('nexvora_wallet_balance', remainingBalance.toFixed(2));
      if (user?.id) {
        localStorage.setItem(`points_${user.id}`, remainingPoints.toString());
      }
      window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { newBalance: remainingBalance, points: remainingPoints, wallet: res.wallet } }));
      window.dispatchEvent(new CustomEvent('pointsUpdated', { detail: { points: remainingPoints } }));

      // Refresh authoritative wallet and history instantly
      await refreshMe();
      await loadWithdrawalsData();

      if (onBalanceUpdated) {
        onBalanceUpdated();
      }
    } catch (err: any) {
      setWithdrawMsg({
        type: 'error',
        text: err.message || 'Failed to submit withdrawal request. Please check your balance and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Balance Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              Withdrawals & Payout Gateways
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Manual & Instant Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Submit payout requests directly to your verified mobile wallet (bKash, Nagad, Rocket) or USDT/Binance Pay.
          </p>
        </div>

        {/* Live Authoritative Balance Card */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/90 rounded-2xl p-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shadow-inner">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Available to Withdraw
            </span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              ${availableBalance.toFixed(2)} <span className="text-xs text-slate-400 font-sans font-medium">USD</span>
            </span>
          </div>
          <button
            onClick={loadWithdrawalsData}
            disabled={loadingHistory}
            title="Refresh Live Balance"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-800/60 shadow-md">
          <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Available Balance
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5 font-['Space_Grotesk']">
            ${availableBalance.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-500/90 font-medium">Real-time ledger synced</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Escrow
          </span>
          <p className="text-2xl font-bold text-amber-400 mt-1.5 font-['Space_Grotesk']">
            ${pendingBalance.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500">Under task review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Lifetime Earned
          </span>
          <p className="text-2xl font-bold text-cyan-400 mt-1.5 font-['Space_Grotesk']">
            ${totalEarned.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500">Tasks, Offerwalls & Bonuses</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" /> Total Withdrawn
          </span>
          <p className="text-2xl font-bold text-purple-400 mt-1.5 font-['Space_Grotesk']">
            ${totalWithdrawn.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500">Successfully disbursed</span>
        </div>
      </div>

      {/* Payout Threshold Progress Meter */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Payout Unlock Threshold: $0.50 Minimum
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isThresholdMet ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Payout Unlocked ({progressToThreshold}%)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ${(minThreshold - availableBalance).toFixed(2)} more needed ({progressToThreshold}%)
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isThresholdMet
                ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-400'
                : 'bg-gradient-to-r from-amber-600 to-amber-400'
            }`}
            style={{ width: `${progressToThreshold}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Starting: $0.00</span>
          <span>Target Min: $0.50 (bKash/Nagad/Rocket) / $1.00 (USDT)</span>
          <span className="font-bold text-emerald-400 font-mono">Current: ${availableBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* New Withdrawal Request Card Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Request Manual Payout
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Disbursements are processed promptly by the finance compliance team.
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gateway Active
          </span>
        </div>

        {withdrawMsg && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 ${
              withdrawMsg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            {withdrawMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{withdrawMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payout Method Selection */}
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                Select Payout Method
              </label>
              <select
                value={withdrawMethod}
                onChange={(e) => {
                  setWithdrawMethod(e.target.value as PaymentMethodType);
                  setWithdrawMsg(null);
                }}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-cyan-400 shadow-inner cursor-pointer"
              >
                <option value="bKash Personal">bKash Personal (Min: $0.50 USD)</option>
                <option value="Nagad Personal">Nagad Personal (Min: $0.50 USD)</option>
                <option value="Rocket Personal">Rocket Personal (Min: $0.50 USD)</option>
                <option value="USDT / Binance Pay">USDT / Binance Pay (Min: $1.00 USD)</option>
              </select>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>
                  Threshold: <strong>${minThreshold.toFixed(2)} USD</strong> (1,000 Coins = $1.00)
                </span>
              </div>
            </div>

            {/* Withdrawal Amount Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  Amount ($ USD)
                </label>
                <span className="text-[11px] text-slate-400">
                  Available: <strong className="text-emerald-400 font-mono">${availableBalance.toFixed(2)}</strong>
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
                <input
                  type="number"
                  required
                  min={minThreshold}
                  max={availableBalance > 0 ? availableBalance : undefined}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    setWithdrawMsg(null);
                  }}
                  placeholder={`Min $${minThreshold.toFixed(2)} (Max: $${availableBalance.toFixed(2)})`}
                  className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>

              {/* Quick Amount Preset Chips */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSetPresetAmount(minThreshold)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                >
                  ${minThreshold.toFixed(2)} Min
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetAmount(1.0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                >
                  $1.00
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetAmount(2.5)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                >
                  $2.50
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetAmount(5.0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                >
                  $5.00
                </button>
                {availableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPresetAmount('max')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-bold transition cursor-pointer"
                  >
                    Max (${availableBalance.toFixed(2)})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account Details Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                {withdrawMethod === 'bKash Personal' && 'bKash Personal Number (11 Digits)'}
                {withdrawMethod === 'Nagad Personal' && 'Nagad Personal Number (11 Digits)'}
                {withdrawMethod === 'Rocket Personal' && 'Rocket Account Number (12 Digits)'}
                {withdrawMethod === 'USDT / Binance Pay' && 'Binance Pay ID / Pay Email / USDT Address'}
              </label>
              <input
                type="text"
                required
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder={
                  withdrawMethod === 'bKash Personal'
                    ? 'e.g., 017XXXXXXXX or 018XXXXXXXX'
                    : withdrawMethod === 'Nagad Personal'
                    ? 'e.g., 018XXXXXXXX or 019XXXXXXXX'
                    : withdrawMethod === 'Rocket Personal'
                    ? 'e.g., 019XXXXXXXX-X'
                    : 'Enter Binance Pay ID, Email or TRC20/BEP20 address'
                }
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                Account Holder Full Name (Optional)
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder={user?.fullName || 'Full Legal Name on Account'}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
              />
            </div>
          </div>

          {/* Balance validation alert if balance is below threshold */}
          {!isThresholdMet && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="space-y-0.5">
                <p className="font-bold">Threshold Requirement Notice</p>
                <p className="text-slate-300 text-[11px]">
                  Your current balance is <strong className="text-white">${availableBalance.toFixed(2)} USD</strong>.
                  Complete microtasks, offerwalls, or freelance gigs to reach the <strong className="text-white">${minThreshold.toFixed(2)} USD</strong> threshold and unlock immediate payout requests.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-400">
              Processing timeline: <span className="text-slate-300 font-semibold">1 to 24 Hours</span> • Zero hidden fees
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isThresholdMet}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Submit Payout Request (${parseFloat(withdrawAmount || '0').toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Withdrawal History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Withdrawal Ledger & Payout History</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
              {withdrawals.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400">Audited double-entry records</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <ArrowDownLeft className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-white">No withdrawal requests yet.</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              Once you submit a payout request, it will appear here with live review tracking and admin transaction confirmation.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-md">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Request ID</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Method & Target</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {withdrawals.map((w) => {
                  const accNumber =
                    w.accountDetails?.accountNumber ||
                    w.accountDetails?.emailOrWalletAddress ||
                    (typeof w.accountDetails === 'string' ? w.accountDetails : 'N/A');

                  return (
                    <tr key={w.id} className="text-slate-300 hover:bg-slate-800/30 transition">
                      <td className="py-3.5 font-mono text-[11px] text-cyan-400 font-bold">
                        {w.withdrawalNumber || w.id}
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(w.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">{w.paymentMethod}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">{accNumber}</p>
                          {w.paymentConfirmationRef && (
                            <p className="text-[10px] text-emerald-400 font-mono">
                              TxID: {w.paymentConfirmationRef}
                            </p>
                          )}
                          {w.adminFeedback && (
                            <p
                              className={`text-[10px] ${
                                w.status === 'Rejected' ? 'text-rose-400' : 'text-amber-400'
                              }`}
                            >
                              Note: {w.adminFeedback}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : w.status === 'Rejected' || w.status === 'Cancelled'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {w.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                          {w.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {w.status === 'Rejected' && <AlertCircle className="w-3 h-3" />}
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-400 font-mono text-sm">
                        ${w.amount.toFixed(2)} USD
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalsView;
