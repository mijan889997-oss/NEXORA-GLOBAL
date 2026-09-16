import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserBalance } from '../../lib/userBalance';
import {
  supabase,
  insertSupabaseWithdrawal,
  fetchUserSupabaseWithdrawals,
  fetchSupabaseWithdrawals,
  subscribeToWithdrawals,
} from '../../lib/supabase';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Sparkles,
  DollarSign,
  ArrowDownLeft,
  ChevronRight,
  Send,
  HelpCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import type { Withdrawal, PaymentMethodType, PaymentGatewayConfig } from '../../types';

interface WithdrawalsViewProps {
  navigate?: (path: string) => void;
  onBalanceUpdated?: () => void;
}

// Certified safe default payout gateways
const DEFAULT_PAYOUT_METHODS: {
  id: PaymentMethodType;
  name: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  exchangeRateBdt: number;
  placeholder: string;
  helperText: string;
  badge: string;
  badgeColor: string;
}[] = [
  {
    id: 'bKash Personal',
    name: 'bKash Personal',
    minAmount: 0.5,
    maxAmount: 500,
    currency: 'BDT / USD',
    exchangeRateBdt: 120,
    placeholder: 'e.g. 017XXXXXXXX or 018XXXXXXXX (11 Digits)',
    helperText: 'Enter your 11-digit active bKash personal mobile number',
    badge: 'bKash Direct',
    badgeColor: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  },
  {
    id: 'Nagad Personal',
    name: 'Nagad Personal',
    minAmount: 0.5,
    maxAmount: 500,
    currency: 'BDT / USD',
    exchangeRateBdt: 120,
    placeholder: 'e.g. 018XXXXXXXX or 019XXXXXXXX (11 Digits)',
    helperText: 'Enter your 11-digit active Nagad personal mobile number',
    badge: 'Nagad Direct',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  {
    id: 'Rocket Personal',
    name: 'Rocket Personal',
    minAmount: 0.5,
    maxAmount: 500,
    currency: 'BDT / USD',
    exchangeRateBdt: 120,
    placeholder: 'e.g. 019XXXXXXXX-X (12 Digits with checksum)',
    helperText: 'Enter your 12-digit DBBL Rocket account number',
    badge: 'Rocket DBBL',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    id: 'USDT / Binance Pay',
    name: 'USDT / Binance Pay (Crypto)',
    minAmount: 1.0,
    maxAmount: 5000,
    currency: 'USDT',
    exchangeRateBdt: 120,
    placeholder: 'Binance Pay ID / Pay Email / TRC20 or BEP20 Address',
    helperText: 'Zero-fee Binance Pay ID, registered Binance Email, or BEP-20 / TRC-20 USDT address',
    badge: 'Binance / Web3',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
];

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ navigate, onBalanceUpdated }) => {
  const { user, wallet, updateWallet, apiFetch } = useAuth();
  const userBalance = useUserBalance();

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethodType>('bKash Personal');
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'error' | 'success'; text: string; wdId?: string } | null>(null);

  // History states
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live calculated balance & threshold limits
  const availableBalance = useMemo(() => {
    const fromWallet = wallet?.availableBalance ?? 0;
    const fromUserBalance = userBalance?.availableUsd ?? 0;
    return Math.max(fromWallet, fromUserBalance);
  }, [wallet?.availableBalance, userBalance?.availableUsd]);

  const pendingBalance = useMemo(() => {
    return wallet?.pendingBalance ?? userBalance?.pendingUsd ?? 0;
  }, [wallet?.pendingBalance, userBalance?.pendingUsd]);

  const totalEarned = useMemo(() => {
    return Math.max(
      wallet?.totalEarned ?? 0,
      (wallet?.availableBalance ?? 0) + (wallet?.totalWithdrawn ?? 0),
      userBalance?.totalEarnedUsd ?? 0,
      availableBalance
    );
  }, [wallet?.totalEarned, wallet?.availableBalance, wallet?.totalWithdrawn, userBalance?.totalEarnedUsd, availableBalance]);

  const totalWithdrawn = useMemo(() => {
    return wallet?.totalWithdrawn ?? userBalance?.totalWithdrawnUsd ?? 0;
  }, [wallet?.totalWithdrawn, userBalance?.totalWithdrawnUsd]);

  // Selected method config
  const currentMethodConfig = useMemo(() => {
    return (
      DEFAULT_PAYOUT_METHODS.find((m) => m.id === withdrawMethod) ||
      DEFAULT_PAYOUT_METHODS[0]
    );
  }, [withdrawMethod]);

  const minThreshold = currentMethodConfig.minAmount;
  const isThresholdMet = availableBalance >= minThreshold;
  const progressToThreshold = Math.min(
    100,
    Math.max(0, Math.round((availableBalance / minThreshold) * 100))
  );

  // Estimated conversion to BDT
  const parsedAmount = parseFloat(withdrawAmount) || 0;
  const estimatedBdt = Math.round(parsedAmount * currentMethodConfig.exchangeRateBdt);

  // Synchronize and load withdrawals directly from Supabase
  const loadWithdrawalsData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      // 1. Fetch live user withdrawals from Supabase
      const supaWds = await fetchUserSupabaseWithdrawals(user.id).catch(() => []);

      // 2. Fetch from backend API as secondary fallback
      const wdRes = await apiFetch('/api/withdrawals/my').catch(() => ({ withdrawals: [] }));
      const backendWds: Withdrawal[] = wdRes?.withdrawals || [];

      // 3. Check local cache
      let localWds: Withdrawal[] = [];
      try {
        const raw = localStorage.getItem(`nexvora_withdrawals_${user.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localWds = parsed;
        }
      } catch {}

      // Combine and deduplicate
      const mergedMap = new Map<string, Withdrawal>();

      // Put local and backend first
      for (const w of localWds) {
        if (w.id) mergedMap.set(w.id, w);
      }
      for (const w of backendWds) {
        if (w.id) mergedMap.set(w.id, { ...mergedMap.get(w.id), ...w });
      }
      // Supabase is authoritative
      for (const w of supaWds) {
        if (w.id) mergedMap.set(w.id, { ...mergedMap.get(w.id), ...w });
      }

      const mergedList = Array.from(mergedMap.values());
      // Sort newest first
      mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWithdrawals(mergedList);

      try {
        localStorage.setItem(`nexvora_withdrawals_${user.id}`, JSON.stringify(mergedList));
      } catch {}
    } catch (err) {
      console.warn('Withdrawals data fetch notice:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id, apiFetch]);

  // Initial load and Realtime Supabase Subscription
  useEffect(() => {
    if (user?.id) {
      loadWithdrawalsData();
    }

    // Subscribe to realtime changes on public.withdrawals table
    const unsubscribe = subscribeToWithdrawals(() => {
      console.log('[Supabase Realtime] Withdrawal update received. Refreshing list...');
      loadWithdrawalsData();
    });

    const handleSync = () => loadWithdrawalsData();
    window.addEventListener('withdrawals_updated', handleSync);
    window.addEventListener('balanceUpdated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('withdrawals_updated', handleSync);
      window.removeEventListener('balanceUpdated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user?.id, loadWithdrawalsData]);

  // Quick Amount Preset handler
  const handleSetPresetAmount = (presetVal: number | 'max') => {
    if (presetVal === 'max') {
      setWithdrawAmount(availableBalance > 0 ? availableBalance.toFixed(2) : minThreshold.toFixed(2));
    } else {
      setWithdrawAmount(presetVal.toFixed(2));
    }
    setWithdrawMsg(null);
  };

  // Copy reference / ID
  const handleCopy = (idText: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(idText);
      setCopiedId(idText);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Handle Withdrawal Request Submission
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);

    const amountNum = parseFloat(withdrawAmount);

    // Validation 1: Amount must be positive number
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawMsg({
        type: 'error',
        text: 'অনুগ্রহ করে একটি সঠিক উত্তোলনের পরিমাণ লিখুন। / Please enter a valid positive withdrawal amount.',
      });
      return;
    }

    // Validation 2: Minimum threshold check
    if (amountNum < minThreshold) {
      setWithdrawMsg({
        type: 'error',
        text: `${withdrawMethod} এর জন্য সর্বনিম্ন উত্তোলনের পরিমাণ $${minThreshold.toFixed(2)} USD (৳${(minThreshold * 120).toFixed(0)} BDT)। / Minimum payout for ${withdrawMethod} is $${minThreshold.toFixed(2)} USD.`,
      });
      return;
    }

    // Validation 3: Balance check
    if (amountNum > availableBalance + 0.001) {
      setWithdrawMsg({
        type: 'error',
        text: `পর্যাপ্ত ব্যালেন্স নেই। আপনার বর্তমান ব্যালেন্স $${availableBalance.toFixed(2)} USD, কিন্তু আপনি $${amountNum.toFixed(2)} USD উত্তোলনের অনুরোধ করেছেন।`,
      });
      return;
    }

    // Validation 4: Account details format check
    const cleanAccount = accountDetails.trim();
    if (!cleanAccount) {
      setWithdrawMsg({
        type: 'error',
        text: 'অনুগ্রহ করে আপনার পেমেন্ট অ্যাকাউন্ট নম্বর বা ওয়ালেট অ্যাড্রেস প্রদান করুন। / Please enter your account or wallet identifier.',
      });
      return;
    }

    if (withdrawMethod === 'bKash Personal' || withdrawMethod === 'Nagad Personal') {
      const digitsOnly = cleanAccount.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 11) {
        setWithdrawMsg({
          type: 'error',
          text: `অনুগ্রহ করে সঠিক ১১ ডিজিটের ${withdrawMethod.split(' ')[0]} নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।`,
        });
        return;
      }
    } else if (withdrawMethod === 'Rocket Personal') {
      const digitsOnly = cleanAccount.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 12) {
        setWithdrawMsg({
          type: 'error',
          text: 'অনুগ্রহ করে সঠিক ১২ ডিজিটের রকেট একাউন্ট নম্বর প্রদান করুন (যেমন: 019XXXXXXXXX)।',
        });
        return;
      }
    } else if (withdrawMethod === 'USDT / Binance Pay') {
      if (cleanAccount.length < 5) {
        setWithdrawMsg({
          type: 'error',
          text: 'অনুগ্রহ করে সঠিক Binance Pay ID, ইমেইল অথবা USDT ওয়ালেট অ্যাড্রেস প্রদান করুন।',
        });
        return;
      }
    }

    setIsSubmitting(true);
    const generatedWdNumber = `WD-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedWdId = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newWithdrawalRecord: Withdrawal = {
      id: generatedWdId,
      withdrawalNumber: generatedWdNumber,
      userId: user?.id || 'guest',
      userName: user?.fullName || user?.username || 'Member',
      userEmail: user?.email || '',
      walletId: wallet?.id || 'wal_default',
      amount: amountNum,
      fee: 0,
      netAmount: amountNum,
      paymentMethod: withdrawMethod,
      accountDetails: {
        emailOrWalletAddress: cleanAccount,
        accountNumber: cleanAccount,
        accountHolderName: accountHolderName.trim() || user?.fullName || 'Member',
      },
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      // 1. Direct INSERT into Supabase public.withdrawals table
      const supaInsertResult = await insertSupabaseWithdrawal({
        id: generatedWdId,
        userId: user?.id || 'guest',
        userName: user?.fullName || user?.username || 'Member',
        userEmail: user?.email || '',
        amount: amountNum,
        method: withdrawMethod,
        accountNumber: cleanAccount,
        fee: 0,
        netAmount: amountNum,
      });

      const finalRecord = supaInsertResult.withdrawal || newWithdrawalRecord;

      // 2. Direct Profile balance & points deduction in Supabase
      if (user?.id) {
        try {
          const { data: profData } = await supabase
            .from('profiles')
            .select('points, balance')
            .eq('id', user.id)
            .single();

          if (profData) {
            const currentPts = Number((profData as any).points || 0);
            const currentBal = Number((profData as any).balance || 0);
            const updatedBal = Math.max(0, Number((currentBal - amountNum).toFixed(4)));
            const updatedPts = Math.max(0, Math.round(updatedBal * 1000));

            await supabase
              .from('profiles')
              .update({
                balance: updatedBal,
                points: updatedPts,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);
          }
        } catch (supaErr) {
          console.warn('[Supabase Profile Deduction]:', supaErr);
        }
      }

      // 3. Deduct balance from local store and dispatch non-looping balance sync
      const remainingBalance = Math.max(0, Number((availableBalance - amountNum).toFixed(4)));
      const remainingPoints = Math.max(0, Math.round(remainingBalance * 1000));
      localStorage.setItem('nexvora_user_points', remainingPoints.toString());
      localStorage.setItem('points', remainingPoints.toString());
      localStorage.setItem('user_points', remainingPoints.toString());
      localStorage.setItem('nexvora_wallet_balance', remainingBalance.toFixed(2));
      localStorage.setItem('nexvora_user_balance', remainingBalance.toFixed(2));
      if (user?.id) {
        localStorage.setItem(`points_${user.id}`, remainingPoints.toString());
      }

      // 4. Update active wallet state
      if (updateWallet) {
        updateWallet({
          availableBalance: remainingBalance,
          pendingBalance: (wallet?.pendingBalance || 0) + amountNum,
        });
      }

      // 5. Submit to backend API as secondary sync
      try {
        await apiFetch('/api/withdrawals/request', {
          method: 'POST',
          body: JSON.stringify({
            amount: amountNum,
            paymentMethod: withdrawMethod,
            accountDetails: {
              emailOrWalletAddress: cleanAccount,
              accountNumber: cleanAccount,
              accountHolderName: accountHolderName.trim() || user?.fullName || 'N/A',
            },
            clientBalance: availableBalance,
          }),
        });
      } catch (apiErr) {
        console.warn('[Withdrawal API sync notice]:', apiErr);
      }

      // 6. Persist to local state & storage
      const updatedHistory = [
        finalRecord,
        ...withdrawals.filter((w) => w.id !== generatedWdId && w.withdrawalNumber !== generatedWdNumber),
      ];
      setWithdrawals(updatedHistory);
      if (user?.id) {
        try {
          localStorage.setItem(`nexvora_withdrawals_${user.id}`, JSON.stringify(updatedHistory));
        } catch {}
      }

      // Also persist to global admin withdrawals cache for instant visibility
      try {
        const adminCacheKey = 'nexvora_admin_withdrawals_cache';
        const existingCache = JSON.parse(localStorage.getItem(adminCacheKey) || '[]');
        const mergedCache = [
          finalRecord,
          ...existingCache.filter(
            (x: any) => x.id !== finalRecord.id && x.withdrawalNumber !== finalRecord.withdrawalNumber
          ),
        ];
        localStorage.setItem(adminCacheKey, JSON.stringify(mergedCache));
      } catch {}

      // Asynchronously sync to backend Express database
      try {
        apiFetch('/api/admin/withdrawals/sync', {
          method: 'POST',
          body: JSON.stringify({ withdrawals: [finalRecord] }),
        }).catch(() => {});
      } catch {}

      // 7. Dispatch events for real-time balance propagation
      window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { newBalance: remainingBalance, points: remainingPoints } }));
      window.dispatchEvent(new CustomEvent('pointsUpdated', { detail: { newBalance: remainingBalance, points: remainingPoints } }));
      window.dispatchEvent(new Event('withdrawals_updated'));
      window.dispatchEvent(new Event('storage'));

      // 8. Success feedback & field reset
      setWithdrawMsg({
        type: 'success',
        text: `🎉 উত্তোলন সফলভাবে রিকুয়েস্ট করা হয়েছে! ট্র্যাকিং আইডি: ${finalRecord.withdrawalNumber}। কমপ্লায়েন্স টিম যাচাই বাছাই করে দ্রুত পেমেন্ট পাঠিয়ে দেবে।`,
        wdId: finalRecord.withdrawalNumber,
      });

      setWithdrawAmount('');
      setAccountDetails('');
      setAccountHolderName('');

      // Notify parent without looping
      if (onBalanceUpdated) {
        setTimeout(() => {
          onBalanceUpdated();
        }, 100);
      }
    } catch (err: any) {
      setWithdrawMsg({
        type: 'error',
        text: err.message || 'উত্তোলন রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে ব্যালেন্স চেক করে পুনরায় চেষ্টা করুন।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Balance Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              উত্তোলন ও পেমেন্ট গেটওয়ে (Withdrawals)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Direct Payout Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            আপনার অর্জিত ডলার সরাসরি বিকাশ, নগদ, রকেট অথবা USDT/Binance Pay এর মাধ্যমে উত্তোলন করুন।
          </p>
        </div>

        {/* Live Authoritative Balance Card */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Withdrawable Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                ${availableBalance.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-sans font-medium">
                USD (≈ ৳{(availableBalance * 120).toFixed(0)} BDT)
              </span>
            </div>
          </div>
          <button
            onClick={loadWithdrawalsData}
            disabled={loadingHistory}
            title="Refresh Ledger"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-800/60 shadow-md">
          <span className="text-[11px] sm:text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Available Balance
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1.5 font-['Space_Grotesk'] font-mono">
            ${availableBalance.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-500/90 font-medium block mt-0.5">
            ≈ ৳{(availableBalance * 120).toFixed(0)} BDT
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Pending Escrow
          </span>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1.5 font-['Space_Grotesk'] font-mono">
            ${pendingBalance.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Under task review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Lifetime Earned
          </span>
          <p className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1.5 font-['Space_Grotesk'] font-mono">
            ${totalEarned.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">All tasks & bonuses</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Total Withdrawn
          </span>
          <p className="text-xl sm:text-2xl font-bold text-purple-400 mt-1.5 font-['Space_Grotesk'] font-mono">
            ${totalWithdrawn.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">Paid to members</span>
        </div>
      </div>

      {/* Payout Threshold Progress Meter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Payout Unlock Threshold: ${minThreshold.toFixed(2)} USD Minimum
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
          <span>Target Min: ${minThreshold.toFixed(2)} USD (৳{(minThreshold * 120).toFixed(0)} BDT)</span>
          <span className="font-bold text-emerald-400 font-mono">Current: ${availableBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Gateway Cards Selector */}
      <div className="space-y-2">
        <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
          পেমেন্ট মাধ্যম সিলেক্ট করুন (Supported Payout Methods):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEFAULT_PAYOUT_METHODS.map((m) => {
            const isSelected = withdrawMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setWithdrawMethod(m.id);
                  setWithdrawMsg(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800/95 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg scale-[1.01]'
                    : 'bg-slate-900 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.badgeColor}`}>
                    {m.badge}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600 bg-slate-950'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk']">{m.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Min: <strong>${m.minAmount.toFixed(2)}</strong></span>
                    <span className="text-emerald-400 font-mono font-semibold">1 USD = ৳120</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Withdrawal Request Form Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <span>উত্তোলন ফরম (Payout Request Form)</span>
              <span className="text-xs text-cyan-400 font-mono font-medium">[{withdrawMethod}]</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              সঠিক অ্যাকাউন্ট নম্বর ও পরিমাণ লিখে সাবমিট করুন। ২৪ ঘণ্টার মধ্যে পেমেন্ট প্রসেস করা হবে।
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Instant Queue Active
          </span>
        </div>

        {/* Action feedback message */}
        {withdrawMsg && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 ${
              withdrawMsg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            {withdrawMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="leading-relaxed block font-medium">{withdrawMsg.text}</span>
              {withdrawMsg.wdId && (
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-cyan-300">
                  <span>Tracking Ref: {withdrawMsg.wdId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(withdrawMsg.wdId!)}
                    className="p-1 hover:text-white transition cursor-pointer"
                  >
                    {copiedId === withdrawMsg.wdId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payout Method Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                পেমেন্ট গেটওয়ে (Payout Method)
              </label>
              <select
                value={withdrawMethod}
                onChange={(e) => {
                  setWithdrawMethod(e.target.value as PaymentMethodType);
                  setWithdrawMsg(null);
                }}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-cyan-400 shadow-inner cursor-pointer"
              >
                {DEFAULT_PAYOUT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Min: ${m.minAmount.toFixed(2)} USD)
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>
                  সর্বনিম্ন উত্তোলন: <strong>${minThreshold.toFixed(2)} USD</strong> (1,000 Points = $1.00 USD)
                </span>
              </div>
            </div>

            {/* Withdrawal Amount Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  উত্তোলনের পরিমাণ (Amount in USD)
                </label>
                <span className="text-[11px] text-slate-400">
                  উপলব্ধ: <strong className="text-emerald-400 font-mono">${availableBalance.toFixed(2)} USD</strong>
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

              {/* Conversion Preview & Quick Presets */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
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

                {parsedAmount > 0 && (
                  <span className="text-[11px] font-bold text-amber-400 font-mono">
                    পাবেন: ≈ ৳{estimatedBdt} BDT
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account Details & Holder Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                {withdrawMethod === 'bKash Personal' && 'বিকাশ পার্সোনাল মোবাইল নম্বর (11 Digits)'}
                {withdrawMethod === 'Nagad Personal' && 'নগদ পার্সোনাল মোবাইল নম্বর (11 Digits)'}
                {withdrawMethod === 'Rocket Personal' && 'রকেট একাউন্ট নম্বর (12 Digits with checksum)'}
                {withdrawMethod === 'USDT / Binance Pay' && 'Binance Pay ID / Pay Email / USDT Address'}
              </label>
              <input
                type="text"
                required
                value={accountDetails}
                onChange={(e) => {
                  setAccountDetails(e.target.value);
                  setWithdrawMsg(null);
                }}
                placeholder={currentMethodConfig.placeholder}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
              />
              <p className="text-[10px] text-slate-500">{currentMethodConfig.helperText}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                অ্যাকাউন্ট হোল্ডার এর নাম (Account Holder Name) - ঐচ্ছিক
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder={user?.fullName || 'Full Legal Name on Account'}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
              />
              <p className="text-[10px] text-slate-500">
                পেমেন্ট দ্রুত ভেরিফিকেশন এর সুবিধার্থে সঠিক নাম লিখুন।
              </p>
            </div>
          </div>

          {/* Balance validation alert if balance is below threshold */}
          {!isThresholdMet && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="space-y-0.5">
                <p className="font-bold">সর্বনিম্ন ব্যালেন্স নোটিশ (Threshold Notice)</p>
                <p className="text-slate-300 text-[11px]">
                  আপনার বর্তমান ব্যালেন্স <strong className="text-white">${availableBalance.toFixed(2)} USD</strong>।
                  টাস্ক সম্পন্ন করে ব্যালেন্স নূন্যতম <strong className="text-white">${minThreshold.toFixed(2)} USD (৳{(minThreshold * 120).toFixed(0)} BDT)</strong> এ পৌঁছালে উইথড্র সাবমিট করতে পারবেন।
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>প্রসেসিং সময়: <strong>১ থেকে ২৪ ঘণ্টার মধ্যে</strong> • নো হিডেন চার্জ (0% Fee)</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isThresholdMet}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>রিকোয়েস্ট প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>
                    Submit Payout Request (${parseFloat(withdrawAmount || '0').toFixed(2)} USD ≈ ৳{estimatedBdt} BDT)
                  </span>
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
            <span>উত্তোলনের হিস্ট্রি ও লেজার (Payout History)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
              {withdrawals.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400">Audited double-entry records</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <ArrowDownLeft className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-white">এখনও কোনো উত্তোলনের রিকোয়েস্ট নেই।</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              আপনি যখন উইথড্র রিকোয়েস্ট পাঠাবেন, তা তাৎক্ষণিকভাবে এখানে ট্র্যাকিং আইডি ও স্ট্যাটাসসহ প্রদর্শিত হবে।
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

                  const wdIdentifier = w.withdrawalNumber || w.id;

                  return (
                    <tr key={w.id} className="text-slate-300 hover:bg-slate-800/30 transition">
                      <td className="py-3.5 font-mono text-[11px] text-cyan-400 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span>{wdIdentifier}</span>
                          <button
                            onClick={() => handleCopy(wdIdentifier)}
                            className="p-1 hover:text-white transition cursor-pointer text-slate-500 hover:text-slate-200"
                            title="কপি করুন"
                          >
                            {copiedId === wdIdentifier ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
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
                              TxID / TrxID: {w.paymentConfirmationRef}
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
                          {w.status === 'Pending' ? 'Pending Review' : w.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-400 font-mono text-sm">
                        ${w.amount.toFixed(2)} USD
                        <span className="block text-[10px] text-slate-400 font-normal">
                          ≈ ৳{(w.amount * 120).toFixed(0)} BDT
                        </span>
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
