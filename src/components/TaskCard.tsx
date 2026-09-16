import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Clock,
  Users,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Play,
  Coins,
  CheckSquare,
  CheckCircle2,
} from 'lucide-react';
import type { Task } from '../types';
import { getTaskCooldownStatus, type TaskCooldownStatus } from '../lib/taskLockUtils';
import { useAuth } from '../context/AuthContext';

interface TaskCardProps {
  task: Task;
  onStartTask: (task: Task) => void;
  isLoggedIn?: boolean;
  compact?: boolean;
  isCompleted?: boolean;
}

// Helper to extract URLs from text or explicit task.targetUrl
export function extractTaskTargetUrl(task: Task): string | null {
  // 1. If task has an explicit targetUrl provided when published
  if (task.targetUrl && typeof task.targetUrl === 'string' && task.targetUrl.trim().startsWith('http')) {
    const trimmed = task.targetUrl.trim();
    if (!trimmed.includes('offerpath.xyz')) {
      return trimmed;
    }
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // 2. Search in description for an explicit link
  if (task.description) {
    const descMatches = task.description.match(urlRegex);
    if (descMatches && descMatches.length > 0) {
      const found = descMatches[0].replace(/[),;.]+$/, '');
      if (found.startsWith('http') && !found.includes('offerpath.xyz')) {
        return found;
      }
    }
  }

  // 3. Search in instructions for an explicit link
  if (task.instructions && Array.isArray(task.instructions)) {
    for (const inst of task.instructions) {
      const instMatches = inst.match(urlRegex);
      if (instMatches && instMatches.length > 0) {
        const found = instMatches[0].replace(/[),;.]+$/, '');
        if (found.startsWith('http') && !found.includes('offerpath.xyz')) {
          return found;
        }
      }
    }
  }

  return null;
}

