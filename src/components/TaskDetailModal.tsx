import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  ShieldCheck,
  ShieldAlert,
  Send,
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckSquare,
  ArrowUpRight,
  Coins,
} from 'lucide-react';
import type { Task } from '../types';
import { extractTaskTargetUrl, parseTaskSteps } from './TaskCard';
import { useAuth } from '../context/AuthContext';
import { getTaskCooldownStatus, type TaskCooldownStatus, markTaskAsCompleted } from '../lib/taskLockUtils';

export interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onSuccessSubmit?: () => void;
  isLoggedIn?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onSuccessSubmit,
  isLoggedIn = true,
}) => {
  const { user, apiFetch } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const [screenshotFileSize, setScreenshotFileSize] = useState('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [cooldown, setCooldown] = useState<TaskCooldownStatus>(() => {
    if (!task) {
      return {
        isLocked: false,
        remainingMs: 0,
        completedAt: null,
        cooldownUntil: null,
        hours: 0,
        minutes: 0,
        seconds: 0,
        formattedEn: '',
        formattedBn: '',
      };
    }
    return getTaskCooldownStatus(task.id, user?.id, task.completedAt, task.cooldownUntil);
  });

  const isLocked = cooldown.isLocked;

  useEffect(() => {
    if (!task) return;

    const updateCooldown = () => {
      setCooldown(getTaskCooldownStatus(task.id, user?.id, task.completedAt, task.cooldownUntil));
    };
    updateCooldown();

    // 1-second interval live countdown
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
  }, [task?.id, task?.completedAt, task?.cooldownUntil, user?.id]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [task]);

  if (!task) return null;

  const targetUrl = extractTaskTargetUrl(task);
  const steps = parseTaskSteps(task.description);
  const percentRemaining = Math.max(0, Math.min(100, (task.slotsRemaining / task.totalSlots) * 100));
  const rewardCoins = task.rewardCoins || Math.round(task.rewardAmount * 1000);

  const handleCopyLink = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenLink = () => {
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file (PNG, JPG, WEBP) / সঠিক ছবি ফাইল নির্বাচন করুন।'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file / ছবি রিড করতে ব্যর্থ হয়েছে।'));
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
          reject(new Error('Image conversion failed / ছবি রূপান্তর ব্যর্থ হয়েছে।'));
          return;
        }

        if (file.size < 600 * 1024) {
          resolve(result);
          return;
        }

        const img = new Image();
        img.onerror = () => resolve(result);
        img.onload = () => {
          try {
            const maxDim = 1600;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(result);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const compressedData = canvas.toDataURL('image/jpeg', 0.85);
            resolve(compressedData);
          } catch {
            resolve(result);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImg(true);
      setSubmitMsg(null);
      const dataUri = await processImageFile(file);
      setScreenshotUrl(dataUri);
      setScreenshotFileName(file.name);
      setScreenshotFileSize(formatFileSize(file.size));
    } catch (err: any) {
      setSubmitMsg({ type: 'error', text: err.message || 'Error processing image.' });
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotUrl('');
    setScreenshotFileName('');
    setScreenshotFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    if (isLocked) {
      setSubmitMsg({
        type: 'error',
        text: 'You have already submitted proof for this task. Duplicate submissions are not allowed / কাজটির প্রমাণ ইতিপূর্বে জমা দেওয়া হয়েছে।',
      });
      return;
    }

    setSubmitLoading(true);
    setSubmitMsg(null);
    try {
      const res = await apiFetch(`/api/tasks/${task.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          textNotes: proofText,
          screenshotUrl,
          proofUrl,
        }),
      });

      // Persist 5-hour cooldown lock locally immediately to preserve accurate timer across page refreshes
      const completedAt = res?.completedAt || new Date().toISOString();
      const cooldownUntil = res?.cooldownUntil || new Date(Date.now() + 5 * 3600 * 1000).toISOString();
      markTaskAsCompleted(task.id, user?.id, completedAt, cooldownUntil);

      setSubmitMsg({
        type: 'success',
        text: 'টাস্কের প্রমাণ সফলভাবে জমা হয়েছে! ৫ ঘণ্টার কুলডাউনের পর আবার কাজটি জমা দেওয়া যাবে।',
      });
      setProofText('');
      setScreenshotUrl('');
      setProofUrl('');

      if (onSuccessSubmit) {
        onSuccessSubmit();
      }

      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      if (err.completedAt || err.cooldownUntil || (err.message && (err.message.includes('already submitted') || err.message.includes('cooldown')))) {
        markTaskAsCompleted(task.id, user?.id, err.completedAt, err.cooldownUntil);
      }
      setSubmitMsg({
        type: 'error',
        text: err.message || 'প্রমাণ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div
      id="task-detail-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      {/* Modal Container */}
      <div
        id="task-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* MODAL HEADER: Title, Badges, Reward & Close (X) button */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800/90 bg-gradient-to-b from-slate-850 to-slate-900 flex items-start justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {task.category || 'Microtask'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                100% Escrow Protected
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{task.timeLimitMinutes || 30} mins
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk'] leading-snug tracking-tight">
              {task.title}
            </h3>
          </div>

          {/* Reward and Close Button */}
          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right p-2.5 sm:p-3 rounded-2xl bg-slate-950/90 border border-emerald-900/60 shadow-inner">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                রিওয়ার্ড / Reward
              </span>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">
                  ${task.rewardAmount.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-300 font-semibold font-mono">USD</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  +{rewardCoins} Coins
                </span>
                <span className="text-[10px] font-bold text-emerald-500/90">
                  ≈ ৳{(task.rewardAmount * 120).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Smooth Close (X) Button */}
            <button
              id="close-task-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/80"
              title="বন্ধ করুন / Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* TASK 5-HOUR COOLDOWN LOCK BANNER */}
          {isLocked && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/70 border border-amber-600/80 shadow-lg flex items-start gap-3.5">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-amber-300">
                    কাজটি ৫ ঘণ্টার জন্য লক রয়েছে / 5-Hour Cooldown
                  </h4>
                  <span className="px-2.5 py-1 rounded-full bg-amber-900/90 text-amber-200 font-mono text-xs font-bold border border-amber-700 shadow-sm">
                    {cooldown.formattedEn || 'Available again in: 5h 0m'}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  আপনি ইতিপূর্বে এই কাজের প্রমাণ জমা দিয়েছেন। সাবমিট করার পর থেকে ৫ ঘণ্টা কুলডাউন সক্রিয় থাকে। ৫ ঘণ্টা পর স্বয়ংক্রিয়ভাবে লক খুলে যাবে এবং আপনি পুনরায় কাজটি সম্পন্ন করতে পারবেন।
                </p>
                {cooldown.formattedBn && (
                  <p className="text-xs font-semibold text-amber-300">
                    {cooldown.formattedBn}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 1. TARGET WORK URL SECTION (TERABOX / ADVERTISER LINK) */}
          {targetUrl ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-950 to-teal-950/70 border border-cyan-700/60 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wide">
                      কাজের অফিশিয়াল লিঙ্ক / Target Work URL:
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-mono truncate max-w-md bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                    {targetUrl}
                  </p>
                </div>

                {/* Direct Action Buttons */}
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
                    <span className="text-base">👉</span>
                    <span>ওপেন কাজের লিংক / Open Task Link</span>
                    <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* 2. TASK OVERVIEW DESCRIPTION */}
          {task.description && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                বিবরণ / Overview:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {task.description}
              </p>
            </div>
          )}

          {/* 3. STEP-BY-STEP INSTRUCTIONS */}
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              কাজ সম্পন্ন করার নিয়ম ও ধাপসমূহ / Step-by-Step Instructions:
            </span>

            <div className="space-y-2.5">
              {(task.instructions && task.instructions.length > 0
                ? task.instructions
                : steps
              ).map((step, idx) => {
                const cleanStep = step.replace(/^[১-৯\d]+[\.\:\-]\s*/, '');
                const bengaliDigits = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'];
                const badge = bengaliDigits[idx] || `${idx + 1}`;

                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3 text-xs sm:text-sm hover:border-slate-700 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono shadow-sm">
                      {badge}
                    </span>
                    <div className="text-slate-200 leading-relaxed font-medium space-y-1 break-words flex-1">
                      <p className="whitespace-pre-line">{cleanStep}</p>
                      {targetUrl && cleanStep.includes('http') && (
                        <button
                          type="button"
                          onClick={handleOpenLink}
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold text-xs underline cursor-pointer mt-1"
                        >
                          <span>লিংক ওপেন করতে এখানে ক্লিক করুন (Open Link)</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. PROOF REQUIREMENTS & GUIDANCE */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/70 text-amber-200 text-xs sm:text-sm space-y-2 shadow-md">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>প্রমাণ জমা দেওয়ার নিয়মাবলী / Proof Requirements:</span>
            </div>
            <p className="text-amber-100/90 leading-relaxed font-medium pl-6">
              {task.proofRequirements ||
                (task.instructions && task.instructions.length > 0
                  ? task.instructions.join(' ')
                  : 'ভেরিফিকেশন সম্পন্ন করে প্রাপ্ত সিক্রেট কোড (PCode) বা ভিডিও দেখার শেষ মুহূর্তের একটি পরিষ্কার স্ক্রিনশট আপলোড করুন।')}
            </p>
            <div className="pl-6 pt-1 flex items-center gap-2 text-[11px] text-amber-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>ভুল বা অসত্য প্রমাণ জমা দিলে সাবমিশন বাতিল হবে। সঠিক প্রমাণে সাথে সাথে ওয়ালেটে ডলার জমা হবে।</span>
            </div>
          </div>

          {/* Slots remaining reminder */}
          <div className="flex items-center justify-between text-xs text-slate-400 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              কাজের অবশিষ্ট স্লট:
            </span>
            <span className="font-mono font-bold text-slate-200">
              {task.slotsRemaining} / {task.totalSlots} স্লট বাকি (Remaining)
            </span>
          </div>

          {/* Feedback messages */}
          {submitMsg && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                submitMsg.type === 'success'
                  ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                  : 'bg-rose-950 border border-rose-700 text-rose-300'
              }`}
            >
              {submitMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              )}
              <span>{submitMsg.text}</span>
            </div>
          )}

          {/* 5. PROOF SUBMISSION FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="block text-white font-bold text-xs sm:text-sm">
                সিক্রেট কোড / কাজের প্রুফ নোট (Secret PCode & Proof Notes) <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="যেমন: PCode-98234, টেলিগ্রাম ইউজারনেম, বা সম্পন্নকরণের সংক্ষিপ্ত বিবরণ লিখুন..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-500 font-medium"
              />
            </div>

            {/* SCREENSHOT FILE UPLOAD */}
            <div className="space-y-2">
              <label className="block text-white font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>কাজের স্ক্রিনশট আপলোড করুন / Upload Screenshot from Gallery</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {screenshotUrl ? (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-700/80 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Screenshot Selected / ছবি যুক্ত হয়েছে</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove / মুছে ফেলুন</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black flex items-center justify-center">
                      <img
                        src={screenshotUrl}
                        alt="Screenshot Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-bold text-white truncate">
                        {screenshotFileName || 'screenshot_proof.png'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        File Size: <strong className="text-slate-300">{screenshotFileSize || 'Optimized'}</strong>
                      </p>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        ✓ Ready for instant submission
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/70 hover:bg-slate-950 transition-all flex flex-col items-center justify-center text-center space-y-2.5 cursor-pointer group"
                >
                  {isProcessingImg ? (
                    <div className="py-3 flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span className="text-xs font-semibold text-cyan-300">
                        Processing image...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">
                          Click to select screenshot from Gallery
                        </p>
                        <p className="text-[11px] text-slate-400">
                          গ্যালারি অথবা ক্যামেরা থেকে কাজের স্ক্রিনশট সিলেক্ট করুন (PNG, JPG, WEBP)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-950/50 transition cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Choose Image / ছবি নির্বাচন করুন</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Optional Public Verification URL */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold text-xs">
                পাবলিক ভেরিফিকেশন লিঙ্ক / Public Verification URL (Optional)
              </label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://... সংশ্লিষ্ট প্রুফ লিঙ্ক (যদি থাকে)"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs text-slate-400 leading-relaxed">
              আপনার সাবমিটকৃত প্রমাণ অটোমেটিক অডিট ও প্ল্যাটফর্ম মডারেশনের মাধ্যমে ভেরিফাই করা হবে। সঠিক হলে তাৎক্ষণিকভাবে{' '}
              <strong className="text-emerald-400 font-mono">${task.rewardAmount.toFixed(2)} USD (+{rewardCoins} Coins)</strong> আপনার ব্যালেন্সে যোগ হবে।
            </div>

            {/* MODAL ACTIONS: Cancel & "কাজ শুরু ও প্রমাণ জমা দিন / Submit Proof" Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
              >
                বন্ধ করুন / Cancel
              </button>
              {isLocked ? (
                <button
                  id="submit-task-proof-modal-btn"
                  type="button"
                  disabled
                  className="px-6 py-2.5 rounded-xl bg-slate-800/95 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-not-allowed opacity-95 shadow-inner"
                  title={cooldown.formattedBn}
                >
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{cooldown.formattedEn || 'Available again in: 5h 0m'}</span>
                </button>
              ) : (
                <button
                  id="submit-task-proof-modal-btn"
                  type="submit"
                  disabled={submitLoading || task.slotsRemaining <= 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all active:scale-95"
                >
                  {submitLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>যাচাই করা হচ্ছে / Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>কাজ শুরু ও প্রমাণ জমা দিন / Submit Proof</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
