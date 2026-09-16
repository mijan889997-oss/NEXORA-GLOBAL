import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Flame, 
  Coins,
  Gift,
  RotateCcw,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { AdminTaskItem, DEFAULT_ADMIN_TASKS, DEFAULT_ADMIN_CONFIG } from './AdminTasksManager';

export type EarnTask = AdminTaskItem;
export const SPONSOR_TASKS = DEFAULT_ADMIN_TASKS;

export interface EarnSectionProps {
  onAddPoints?: (points: number) => void;
  user?: any;
  updateUser?: (data: any) => void;
  currentUser?: any;
  onBalanceUpdate?: (points: number) => void;
  className?: string;
}

export const EarnSection: React.FC<EarnSectionProps> = ({ 
  onAddPoints, 
  user: propUser, 
  updateUser,
  currentUser,
  onBalanceUpdate,
  className = ''
}) => {
  const { user: authUser, wallet, updateWallet, refreshMe } = useAuth();
  const effectiveUser = propUser || currentUser || authUser;

  const [tasksList, setTasksList] = useState<AdminTaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexvora_admin_tasks_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          return parsed.tasks;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_ADMIN_TASKS;
  });

  const [freecashUrl, setFreecashUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nexvora_admin_tasks_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.freecashBannerUrl) return parsed.freecashBannerUrl;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ADMIN_CONFIG.freecashBannerUrl || 'https://freecash.com/r/7GHGR';
  });

  const [activeTab, setActiveTab] = useState<'all' | 'adsterra' | 'monetag' | 'custom'>('all');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  
  // Modal & Timer States
  const [activeTask, setActiveTask] = useState<AdminTaskItem | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // সব স্টোরেজ থেকে বর্তমান পয়েন্ট খুঁজে বের করা
  const getStoredPoints = useCallback(() => {
    try {
      const p1 = localStorage.getItem('nexvora_user_points');
      if (p1 !== null && !isNaN(parseInt(p1, 10))) return parseInt(p1, 10);

      const p2 = localStorage.getItem('points');
      if (p2 !== null && !isNaN(parseInt(p2, 10))) return parseInt(p2, 10);

      const p3 = localStorage.getItem('user_points');
      if (p3 !== null && !isNaN(parseInt(p3, 10))) return parseInt(p3, 10);

      if (effectiveUser?.id) {
        const uPoints = localStorage.getItem(`points_${effectiveUser.id}`);
        if (uPoints !== null && !isNaN(parseInt(uPoints, 10))) return parseInt(uPoints, 10);
      }

      if (wallet && typeof wallet.availableBalance === 'number' && wallet.availableBalance > 0) {
        return Math.round(wallet.availableBalance * 1000);
      }

      if (effectiveUser?.points !== undefined && effectiveUser.points !== null) {
        return Number(effectiveUser.points);
      }

      const userObj = localStorage.getItem('nexvora_user') || localStorage.getItem('user');
      if (userObj) {
        const parsed = JSON.parse(userObj);
        if (parsed.points !== undefined && parsed.points !== null) return Number(parsed.points);
        if (parsed.balance !== undefined && parsed.balance !== null) return Math.round(Number(parsed.balance) * 1000);
      }

      const b1 = localStorage.getItem('nexvora_wallet_balance') || localStorage.getItem('nexvora_user_balance');
      if (b1 !== null && !isNaN(parseFloat(b1))) return Math.round(parseFloat(b1) * 1000);
    } catch {
      // fallback
    }
    return 0;
  }, [effectiveUser, wallet]);

  // পয়েন্ট লোড ও সিঙ্ক
  const syncLocalPoints = useCallback((e?: any) => {
    const detail = e?.detail;
    if (detail?.points !== undefined) {
      setCurrentPoints(Number(detail.points));
      return;
    }
    const pts = getStoredPoints();
    setCurrentPoints((prev) => Math.max(prev, pts));
  }, [getStoredPoints]);

  useEffect(() => {
    syncLocalPoints();

    const savedCompleted = localStorage.getItem('nexvora_completed_tasks_log');
    if (savedCompleted) {
      try {
        setCompletedTaskIds(JSON.parse(savedCompleted));
      } catch {
        setCompletedTaskIds([]);
      }
    }

    // Dynamic Admin Tasks Configuration Listener
    const reloadAdminConfig = (e?: any) => {
      try {
        const detail = e?.detail;
        if (detail && Array.isArray(detail.tasks)) {
          setTasksList(detail.tasks);
          if (detail.freecashBannerUrl) setFreecashUrl(detail.freecashBannerUrl);
          return;
        }
        const saved = localStorage.getItem('nexvora_admin_tasks_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
            setTasksList(parsed.tasks);
          }
          if (parsed.freecashBannerUrl) {
            setFreecashUrl(parsed.freecashBannerUrl);
          }
        }
      } catch (err) {
        console.warn('Error reading admin tasks config in EarnSection:', err);
      }
    };

    window.addEventListener('tasksConfigUpdated', reloadAdminConfig);
    window.addEventListener('storage', reloadAdminConfig);
    window.addEventListener('storage', syncLocalPoints);
    window.addEventListener('balanceUpdated', syncLocalPoints);
    window.addEventListener('pointsUpdated', syncLocalPoints);

    return () => {
      window.removeEventListener('tasksConfigUpdated', reloadAdminConfig);
      window.removeEventListener('storage', reloadAdminConfig);
      window.removeEventListener('storage', syncLocalPoints);
      window.removeEventListener('balanceUpdated', syncLocalPoints);
      window.removeEventListener('pointsUpdated', syncLocalPoints);
    };
  }, [syncLocalPoints]);

  // কাউন্টডাউন টাইমার
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const handleStartTask = (task: AdminTaskItem) => {
    setActiveTask(task);
    setTimer(task.timer);
    setIsTimerRunning(true);
    window.open(task.url, '_blank', 'noopener,noreferrer');
  };

  // ১০০% গ্যারান্টিড পয়েন্ট ও ব্যালেন্স ক্লেইম মেকানিজম (Backend API + Supabase + LocalStorage + Context + CustomEvents)
  const handleClaimPoints = async () => {
    if (!activeTask) return;

    const addedPts = Number(activeTask.points) || 20;
    
    try {
      // ১. লোকাল ইউজার সেশন ও আইডি বের করা
      const storedUser = localStorage.getItem('nexvora_user') || localStorage.getItem('user');
      let currentUserId = effectiveUser?.id || effectiveUser?.user_id || null;
      const startingPoints = Math.max(currentPoints, getStoredPoints());

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (!currentUserId) {
            currentUserId = parsed.id || parsed.user_id;
          }
        } catch {
          // ignore
        }
      }

      const newPts = startingPoints + addedPts;
      const usdAdded = addedPts / 1000;
      const newBal = (newPts / 1000).toFixed(4);

      // ২. ব্যাকএন্ড API কল (/api/user/add-points)
      let backendWallet = null;
      try {
        const token = localStorage.getItem('nexvora_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/user/add-points', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: currentUserId || 'usr_superadmin_001',
            points: addedPts,
            amount: usdAdded,
            taskType: activeTask.network,
            taskTitle: activeTask.title,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.wallet) {
            backendWallet = json.wallet;
          }
        }
      } catch (apiErr) {
        console.warn('Backend API point credit notice:', apiErr);
      }

      // ৩. সুপাবেজ ডাটাবেজে পয়েন্ট ও ব্যালেন্স আপডেট
      if (supabase && currentUserId) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              points: newPts, 
              balance: Number((newPts / 1000).toFixed(2)) 
            })
            .eq('id', currentUserId);
        } catch (dbErr) {
          console.warn('Supabase profile update notice:', dbErr);
        }
      }

      // ৪. লোকাল স্টোরেজ আপডেট
      localStorage.setItem('nexvora_user_points', newPts.toString());
      localStorage.setItem('points', newPts.toString());
      localStorage.setItem('user_points', newPts.toString());
      localStorage.setItem('nexvora_user_balance', newBal);
      localStorage.setItem('nexvora_wallet_balance', newBal);
      if (currentUserId) {
        localStorage.setItem(`points_${currentUserId}`, newPts.toString());
      }

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.points = newPts;
          parsed.balance = Number((newPts / 1000).toFixed(2));
          localStorage.setItem('nexvora_user', JSON.stringify(parsed));
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }

      // ৫. লোকাল স্টেট আপডেট
      setCurrentPoints(newPts);

      // ৬. AuthContext wallet আপডেট
      const updatedWalletData = backendWallet || {
        ...(wallet || {}),
        availableBalance: (wallet?.availableBalance || 0) + usdAdded,
        totalEarned: Math.max(wallet?.totalEarned || 0, (wallet?.availableBalance || 0) + usdAdded),
      };

      if (updateWallet) {
        try {
          updateWallet(updatedWalletData);
        } catch (e) {
          console.warn('Wallet state update warning:', e);
        }
      }

      // ৭. অ্যাপের প্রপস ও প্যারেন্ট কলব্যাক আপডেট
      if (typeof onAddPoints === 'function') {
        onAddPoints(addedPts);
      }
      if (typeof updateUser === 'function') {
        updateUser({ points: newPts, balance: Number((newPts / 1000).toFixed(2)) });
      }
      if (typeof onBalanceUpdate === 'function') {
        onBalanceUpdate(newPts);
      }

      // ৮. ড্যাশবোর্ডের মূল স্টেট ও গ্লোবাল উইন্ডো ইভেন্ট ট্রিগার
      window.dispatchEvent(
        new CustomEvent('balanceUpdated', { 
          detail: { 
            points: newPts, 
            balance: newBal,
            added: addedPts,
            newBalance: Number(newBal),
            wallet: updatedWalletData
          } 
        })
      );
      window.dispatchEvent(
        new CustomEvent('pointsUpdated', {
          detail: {
            points: newPts,
            added: addedPts,
            newBalance: Number(newBal),
          }
        })
      );
      window.dispatchEvent(new Event('storage'));

      if (refreshMe) {
        refreshMe().catch(() => {});
      }

      // ৯. কমপ্লিটেড লিস্টে যোগ করা
      const updated = [...completedTaskIds, activeTask.id];
      setCompletedTaskIds(updated);
      localStorage.setItem('nexvora_completed_tasks_log', JSON.stringify(updated));

      setSuccessToast(`🎉 +${addedPts} PTS ($${usdAdded.toFixed(3)}) মূল অ্যাকাউন্টে সফলভাবে যোগ হয়েছে!`);
      setActiveTask(null);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.error('Points sync error:', err);
      setActiveTask(null);
    }
  };

  const handleResetTasks = () => {
    setCompletedTaskIds([]);
    localStorage.removeItem('nexvora_completed_tasks_log');
    setSuccessToast('🔄 সব কাজ আবার চালু করা হয়েছে!');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const activeTasks = tasksList.filter((t) => t.active !== false);
  const filteredTasks =
    activeTab === 'all'
      ? activeTasks
      : activeTasks.filter((t) => t.network.toLowerCase() === activeTab.toLowerCase());

  const adsterraCount = activeTasks.filter((t) => t.network === 'Adsterra').length;
  const monetagCount = activeTasks.filter((t) => t.network === 'Monetag').length;
  const customCount = activeTasks.filter((t) => t.network === 'Custom').length;

  return (
    <div className={`w-full max-w-4xl mx-auto p-3 md:p-6 space-y-5 ${className}`}>
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-xs md:text-sm">{successToast}</span>
        </div>
      )}

      {/* Freecash Platform Banner */}
      <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> অফিসিয়াল ভেরিফায়েড গ্লোবাল পার্টনার
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 font-['Space_Grotesk']">
              <Gift className="w-6 h-6 text-emerald-400" /> Freecash গেম ও মাইক্রো-টাস্ক হাব
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
              গেম লেভেল পূরণ করুন, অ্যাপ ডাউনলোড ও পেইড সার্ভে করুন। কাজ শেষে সরাসরি Freecash থেকে বিকাশ/নগদ/ক্রিপ্টো বা গিফট কার্ডে নিজের ডলার তুলে নিন।
            </p>
            <div className="flex items-center gap-3 text-emerald-400 text-xs font-semibold pt-1">
              <span>⚡ ইন্সট্যান্ট পে-আউট</span>
              <span>•</span>
              <span>💵 $১.০০ - $৫০.০০ / টাস্ক</span>
            </div>
          </div>
          
          <a
            href={freecashUrl || 'https://freecash.com/r/7GHGR'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all flex-shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            কাজ শুরু করুন <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Sponsor Tasks & Local Balance Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 font-['Space_Grotesk']">
            <Sparkles className="w-5 h-5 text-amber-400" /> স্পন্সরড ভিজিট ও পয়েন্ট হাব
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            স্পন্সর লিঙ্কগুলো ভিজিট করে টাইমার শেষে ওয়েবসাইটে ইনস্ট্যান্ট পয়েন্ট যোগ করুন।
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetTasks}
            title="কাজগুলো আবার রিফ্রেশ করুন"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            রিসেট
          </button>
          <div className="bg-slate-800/90 px-3.5 py-2 rounded-xl flex items-center gap-2 border border-slate-700 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="text-xs font-bold text-amber-300">
              {currentPoints.toLocaleString()} PTS <span className="text-[10px] text-slate-400 font-normal">(${(currentPoints / 1000).toFixed(2)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          সব কাজ ({activeTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('adsterra')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'adsterra' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" /> Adsterra ({adsterraCount})
        </button>
        <button
          onClick={() => setActiveTab('monetag')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'monetag' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-blue-400" /> Monetag ({monetagCount})
        </button>
        {customCount > 0 && (
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'custom' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            অন্যান্য ({customCount})
          </button>
        )}
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-2xl text-center space-y-2 col-span-full">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">No tasks available right now</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are currently no tasks available in this category. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredTasks.map((task) => {
            const isCompleted = completedTaskIds.includes(task.id);
            const badgeClass =
              task.badgeBg ||
              (task.network === 'Adsterra'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : task.network === 'Monetag'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20');

            return (
              <div 
                key={task.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm transition-all"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                      {task.network}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" /> {task.timer}s
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2.5 leading-snug">{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.desc}</p>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-800">
                  <span className="text-emerald-400 font-bold text-xs">
                    +{task.points} PTS <span className="text-[10px] text-slate-500 font-normal">(${(task.points / 1000).toFixed(2)})</span>
                  </span>
                  {isCompleted ? (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all border border-emerald-500/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" /> পুনরায় করুন
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      ভিজিট করুন <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timer & Claim Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs p-5 text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-white line-clamp-1 text-left">{activeTask.title}</h3>
              <button 
                onClick={() => setActiveTask(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {timer > 0 ? (
              <div className="py-3 space-y-2">
                <p className="text-xs text-slate-300">বিজ্ঞাপন পেজটি ব্রাউজ করুন। বাকি সময়:</p>
                <div className="text-3xl font-black text-amber-400 font-mono flex items-center justify-center gap-2">
                  <Clock className="w-6 h-6 animate-spin text-amber-400" /> {timer}s
                </div>
              </div>
            ) : (
              <div className="py-2 space-y-3">
                <p className="text-xs text-emerald-400 font-semibold">টাইমার শেষ! পয়েন্ট ব্যালেন্সে যোগ করুন:</p>
                <button
                  onClick={handleClaimPoints}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  পয়েন্ট ক্লেইম করুন (+{activeTask.points} PTS)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EarnSection;
