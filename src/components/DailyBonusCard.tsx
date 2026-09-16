import React, { useState, useEffect } from 'react';
import {
  Gift,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface DailyBonusCardProps {
  onClaimSuccess?: (rewardAmount: number) => void;
  compact?: boolean;
}

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DAILY_BONUS_USD = 0.01;
const DAILY_BONUS_PTS = 10;
const STORAGE_KEY = 'nexvora_last_daily_claim';
const STREAK_KEY = 'nexvora_daily_bonus_streak';

export const DailyBonusCard: React.FC<DailyBonusCardProps> = ({
  onClaimSuccess,
  compact = false,
}) => {
  const { user, wallet, updateWallet, refreshMe } = useAuth();
  const [canClaim, setCanClaim] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isJustClaimed, setIsJustClaimed] = useState<boolean>(false);

  // Check claim status from localStorage on mount & user changes
  useEffect(() => {
    const checkClaimStatus = () => {
      try {
        const lastClaimStr = localStorage.getItem(STORAGE_KEY);
        const savedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '1', 10);
        if (!isNaN(savedStreak) && savedStreak > 0) {
          setStreak(savedStreak);
        }

        if (lastClaimStr) {
          const lastClaimTimestamp = parseInt(lastClaimStr, 10);
          if (!isNaN(lastClaimTimestamp)) {
            const now = Date.now();
            const elapsed = now - lastClaimTimestamp;

            if (elapsed < DAILY_COOLDOWN_MS) {
              const secondsLeft = Math.ceil((DAILY_COOLDOWN_MS - elapsed) / 1000);
              setCanClaim(false);
              setRemainingSeconds(Math.max(1, secondsLeft));
              return;
            } else {
              // If more than 48 hours passed, streak resets to 1
              if (elapsed > DAILY_COOLDOWN_MS * 2 && savedStreak > 1) {
                setStreak(1);
                localStorage.setItem(STREAK_KEY, '1');
              }
            }
          }
        }

        // Ready to claim
        setCanClaim(true);
        setRemainingSeconds(0);
      } catch (err) {
        console.warn('Error reading daily bonus status from storage:', err);
        setCanClaim(true);
        setRemainingSeconds(0);
      }
    };

    checkClaimStatus();

    // Listen to storage events across tabs/windows
    window.addEventListener('storage', checkClaimStatus);
    return () => window.removeEventListener('storage', checkClaimStatus);
  }, [user?.id]);

  // Live countdown timer interval
  useEffect(() => {
    if (canClaim || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClaim(true);
          setIsJustClaimed(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [canClaim, remainingSeconds]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  };

  const timeData = formatTime(remainingSeconds);

  // 100% Client-Side Daily Claim Logic
  const handleClaim = () => {
    if (!canClaim) return;

    try {
      const nowTimestamp = Date.now();

      // 1. Add $0.01 (or 10 PTS) directly to user's available balance and navbar balance in state & localStorage
      const currentAvailable = wallet?.availableBalance || 0;
      const currentEarned = wallet?.totalEarned || 0;
      const newAvailable = Number((currentAvailable + DAILY_BONUS_USD).toFixed(4));
      const newTotalEarned = Number((currentEarned + DAILY_BONUS_USD).toFixed(4));

      // Update AuthContext wallet state
      if (updateWallet) {
        updateWallet({
          availableBalance: newAvailable,
          totalEarned: newTotalEarned,
        });
      }

      // Update localStorage points and balances
      const currentPoints = Number(localStorage.getItem('user_points') || '0');
      const updatedPoints = currentPoints + DAILY_BONUS_PTS;
      localStorage.setItem('user_points', updatedPoints.toString());

      if (user?.id) {
        localStorage.setItem(`points_${user.id}`, updatedPoints.toString());
      }
      localStorage.setItem('nexvora_wallet_balance', newAvailable.toString());

      // 2. Save current timestamp to localStorage
      localStorage.setItem(STORAGE_KEY, nowTimestamp.toString());

      // Increment streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem(STREAK_KEY, newStreak.toString());

      // 3. Instantly update button state to "Claimed (Available in 24h)" and disable it
      setCanClaim(false);
      setIsJustClaimed(true);
      setRemainingSeconds(24 * 60 * 60); // 86400 seconds = 24h

      // Dispatch real-time balance update event to instantly sync Navbar & global components
      window.dispatchEvent(
        new CustomEvent('balanceUpdated', {
          detail: {
            added: DAILY_BONUS_PTS,
            points: updatedPoints,
            newBalance: newAvailable,
            wallet: wallet
              ? {
                  ...wallet,
                  availableBalance: newAvailable,
                  totalEarned: newTotalEarned,
                }
              : undefined,
          },
        })
      );
      window.dispatchEvent(new Event('storage'));

      // 4. Show success toast: "🎉 দৈনিক বোনাস $0.01 সফলভাবে যোগ হয়েছে!"
      const toastText = '🎉 দৈনিক বোনাস $0.01 সফলভাবে যোগ হয়েছে!';
      setToastMessage(toastText);
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);

      // Call optional parent onClaimSuccess callback
      if (onClaimSuccess) {
        onClaimSuccess(DAILY_BONUS_USD);
      }

      // Trigger silent background refresh if available
      if (refreshMe) {
        refreshMe().catch(() => {});
      }
    } catch (err: any) {
      console.error('Error claiming daily bonus locally:', err);
    }
  };

  return (
    <>
      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-100" />
          <div className="text-sm font-bold tracking-tight">{toastMessage}</div>
        </div>
      )}

      <div
        id="daily-login-bonus-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 shadow-xl shadow-amber-950/10 p-5 sm:p-6"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Banner */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Gift className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Space_Grotesk'] tracking-wide">
                  Daily Login Bonus
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  +$0.01 / 24h
                </span>
                {streak > 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {streak}d Streak
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Login loyalty reward available once every 24 hours. Instant wallet credit.
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {canClaim ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Ready to Claim
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                Available in 24h
              </span>
            )}
          </div>
        </div>

        {/* Main Claim & Countdown Section */}
        <div className="relative z-10 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Left: Reward Value Info */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
              Daily Reward Value
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400 font-['Space_Grotesk']">
                $0.01
              </span>
              <span className="text-xs text-emerald-400 font-medium">USD Cash (+10 PTS)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Directly credited to your real available ledger balance.
            </p>
          </div>

          {/* Center: Live Countdown or Ready State */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            {canClaim ? (
              <div className="text-center space-y-1 py-1">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 mb-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-white">Bonus Ready Now</p>
                <p className="text-[10px] text-emerald-400">Click below to claim your reward</p>
              </div>
            ) : (
              <div className="text-center space-y-1.5 w-full">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Next Claim In
                </span>
                <div className="flex items-center justify-center gap-2 text-white font-mono font-bold">
                  <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-center min-w-[36px]">
                    <span className="text-sm text-amber-300">{timeData.hours}</span>
                    <span className="block text-[8px] text-slate-500 font-sans">HRS</span>
                  </div>
                  <span className="text-slate-600">:</span>
                  <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-center min-w-[36px]">
                    <span className="text-sm text-amber-300">{timeData.minutes}</span>
                    <span className="block text-[8px] text-slate-500 font-sans">MIN</span>
                  </div>
                  <span className="text-slate-600">:</span>
                  <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-center min-w-[36px]">
                    <span className="text-sm text-amber-300">{timeData.seconds}</span>
                    <span className="block text-[8px] text-slate-500 font-sans">SEC</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Action Button */}
          <div className="flex flex-col justify-center">
            <button
              id="claim-daily-bonus-btn"
              onClick={handleClaim}
              disabled={!canClaim}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                canClaim
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 cursor-pointer active:scale-98'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-90'
              }`}
            >
              {canClaim ? (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Claim $0.01 Free Bonus</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Claimed (Available in 24h)</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> 24h Cycle
              </span>
              <span>{!canClaim ? `Unlocks in ${timeData.formatted}` : '1 Claim / Day'}</span>
            </div>
          </div>
        </div>

        {/* In-Card Toast / Feedback */}
        {toastMessage && (
          <div className="relative z-10 mt-3.5 p-2.5 rounded-xl text-xs flex items-center gap-2 border bg-emerald-950/80 border-emerald-800/60 text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug font-semibold">{toastMessage}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default DailyBonusCard;
