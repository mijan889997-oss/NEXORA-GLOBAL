import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserBalance } from '../lib/userBalance';
import {
  Zap,
  Play,
  Share2,
  Calendar,
  History,
  ShieldCheck,
  Coins,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Lock,
  Eye,
  Check,
  Send,
  Upload,
  ChevronRight,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Camera,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import type { Task, DailyStreakStatus, TaskCompletionRecord, TaskSubmission } from '../types';

interface NativeTasksSectionProps {
  onRewardClaimed?: () => void;
}

export const NativeTasksSection: React.FC<NativeTasksSectionProps> = ({ onRewardClaimed }) => {
  const { user, wallet, refreshMe, apiFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'ptc' | 'youtube' | 'social' | 'daily' | 'history'>('ptc');

  // Tasks and Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyStreakStatus | null>(null);
  const [historyData, setHistoryData] = useState<{
    completions: TaskCompletionRecord[];
    submissions: TaskSubmission[];
    dailyClaims: any[];
    totalEarnedCoins: number;
  }>({
    completions: [],
    submissions: [],
    dailyClaims: [],
    totalEarnedCoins: 0,
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyClaimLoading, setDailyClaimLoading] = useState(false);
  const [dailyClaimMsg, setDailyClaimMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Video Task Dynamic Settings & Cooldown States
  const [videoSettings, setVideoSettings] = useState<{
    videoTaskLimit: number;
    videoTaskCooldown: number;
    videoTaskRewardCoins: number;
    videoRewardUsd: number;
  }>({
    videoTaskLimit: 10,
    videoTaskCooldown: 30,
    videoTaskRewardCoins: 5,
    videoRewardUsd: 0.005,
  });

  const [videoUserStatus, setVideoUserStatus] = useState<{
    todayVideosWatched: number;
    isLimitReached: boolean;
    remainingVideosToday: number;
    lastWatchedAt: string | null;
    remainingCooldownSeconds: number;
  }>({
    todayVideosWatched: 0,
    isLimitReached: false,
    remainingVideosToday: 10,
    lastWatchedAt: null,
    remainingCooldownSeconds: 0,
  });

  const [cooldownCountdown, setCooldownCountdown] = useState<number>(0);

  // Active Task Runner States (PTC & YouTube)
  const [activeRunnerTask, setActiveRunnerTask] = useState<Task | null>(null);
  const [runnerSessionToken, setRunnerSessionToken] = useState<string>('');
  const [runnerTimerSeconds, setRunnerTimerSeconds] = useState<number>(15);
  const [runnerTimeRemaining, setRunnerTimeRemaining] = useState<number>(15);
  const [runnerIsPaused, setRunnerIsPaused] = useState<boolean>(false);
  const [runnerIsCompleted, setRunnerIsCompleted] = useState<boolean>(false);
  const [runnerPuzzlePrompt, setRunnerPuzzlePrompt] = useState<string>('');
  const [runnerPuzzleAnswer, setRunnerPuzzleAnswer] = useState<string>('');
  const [runnerVerifying, setRunnerVerifying] = useState<boolean>(false);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const [runnerSuccessData, setRunnerSuccessData] = useState<{ coins: number; usd: number; msg: string } | null>(null);
  const [runnerTargetOpened, setRunnerTargetOpened] = useState<boolean>(false);

  // Social Proof Submission Modal States
  const [selectedSocialTask, setSelectedSocialTask] = useState<Task | null>(null);
  const [socialProofNotes, setSocialProofNotes] = useState<string>('');
  const [socialProofUrl, setSocialProofUrl] = useState<string>('');
  const [socialScreenshotUrl, setSocialScreenshotUrl] = useState<string>('');
  const [socialScreenshotFileName, setSocialScreenshotFileName] = useState<string>('');
  const [socialScreenshotFileSize, setSocialScreenshotFileSize] = useState<string>('');
  const [socialIsProcessingImg, setSocialIsProcessingImg] = useState<boolean>(false);
  const [socialSubmitting, setSocialSubmitting] = useState<boolean>(false);
  const [socialSubmitMsg, setSocialSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const socialFileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file (PNG, JPG, JPEG, WEBP) / অনুগ্রহ করে একটি ছবি নির্বাচন করুন।'));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('Image file is too large (maximum 15MB) / ফাইলের সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file from device / ডিভাইস থেকে ছবি পড়তে ব্যর্থ হয়েছে।'));
      reader.onload = (e) => {
        const result = e.target?.result as string;
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

  const handleSocialFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSocialIsProcessingImg(true);
      setSocialSubmitMsg(null);
      const dataUri = await processImageFile(file);
      setSocialScreenshotUrl(dataUri);
      setSocialScreenshotFileName(file.name);
      setSocialScreenshotFileSize(formatFileSize(file.size));
    } catch (err: any) {
      setSocialSubmitMsg({ type: 'error', text: err.message || 'Error loading image / ছবি লোড করতে সমস্যা হয়েছে।' });
    } finally {
      setSocialIsProcessingImg(false);
    }
  };

  const handleRemoveSocialScreenshot = () => {
    setSocialScreenshotUrl('');
    setSocialScreenshotFileName('');
    setSocialScreenshotFileSize('');
    if (socialFileInputRef.current) {
      socialFileInputRef.current.value = '';
    }
  };

  // Timer Ref for Anti-cheat
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const runnerStartTimeRef = useRef<number>(0);

  // Load Video Settings & Cooldown Status
  const loadVideoSettings = async () => {
    try {
      const res = await apiFetch('/api/tasks/video-settings');
      if (res?.settings) {
        setVideoSettings({
          videoTaskLimit: Number(res.settings.videoTaskLimit ?? 10),
          videoTaskCooldown: Number(res.settings.videoTaskCooldown ?? 30),
          videoTaskRewardCoins: Number(res.settings.videoTaskRewardCoins ?? 5),
          videoRewardUsd: Number(res.settings.videoRewardUsd ?? 0.005),
        });
      }
      if (res?.userStatus) {
        setVideoUserStatus(res.userStatus);
        if (res.userStatus.remainingCooldownSeconds > 0) {
          setCooldownCountdown(res.userStatus.remainingCooldownSeconds);
        } else {
          setCooldownCountdown(0);
        }
      }
    } catch (err) {
      console.error('Failed to load video settings:', err);
    }
  };

  // Cooldown countdown loop
  useEffect(() => {
    if (cooldownCountdown <= 0) return;

    const interval = setInterval(() => {
      setCooldownCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          loadVideoSettings();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownCountdown]);

  // Listen for admin settings updates in real time
  useEffect(() => {
    const handleUpdate = () => {
      loadVideoSettings();
      loadTasksData();
    };
    window.addEventListener('videoSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('videoSettingsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Load All Tasks and Daily Status
  const loadTasksData = async () => {
    try {
      setLoading(true);
      const [tasksRes, dailyRes, historyRes] = await Promise.all([
        apiFetch('/api/tasks'),
        apiFetch('/api/tasks/daily-status'),
        apiFetch('/api/tasks/my-history'),
        loadVideoSettings(),
      ]);

      if (tasksRes?.tasks) {
        setTasks(tasksRes.tasks);
      }
      if (dailyRes) {
        setDailyStatus(dailyRes);
      }
      if (historyRes) {
        setHistoryData(historyRes);
      }
    } catch (err) {
      console.error('Failed to load native tasks data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasksData();
  }, []);

  // Filter Tasks by Category
  const ptcTasks = tasks.filter((t) => t.category?.includes('PTC') || t.verificationType === 'instant_timer');
  const youtubeTasks = tasks.filter((t) => t.category?.includes('YouTube') || t.verificationType === 'youtube_watch');
  const socialTasks = tasks.filter(
    (t) =>
      t.category?.includes('Social') ||
      t.category?.includes('App') ||
      t.category?.includes('Micro') ||
      t.verificationType === 'screenshot_and_text' ||
      t.verificationType === 'link_submission'
  );

  // Focus and Visibility Detection (Anti-Cheat)
  useEffect(() => {
    if (!activeRunnerTask || runnerIsCompleted || runnerSuccessData) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setRunnerIsPaused(true);
      } else {
        setRunnerIsPaused(false);
      }
    };

    const handleBlur = () => {
      setRunnerIsPaused(true);
    };

    const handleFocus = () => {
      setRunnerIsPaused(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeRunnerTask, runnerIsCompleted, runnerSuccessData]);

  // Active Runner Countdown Loop
  useEffect(() => {
    if (!activeRunnerTask || runnerIsPaused || runnerIsCompleted || runnerSuccessData) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setRunnerTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setRunnerIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeRunnerTask, runnerIsPaused, runnerIsCompleted, runnerSuccessData]);

  // Start PTC or YouTube Video Task
  const handleStartRunnerTask = async (task: Task) => {
    setRunnerError(null);
    setRunnerSuccessData(null);
    setRunnerPuzzleAnswer('');
    setRunnerIsCompleted(false);
    setRunnerIsPaused(false);
    setRunnerTargetOpened(false);

    const isVideo = task.category?.includes('YouTube') || task.verificationType === 'youtube_watch';
    if (isVideo) {
      if (videoUserStatus.isLimitReached || videoUserStatus.todayVideosWatched >= videoSettings.videoTaskLimit) {
        alert(`Daily limit reached! You have watched ${videoUserStatus.todayVideosWatched}/${videoSettings.videoTaskLimit} videos today. Resets daily at 00:00 UTC.`);
        return;
      }
      if (cooldownCountdown > 0) {
        alert(`Cooldown active! Please wait ${cooldownCountdown}s before starting the next video.`);
        return;
      }
    }

    try {
      const res = await apiFetch('/api/tasks/start-timer', {
        method: 'POST',
        body: JSON.stringify({ taskId: task.id }),
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to start verified task session.');
      }

      setActiveRunnerTask(task);
      setRunnerSessionToken(res.sessionToken);
      setRunnerTimerSeconds(res.timerSeconds || task.timerSeconds || 15);
      setRunnerTimeRemaining(res.timerSeconds || task.timerSeconds || 15);
      setRunnerPuzzlePrompt(res.puzzle?.prompt || '5 + 3 = ?');
      runnerStartTimeRef.current = Date.now();

      // Open target URL automatically if available
      if (task.targetUrl) {
        window.open(task.targetUrl, '_blank', 'noopener,noreferrer');
        setRunnerTargetOpened(true);
      }
    } catch (err: any) {
      alert(err.message || 'Error initializing task session. Please try again.');
    }
  };

  // Verify and Claim Runner Task Reward
  const handleVerifyCompletion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeRunnerTask || !runnerSessionToken) return;

    if (!runnerPuzzleAnswer.trim()) {
      setRunnerError('Please enter the solution to the verification check.');
      return;
    }

    setRunnerVerifying(true);
    setRunnerError(null);

    try {
      const res = await apiFetch('/api/tasks/verify-completion', {
        method: 'POST',
        body: JSON.stringify({
          taskId: activeRunnerTask.id,
          sessionToken: runnerSessionToken,
          puzzleAnswer: Number(runnerPuzzleAnswer.trim()),
        }),
      });

      if (!res.success) {
        throw new Error(res.error || 'Verification failed.');
      }

      setRunnerSuccessData({
        coins: res.rewardCoins,
        usd: res.rewardUsd,
        msg: res.message,
      });

      // Update dynamic video stats and trigger cooldown if video task
      if (res.userVideoStats) {
        setVideoUserStatus(res.userVideoStats);
        if (res.userVideoStats.remainingCooldownSeconds > 0) {
          setCooldownCountdown(res.userVideoStats.remainingCooldownSeconds);
        }
      }

      // Refresh balances
      await refreshMe();
      await loadTasksData();
      if (onRewardClaimed) onRewardClaimed();
    } catch (err: any) {
      setRunnerError(err.message || 'Verification failed. Please check your math answer.');
    } finally {
      setRunnerVerifying(false);
    }
  };

  // Close Runner Modal
  const handleCloseRunnerModal = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setActiveRunnerTask(null);
    setRunnerSessionToken('');
    setRunnerSuccessData(null);
    setRunnerError(null);
    setRunnerIsCompleted(false);
  };

  // Claim Daily Check-in Streak
  const handleClaimDailyReward = async () => {
    setDailyClaimLoading(true);
    setDailyClaimMsg(null);

    try {
      const res = await apiFetch('/api/tasks/daily-claim', {
        method: 'POST',
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to claim daily reward.');
      }

      setDailyClaimMsg({
        type: 'success',
        text: res.message || `Claimed +${res.rewardCoins} Coins!`,
      });

      await refreshMe();
      await loadTasksData();
      if (onRewardClaimed) onRewardClaimed();
    } catch (err: any) {
      setDailyClaimMsg({
        type: 'error',
        text: err.message || 'Error claiming daily reward.',
      });
    } finally {
      setDailyClaimLoading(false);
    }
  };

  // Submit Social Task Proof
  const handleSubmitSocialProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocialTask) return;

    if (!socialProofNotes.trim() && !socialProofUrl.trim() && !socialScreenshotUrl.trim()) {
      setSocialSubmitMsg({
        type: 'error',
        text: 'Please provide at least a screenshot URL, proof link, or username note.',
      });
      return;
    }

    setSocialSubmitting(true);
    setSocialSubmitMsg(null);

    try {
      const res = await apiFetch(`/api/tasks/${selectedSocialTask.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          textNotes: socialProofNotes,
          proofUrl: socialProofUrl,
          screenshotUrl: socialScreenshotUrl,
        }),
      });

      if (res.error) {
        throw new Error(res.error);
      }

      setSocialSubmitMsg({
        type: 'success',
        text: res.message || 'Proof submitted successfully for verification review!',
      });

      setTimeout(() => {
        setSelectedSocialTask(null);
        setSocialProofNotes('');
        setSocialProofUrl('');
        setSocialScreenshotUrl('');
        setSocialSubmitMsg(null);
        loadTasksData();
      }, 2000);
    } catch (err: any) {
      setSocialSubmitMsg({
        type: 'error',
        text: err.message || 'Failed to submit proof.',
      });
    } finally {
      setSocialSubmitting(false);
    }
  };

  const {
    points: userCoins,
    formattedUsd: liveFormattedUsd,
  } = useUserBalance();

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Ledger Status Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Native & Anti-Cheat Verified
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-[11px] font-semibold">
                Direct Ledger Payouts
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              Native Task & Earning Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete instant Paid-to-Click website visits, YouTube video watch tasks, social microtasks, and claim your
              daily 7-day streak rewards. Earnings credit directly to your ledger.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/90 shadow-inner">
            <div className="px-3 py-1.5 border-r border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Available Coins
              </span>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-['Space_Grotesk'] text-lg">
                <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{userCoins.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-normal">(${liveFormattedUsd})</span>
              </div>
            </div>

            <div className="px-3 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Rate & Threshold
              </span>
              <div className="text-xs font-semibold text-emerald-400 font-['Space_Grotesk']">
                1,000 Coins = $1.00 USD <span className="text-slate-400 font-normal">(Min $25.00)</span>
              </div>
            </div>

            <button
              onClick={() => {
                setRefreshing(true);
                loadTasksData();
              }}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Refresh Tasks & Ledger"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 scrollbar-none">
          <button
            onClick={() => setActiveTab('ptc')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ptc'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>PTC Website Visits</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800">
              {ptcTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'youtube'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80'
            }`}
          >
            <Play className="w-4 h-4 text-rose-400" />
            <span>YouTube Video Tasks</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-mono border border-rose-800">
              {youtubeTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'social'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80'
            }`}
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Social & Micro Tasks</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-800">
              {socialTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Daily 7-Day Streak</span>
            {dailyStatus?.canClaimToday && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>My Task History & Ledger</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: PTC (PAID-TO-CLICK) WEBSITE VISITS
          ======================================================== */}
      {activeTab === 'ptc' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>How it works:</strong> Click Start Visit, keep the tab open for the sandboxed countdown timer (15s–60s),
                solve the simple math check, and get instant coin credit!
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800 self-start sm:self-auto">
              15s = 15 Coins • 30s = 30 Coins • 60s = 60 Coins
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
              <p className="text-xs">Loading verified website visit tasks...</p>
            </div>
          ) : ptcTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
              <Zap className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-white text-sm">No PTC tasks available right now</p>
              <p className="text-xs text-slate-500">Check back shortly or explore the YouTube and Social modules!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ptcTasks.map((task) => {
                const rewardCoins = task.rewardCoins || Math.round((task.rewardAmount || 0.015) * 1000);
                const rewardUsd = task.rewardAmount || rewardCoins / 1000;
                const timerSec = task.timerSeconds || 15;
                const isCompleted = task.userCompleted;

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-3xl bg-slate-900 border transition-all duration-200 flex flex-col justify-between ${
                      isCompleted
                        ? 'border-emerald-900/50 bg-slate-900/60 opacity-80'
                        : 'border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/20'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                            PTC Visit
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" /> {timerSec}s Timer
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-400 font-bold font-['Space_Grotesk'] text-base">
                            <Coins className="w-3.5 h-3.5" /> +{rewardCoins} Coins
                          </div>
                          <span className="text-[10px] text-slate-400">(${rewardUsd.toFixed(3)} USD)</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm leading-snug">{task.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Slots: <strong className="text-slate-200">{task.slotsRemaining} / {task.totalSlots}</strong></span>
                        <span className="text-emerald-400 font-medium">Instant Coin Credit</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      {isCompleted ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Already Completed & Paid
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartRunnerTask(task)}
                          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 transition-all active:scale-[0.99]"
                        >
                          <Zap className="w-4 h-4" /> Start Visit Task ({timerSec}s • +{rewardCoins} Coins)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: YOUTUBE VIDEO WATCH TASKS
          ======================================================== */}
      {activeTab === 'youtube' && (
        <div className="space-y-4">
          {/* Dynamic Video Settings & User Status Panel */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-rose-500/20 shadow-lg shadow-rose-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>YouTube Watch Earning</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      +{videoSettings.videoTaskRewardCoins} Coins / Video
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Watch sponsor videos without skipping. Real-time timer and anti-cheat verification secure your coins!
                  </p>
                </div>
              </div>

              {/* Live Cooldown or Status Tag */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {cooldownCountdown > 0 ? (
                  <div className="px-3.5 py-1.5 rounded-2xl bg-amber-950/90 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/40 animate-pulse">
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Cooldown: {cooldownCountdown}s remaining</span>
                  </div>
                ) : videoUserStatus.isLimitReached || videoUserStatus.todayVideosWatched >= videoSettings.videoTaskLimit ? (
                  <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Daily Limit Reached</span>
                  </div>
                ) : (
                  <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Ready to Watch</span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Limit Progress Bar & Stat Chips */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Daily Limit Card */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Daily Video Limit
                  </span>
                  <span className="font-bold text-white font-mono">
                    {videoUserStatus.todayVideosWatched} / {videoSettings.videoTaskLimit} Videos
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      videoUserStatus.todayVideosWatched >= videoSettings.videoTaskLimit
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((videoUserStatus.todayVideosWatched / (videoSettings.videoTaskLimit || 1)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{videoUserStatus.remainingVideosToday} video{videoUserStatus.remainingVideosToday === 1 ? '' : 's'} remaining today</span>
                  <span>Resets daily at 00:00 UTC</span>
                </div>
              </div>

              {/* Cooldown Info Card */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Cooldown Timer
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-white">
                    {videoSettings.videoTaskCooldown}s per view
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    +${videoSettings.videoRewardUsd.toFixed(3)} USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-400 mx-auto mb-2" />
              <p className="text-xs">Loading video watch tasks...</p>
            </div>
          ) : youtubeTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
              <Play className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-white text-sm">No video watch tasks currently active</p>
              <p className="text-xs text-slate-500">More videos are added daily by verified sponsors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {youtubeTasks.map((task) => {
                const rewardCoins = videoSettings.videoTaskRewardCoins || task.rewardCoins || 5;
                const rewardUsd = task.rewardAmount || rewardCoins / 1000;
                const timerSec = task.timerSeconds || 30;
                const isCompleted = task.userCompleted;
                const isLimitReached = videoUserStatus.isLimitReached || videoUserStatus.todayVideosWatched >= videoSettings.videoTaskLimit;
                const isCooldownActive = cooldownCountdown > 0;

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-3xl bg-slate-900 border transition-all duration-200 flex flex-col justify-between ${
                      isCompleted
                        ? 'border-emerald-900/50 bg-slate-900/60 opacity-80'
                        : isLimitReached || isCooldownActive
                        ? 'border-slate-800/80 bg-slate-900/80'
                        : 'border-slate-800 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-950/20'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                            YouTube Video
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-400" /> {timerSec}s Watch
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-400 font-bold font-['Space_Grotesk'] text-base">
                            <Coins className="w-3.5 h-3.5" /> +{rewardCoins} Coins
                          </div>
                          <span className="text-[10px] text-slate-400">(${rewardUsd.toFixed(3)} USD)</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm leading-snug">{task.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Slots: <strong className="text-slate-200">{task.slotsRemaining} / {task.totalSlots}</strong></span>
                        <span className="text-rose-400 font-medium">Sandboxed Stream</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      {isCompleted ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Video Completed & Credited
                        </button>
                      ) : isLimitReached ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-2xl bg-slate-950 text-slate-500 border border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                          title="Daily limit reached. Resets at 00:00 UTC."
                        >
                          <AlertCircle className="w-4 h-4 text-rose-500" /> Daily Limit Reached ({videoUserStatus.todayVideosWatched}/{videoSettings.videoTaskLimit})
                        </button>
                      ) : isCooldownActive ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-800/60 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed animate-pulse"
                        >
                          <Clock className="w-4 h-4 text-amber-400 animate-spin" /> Cooldown Active ({cooldownCountdown}s)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartRunnerTask(task)}
                          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-950/40 transition-all active:scale-[0.99] cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" /> Watch & Earn ({timerSec}s • +{rewardCoins} Coins)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: SOCIAL & MICRO TASKS (PROOF SUBMISSION)
          ======================================================== */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span>
                <strong>Social & Community Tasks:</strong> Join official channels, follow socials, share announcements,
                and submit your screenshot or username proof for high coin payouts (100–250 Coins).
              </span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800 self-start sm:self-auto">
              Reviewed in 1–2 Hours
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-2" />
              <p className="text-xs">Loading social tasks...</p>
            </div>
          ) : socialTasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
              <Share2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-white text-sm">No social microtasks available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialTasks.map((task) => {
                const rewardCoins = task.rewardCoins || Math.round((task.rewardAmount || 0.100) * 1000);
                const rewardUsd = task.rewardAmount || rewardCoins / 1000;
                const submissionStatus = (task as any).userSubmissionStatus;

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                          {task.category}
                        </span>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-400 font-bold font-['Space_Grotesk'] text-base">
                            <Coins className="w-3.5 h-3.5" /> +{rewardCoins} Coins
                          </div>
                          <span className="text-[10px] text-slate-400">(${rewardUsd.toFixed(2)} USD)</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm leading-snug">{task.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {task.instructions && task.instructions.length > 0 && (
                        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
                          <span className="text-slate-300 font-semibold block text-[10px] uppercase">
                            Steps to complete:
                          </span>
                          <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                            {task.instructions.slice(0, 2).map((ins, i) => (
                              <li key={i} className="line-clamp-1">{ins}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Slots: <strong className="text-slate-200">{task.slotsRemaining} / {task.totalSlots}</strong></span>
                        {task.targetUrl && (
                          <a
                            href={task.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                          >
                            Open Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      {submissionStatus === 'approved' ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approved & Paid (+{rewardCoins} Coins)
                        </button>
                      ) : submissionStatus === 'pending_review' ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-2xl bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <Clock className="w-4 h-4" /> Proof Under Review
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedSocialTask(task);
                            setSocialProofNotes('');
                            setSocialProofUrl('');
                            setSocialScreenshotUrl('');
                            setSocialSubmitMsg(null);
                          }}
                          className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-950/40 transition-all active:scale-[0.99]"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Proof of Work (+{rewardCoins} Coins)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: DAILY 7-DAY STREAK ROADMAP
          ======================================================== */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Daily 7-Day Streak Rewards
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Log in each day to claim escalating coin rewards. Complete a continuous 7-day streak to unlock the
                  75-Coin Jackpot milestone bonus!
                </p>
              </div>

              {dailyStatus && (
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Current Streak
                    </span>
                    <span className="text-lg font-bold text-amber-400 font-['Space_Grotesk']">
                      {dailyStatus.currentStreak} / 7 Days
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Total Streak Bonuses
                    </span>
                    <span className="text-lg font-bold text-emerald-400 font-['Space_Grotesk']">
                      {dailyStatus.totalClaimedCoins} Coins
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Visual 7-Day Roadmap */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {(dailyStatus?.streakDays || [
                { day: 1, coins: 10, usd: 0.01, bonusLabel: 'Day 1' },
                { day: 2, coins: 15, usd: 0.015, bonusLabel: 'Day 2' },
                { day: 3, coins: 20, usd: 0.02, bonusLabel: 'Day 3' },
                { day: 4, coins: 25, usd: 0.025, bonusLabel: 'Day 4' },
                { day: 5, coins: 30, usd: 0.03, bonusLabel: 'Day 5' },
                { day: 6, coins: 40, usd: 0.04, bonusLabel: 'Day 6' },
                { day: 7, coins: 75, usd: 0.075, isMilestone: true, bonusLabel: '🔥 Jackpot' },
              ]).map((item) => {
                const currentStreak = dailyStatus?.currentStreak || 0;
                const isPassed = item.day <= currentStreak;
                const isNext = dailyStatus?.canClaimToday
                  ? item.day === (currentStreak >= 7 ? 1 : currentStreak + 1)
                  : item.day === currentStreak;
                const isMilestone = item.day === 7;

                return (
                  <div
                    key={item.day}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col justify-between relative overflow-hidden ${
                      isPassed && !dailyStatus?.canClaimToday && item.day === currentStreak
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/20'
                        : isNext && dailyStatus?.canClaimToday
                        ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-950/50 ring-2 ring-amber-500/40 animate-pulse'
                        : isPassed
                        ? 'bg-slate-900 border-emerald-900/60 text-slate-400'
                        : isMilestone
                        ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-700/60'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    {isMilestone && (
                      <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                        7X
                      </span>
                    )}

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-400">
                        Day {item.day}
                      </span>
                      <div className="flex items-center justify-center gap-1 font-bold font-['Space_Grotesk'] text-base text-amber-400">
                        <Coins className="w-3.5 h-3.5" /> +{item.coins}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        ${item.usd.toFixed(3)}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60">
                      {isPassed && (!dailyStatus?.canClaimToday || item.day < (dailyStatus?.currentStreak || 0) + 1) ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <Check className="w-3 h-3" /> Claimed
                        </span>
                      ) : isNext && dailyStatus?.canClaimToday ? (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1-Click Claim Button & Status Feedback */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm">
                  {dailyStatus?.canClaimToday
                    ? `Ready to Claim: Day ${(dailyStatus?.currentStreak || 0) >= 7 ? 1 : (dailyStatus?.currentStreak || 0) + 1} Reward`
                    : `Streak Active! Next Check-in Available Tomorrow`}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dailyStatus?.canClaimToday
                    ? `Claim today's +${dailyStatus?.nextRewardCoins || 10} Coins ($${(dailyStatus?.nextRewardUsd || 0.01).toFixed(3)}) with 1 click.`
                    : `Your ${dailyStatus?.currentStreak || 1}-day streak is secured. Resets daily at 00:00 UTC.`}
                </p>
                {dailyClaimMsg && (
                  <p
                    className={`text-xs font-semibold mt-1.5 ${
                      dailyClaimMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {dailyClaimMsg.text}
                  </p>
                )}
              </div>

              <button
                onClick={handleClaimDailyReward}
                disabled={!dailyStatus?.canClaimToday || dailyClaimLoading}
                className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                  dailyStatus?.canClaimToday && !dailyClaimLoading
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-950/50 cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                {dailyClaimLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Claiming...
                  </>
                ) : dailyStatus?.canClaimToday ? (
                  <>
                    <Sparkles className="w-4 h-4" /> 1-Click Claim (+{dailyStatus?.nextRewardCoins || 10} Coins)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Claimed for Today
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: MY TASK HISTORY & LEDGER
          ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                My Task History & Direct Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Authoritative record of all verified PTC visits, YouTube watch rewards, social proofs, and daily check-in claims.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Total Native Earnings:</span>
              <strong className="text-amber-400 font-bold font-['Space_Grotesk']">
                {historyData.totalEarnedCoins.toLocaleString()} Coins
              </strong>
            </div>
          </div>

          {/* Completions & Submissions Table */}
          {historyData.completions.length === 0 && historyData.submissions.length === 0 && historyData.dailyClaims.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-bold text-white text-sm">No task earnings recorded yet</p>
              <p className="text-xs text-slate-500">
                Complete a PTC visit or watch a YouTube video to see your live double-entry ledger transactions.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3.5">Task / Activity</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Coins</th>
                      <th className="p-3.5">USD Value</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {/* Instant Completions */}
                    {historyData.completions.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-medium text-white flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{comp.taskTitle || 'Verified Native Task'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-semibold uppercase">
                            {comp.taskType || comp.taskCategory || 'Instant'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-amber-400 font-['Space_Grotesk']">
                          +{comp.rewardCoins}
                        </td>
                        <td className="p-3.5 text-emerald-400 font-medium">
                          ${comp.rewardUsd?.toFixed(3)}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                            Credited
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(comp.completedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {/* Proof Submissions */}
                    {historyData.submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-medium text-white flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{sub.taskTitle || 'Social / Micro Task Submission'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px] font-semibold uppercase">
                            Proof
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-amber-400 font-['Space_Grotesk']">
                          +{(sub as any).rewardCoins || Math.round((sub.rewardAmount || 0.1) * 1000)}
                        </td>
                        <td className="p-3.5 text-emerald-400 font-medium">
                          ${(sub.rewardAmount || 0.1).toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              sub.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : sub.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border-rose-800'
                                : 'bg-amber-950 text-amber-400 border-amber-800'
                            }`}
                          >
                            {sub.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          ACTIVE RUNNER MODAL (PTC / YOUTUBE SANDBOXED TIMER)
          ======================================================== */}
      {activeRunnerTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-5 relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {activeRunnerTask.category?.includes('YouTube') ? (
                  <Play className="w-5 h-5 text-rose-400" />
                ) : (
                  <Zap className="w-5 h-5 text-cyan-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {activeRunnerTask.title}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Reward: +{activeRunnerTask.rewardCoins || Math.round((activeRunnerTask.rewardAmount || 0.015) * 1000)} Coins (${(activeRunnerTask.rewardAmount || 0.015).toFixed(3)})
                  </span>
                </div>
              </div>

              {!runnerVerifying && !runnerSuccessData && (
                <button
                  onClick={handleCloseRunnerModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Success State Celebration */}
            {runnerSuccessData ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950/90 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Reward Credited Successfully!
                  </h4>
                  <p className="text-xs text-emerald-400 font-semibold">
                    {runnerSuccessData.msg}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-2xl font-['Space_Grotesk'] pt-2">
                    <Coins className="w-6 h-6" /> +{runnerSuccessData.coins} Coins
                  </div>
                </div>

                <button
                  onClick={handleCloseRunnerModal}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Done & Continue Earning
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* YouTube Sandboxed Player or Webpage Preview */}
                {activeRunnerTask.youtubeVideoId ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeRunnerTask.youtubeVideoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
                      title="Sandboxed Video Player"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Advertiser Target</span>
                      <p className="font-mono text-cyan-400 truncate max-w-xs">{activeRunnerTask.targetUrl || 'Official Sponsor Portal'}</p>
                    </div>
                    {activeRunnerTask.targetUrl && (
                      <a
                        href={activeRunnerTask.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
                      >
                        Reopen Tab <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Live Sandboxed Countdown Progress */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Anti-Cheat Timer
                    </span>
                    <span className="font-bold text-white font-mono">
                      {runnerTimeRemaining > 0 ? `${runnerTimeRemaining}s Remaining` : 'Completed!'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        runnerTimeRemaining === 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ((runnerTimerSeconds - runnerTimeRemaining) / runnerTimerSeconds) * 100)}%`,
                      }}
                    />
                  </div>

                  {/* Anti-Cheat Focus Warning when un-focused */}
                  {runnerIsPaused && runnerTimeRemaining > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs flex items-center gap-2 text-left">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                      <span>
                        <strong>Timer Paused:</strong> Please keep this window focused and active to complete verification.
                      </span>
                    </div>
                  )}
                </div>

                {/* Verification Challenge (Enabled upon timer reaching 0) */}
                {runnerIsCompleted && (
                  <form onSubmit={handleVerifyCompletion} className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Human Verification Check
                      </span>
                      <span className="text-[10px] text-indigo-300">Solve sum to claim</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-sm text-cyan-400">
                        {runnerPuzzlePrompt}
                      </div>

                      <input
                        type="number"
                        required
                        autoFocus
                        value={runnerPuzzleAnswer}
                        onChange={(e) => setRunnerPuzzleAnswer(e.target.value)}
                        placeholder="Answer"
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:border-cyan-500 focus:outline-none"
                      />

                      <button
                        type="submit"
                        disabled={runnerVerifying || !runnerPuzzleAnswer.trim()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                      >
                        {runnerVerifying ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            Claim Coins <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {runnerError && (
                      <p className="text-xs text-rose-400 font-semibold">{runnerError}</p>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SOCIAL PROOF SUBMISSION MODAL
          ======================================================== */}
      {selectedSocialTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedSocialTask.title}</h3>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    Reward: +{selectedSocialTask.rewardCoins || Math.round((selectedSocialTask.rewardAmount || 0.1) * 1000)} Coins (${(selectedSocialTask.rewardAmount || 0.1).toFixed(2)})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSocialTask(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {selectedSocialTask.targetUrl && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Task Target URL:</span>
                <a
                  href={selectedSocialTask.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Open Official Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <form onSubmit={handleSubmitSocialProof} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Telegram / Social Handle or Verification Details
                </label>
                <input
                  type="text"
                  value={socialProofNotes}
                  onChange={(e) => setSocialProofNotes(e.target.value)}
                  placeholder="e.g. @your_telegram_username or profile name"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Direct Share / Post URL (Optional)
                </label>
                <input
                  type="url"
                  value={socialProofUrl}
                  onChange={(e) => setSocialProofUrl(e.target.value)}
                  placeholder="https://facebook.com/... or https://x.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Direct Screenshot File Upload Section */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>Upload Screenshot from Gallery / গ্যালারি থেকে ছবি আপলোড করুন</span>
                </label>

                {/* Hidden File Picker Input */}
                <input
                  ref={socialFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSocialFileChange}
                  className="hidden"
                />

                {socialScreenshotUrl ? (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-700/80 space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Screenshot Selected / ছবি যুক্ত হয়েছে</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveSocialScreenshot}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove / মুছে ফেলুন</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black flex items-center justify-center">
                        <img
                          src={socialScreenshotUrl}
                          alt="Screenshot Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-white truncate">
                          {socialScreenshotFileName || 'proof_screenshot.png'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          File Size: <strong className="text-slate-300">{socialScreenshotFileSize || 'Optimized'}</strong>
                        </p>
                        <p className="text-[11px] text-emerald-400 font-medium">
                          ✓ Ready for instant submission
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => socialFileInputRef.current?.click()}
                    className="p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/70 hover:bg-slate-950 transition-all flex flex-col items-center justify-center text-center space-y-2 cursor-pointer"
                  >
                    {socialIsProcessingImg ? (
                      <div className="py-2 flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                        <span className="text-xs font-semibold text-indigo-300">
                          Processing image...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="p-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-400">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">
                            Click to select screenshot from Gallery
                          </p>
                          <p className="text-[11px] text-slate-400">
                            গ্যালারি অথবা ক্যামেরা থেকে স্ক্রিনশট সিলেক্ট করুন (PNG, JPG, WEBP)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            socialFileInputRef.current?.click();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-950/50 transition cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Choose Image / ছবি নির্বাচন করুন</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {socialSubmitMsg && (
                <p
                  className={`text-xs font-semibold ${
                    socialSubmitMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {socialSubmitMsg.text}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSocialTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={socialSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {socialSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit for Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