// Parse multi-step text into clean items
export function parseTaskSteps(description: string): string[] {
  if (!description) return [];

  // If description contains newline-separated numbered steps
  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines;
  }

  // If single line with "১.", "২.", "1.", "2."
  const splitByNumbers = description.split(/(?=[১-৯\d]\.\s*)/g).map((s) => s.trim()).filter(Boolean);
  if (splitByNumbers.length > 1) {
    return splitByNumbers;
  }

  return [description];
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStartTask,
  isLoggedIn = true,
  compact = true,
  isCompleted: propIsCompleted,
}) => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [cooldown, setCooldown] = useState<TaskCooldownStatus>(() => {
    return getTaskCooldownStatus(task.id, user?.id, task.completedAt, task.cooldownUntil);
  });

  const isLocked = Boolean(propIsCompleted || cooldown.isLocked);

  useEffect(() => {
    const updateCooldown = () => {
      setCooldown(getTaskCooldownStatus(task.id, user?.id, task.completedAt, task.cooldownUntil));
    };
    updateCooldown();

    // Live countdown timer running every 1 second: auto-unlocks when remaining hits 0
    const interval = setInterval(updateCooldown, 1000);

    const handleLockEvent = (e: any) => {
      if (e?.detail?.taskId === task.id) {
        setCooldown(getTaskCooldownStatus(task.id, user?.id, e?.detail?.completedAt, e?.detail?.cooldownUntil));
      }
    };

    const handleUnlockEvent = (e: any) => {
      if (e?.detail?.taskId === task.id) {
        setCooldown(getTaskCooldownStatus(task.id, user?.id));
      }
    };

    window.addEventListener('nexvora_task_locked', handleLockEvent);
    window.addEventListener('nexvora_task_unlocked', handleUnlockEvent);
    window.addEventListener('storage', updateCooldown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('nexvora_task_locked', handleLockEvent);
      window.removeEventListener('nexvora_task_unlocked', handleUnlockEvent);
      window.removeEventListener('storage', updateCooldown);
    };
  }, [task.id, task.completedAt, task.cooldownUntil, user?.id, propIsCompleted]);

  const targetUrl = extractTaskTargetUrl(task);
  const steps = parseTaskSteps(task.description);
  const percentRemaining = Math.max(0, Math.min(100, (task.slotsRemaining / task.totalSlots) * 100));
  const rewardCoins = task.rewardCoins || Math.round(task.rewardAmount * 1000);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // -------------------------------------------------------------
  // 1. COMPACT FEED CARD (DEFAULT ON FEED)
  // Displays only: Category, Reward ($0.01 / 10 Coins), Task Title,
  // Slots Remaining, and a single prominent "Start Task / কাজ করুন" button.
  // Hides long instructions, target URLs, and proof details.
  // -------------------------------------------------------------
  if (compact) {
    return (
      <div
        id={`task-card-compact-${task.id}`}
        onClick={() => {
          if (!isLocked) {
            onStartTask(task);
          }
        }}
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3.5 relative overflow-hidden group ${
          isLocked
            ? 'bg-slate-900/60 border-slate-800/80 opacity-80 cursor-not-allowed'
            : 'bg-slate-900/95 border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-950/40 cursor-pointer'
        }`}
      >
        {/* Ambient Subtle Accent Glow */}
        {!isLocked && (
          <>
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/5 rounded-full blur-2xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none -z-0" />
          </>
        )}

        <div className="space-y-2.5 z-10">
          {/* Top Row: Category Badge & Reward Badge */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-800 text-cyan-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {task.category || 'Microtask'}
              </span>

              {isLocked ? (
                <span className="px-2 py-0.5 rounded-lg bg-amber-950/90 border border-amber-600/70 text-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                  {cooldown.hours > 0 ? `${cooldown.hours}h ${cooldown.minutes}m` : `${cooldown.minutes}m ${cooldown.seconds}s`}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Escrow
                </span>
              )}
            </div>

            {/* Reward ($0.01 / 10 Coins) */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-emerald-900/60 shadow-sm">
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tracking-tight">
                ${task.rewardAmount.toFixed(2)}
              </span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {rewardCoins} Coins
              </span>
              <span className="text-[10px] font-bold text-emerald-500/90 hidden sm:inline">
                (≈ ৳{(task.rewardAmount * 120).toFixed(0)})
              </span>
            </div>
          </div>

          {/* Task Title */}
          <h3 className={`text-base sm:text-lg font-bold font-['Space_Grotesk'] leading-snug line-clamp-2 pt-0.5 transition-colors ${
            isLocked ? 'text-slate-400 line-through decoration-slate-600' : 'text-white group-hover:text-cyan-300'
          }`}>
            {task.title}
          </h3>
        </div>

        {/* Bottom Section: Slots Remaining & Action Button */}
        <div className="space-y-3 z-10 pt-1">
          {/* Slots remaining & mini progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300 font-medium text-[11px] sm:text-xs">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {task.slotsRemaining} / {task.totalSlots} স্লট বাকি (Slots)
              </span>
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                ~{task.timeLimitMinutes || 30} mins
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentRemaining > 30
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                    : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
                style={{ width: `${percentRemaining}%` }}
              />
            </div>
          </div>

          {/* Single prominent button: Live 5-Hour Cooldown or Start Task */}
          {isLocked ? (
            <div className="space-y-1 w-full">
              <button
                id={`cooldown-task-btn-${task.id}`}
                type="button"
                disabled
                className="w-full py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-slate-800/95 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-not-allowed opacity-95 shadow-inner"
                title={cooldown.formattedBn}
              >
                <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span className="truncate">{cooldown.formattedEn || 'Available again in: 5h 0m'}</span>
              </button>
              {cooldown.formattedBn && (
                <p className="text-[10px] text-amber-400/90 text-center font-medium truncate">
                  {cooldown.formattedBn}
                </p>
              )}
            </div>
          ) : (
            <button
              id={`start-task-btn-${task.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartTask(task);
              }}
              disabled={task.slotsRemaining <= 0}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/80 transition-all cursor-pointer active:scale-[0.99] border border-emerald-400/30 group/btn"
            >
              <Play className="w-3.5 h-3.5 text-white fill-current transition-transform group-hover/btn:scale-110" />
              <span>Start Task / কাজ শুরু করুন</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-200" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. FULL DETAILED CARD VIEW (Optional if used directly in full-page views)
  // -------------------------------------------------------------
  const proofText =
    task.instructions && task.instructions.length > 0
      ? task.instructions.join(' ')
      : 'ভেরিফিকেশন সম্পূর্ণ করার পর প্রাপ্ত সিক্রেট কোড (PCode) বা স্ক্রিনশট প্রুফ বক্সে লিখে সাবমিট করুন।';

  return (
    <div
      id={`task-card-full-${task.id}`}
      className="p-5 sm:p-7 rounded-3xl bg-slate-900/95 border border-slate-800 hover:border-cyan-500/50 shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* TOP HEADER */}
      <div className="space-y-3 z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-cyan-950/90 border border-cyan-800 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {task.category || 'Microtask'}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Escrow Verified Payout
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{task.timeLimitMinutes || 30} mins
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk'] leading-snug tracking-tight pt-1">
              {task.title}
            </h3>
          </div>

          <div className="sm:text-right shrink-0 p-3 sm:p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-900/60 shadow-lg flex sm:flex-col items-center sm:items-end justify-between gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              টাস্ক রিওয়ার্ড / Payout
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                ${task.rewardAmount.toFixed(2)}
              </span>
              <span className="text-xs text-emerald-300 font-semibold font-mono">USD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {rewardCoins} Coins
              </span>
              <span className="text-xs font-bold text-emerald-500/90 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
                ≈ ৳{(task.rewardAmount * 120).toFixed(0)} BDT
              </span>
            </div>
          </div>
        </div>

        {/* TARGET WORK URL */}
        {targetUrl && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-950 to-teal-950/60 border border-cyan-800/60 shadow-inner space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                    অফিশিয়াল কাজের লিঙ্ক / Target Work URL:
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono truncate max-w-md">
                  {targetUrl}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy Link"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenLink}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900/80 transition-all cursor-pointer border border-cyan-300/30 group/btn"
                >
                  <span className="text-sm sm:text-base">👉</span>
                  <span>ওপেন কাজের লিংক / Open Task Link</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP-BY-STEP INSTRUCTIONS */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            কাজ সম্পন্ন করার নিয়ম ও ধাপসমূহ / Step-by-Step Instructions:
          </span>

          <div className="space-y-2.5">
            {steps.map((step, idx) => {
              const cleanStepText = step.replace(/^[১-৯\d]+[\.\:\-]\s*/, '');
              const stepNumber = idx + 1;
              const bengaliNumbers = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
              const bnNum = bengaliNumbers[idx] || `${stepNumber}`;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 flex items-start gap-3 transition-colors text-xs sm:text-sm"
                >
                  <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-mono">
                    {bnNum}
                  </span>
                  <div className="text-slate-200 leading-relaxed font-medium break-words space-y-1">
                    <p className="whitespace-pre-line">{cleanStepText}</p>
                    {targetUrl && step.includes('http') && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleOpenLink}
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold text-xs underline cursor-pointer"
                        >
                          <span>লিংক ওপেন করতে এখানে ক্লিক করুন (Click to open)</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROOF REQUIREMENT */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/70 text-amber-200 text-xs sm:text-sm space-y-1.5 shadow-md">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>প্রমাণ জমা নির্দেশিকা / Proof Requirement:</span>
          </div>
          <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed pl-6 font-medium">
            {proofText}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="space-y-3.5 pt-3 border-t border-slate-800/90 z-10">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              কাজের স্লট / Slots Available:
            </span>
            <span className="font-mono font-bold text-slate-200">
              {task.slotsRemaining} / {task.totalSlots} স্লট বাকি (Remaining)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentRemaining > 30
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>

        {isLocked ? (
          <div className="space-y-1.5 w-full">
            <button
              id={`cooldown-task-btn-${task.id}`}
              type="button"
              disabled
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-800/95 border border-amber-500/40 text-amber-300 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-not-allowed opacity-95 shadow-inner"
            >
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <span>{cooldown.formattedEn || 'Available again in: 5h 0m'}</span>
            </button>
            {cooldown.formattedBn && (
              <p className="text-xs text-amber-400/90 text-center font-medium">
                {cooldown.formattedBn}
              </p>
            )}
          </div>
        ) : (
          <button
            id={`start-task-btn-${task.id}`}
            type="button"
            onClick={() => onStartTask(task)}
            disabled={task.slotsRemaining <= 0}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 hover:shadow-emerald-900/80 transition-all cursor-pointer active:scale-[0.99] border border-emerald-400/30 group/btn"
          >
            <Play className="w-4 h-4 text-white fill-current transition-transform group-hover/btn:scale-110" />
            <span>Start Task / কাজ শুরু করুন</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-200" />
          </button>
        )}
      </div>
    </div>
  );
};
