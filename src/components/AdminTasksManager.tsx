import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  Zap,
  Gift,
  Clock,
  Coins,
  CheckCircle2,
  ShieldCheck,
  Globe,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  AlertCircle
} from 'lucide-react';

export interface AdminTaskItem {
  id: string;
  network: 'Adsterra' | 'Monetag' | 'Custom';
  title: string;
  desc: string;
  url: string;
  points: number;
  timer: number;
  badgeBg?: string;
  active?: boolean;
}

export interface AdminTasksConfig {
  freecashBannerUrl: string;
  tasks: AdminTaskItem[];
  updatedAt?: string;
}

export const DEFAULT_ADMIN_TASKS: AdminTaskItem[] = [
  // Adsterra Direct / CPM Links
  {
    id: 'adsterra_1',
    network: 'Adsterra',
    title: 'Adsterra প্রিমিয়াম স্পন্সরড ভিজিট ১',
    desc: 'পৃষ্ঠাটি ওপেন করে ১৫ সেকেন্ড ব্রাউজ করুন এবং বোনাস পয়েন্ট ক্লেইম করুন।',
    url: 'https://www.profitableratecpmnetwork.com/yct17pt7yz?key=be579a364af14990cc55db52d40ef09f',
    points: 20,
    timer: 15,
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    active: true,
  },
  {
    id: 'adsterra_2',
    network: 'Adsterra',
    title: 'Adsterra হাই-সিপিএম অ্যাড ভিজিট ২',
    desc: 'ওয়েবসাইটে ক্লিক করে ২০ সেকেন্ড থাকুন এবং ইনস্ট্যান্ট পয়েন্ট ব্যালেন্সে যোগ করুন।',
    url: 'https://www.profitableratecpmnetwork.com/w3tfw188e?key=9c09f96f62780c82b69e38cd3b501fb6',
    points: 25,
    timer: 20,
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    active: true,
  },
  {
    id: 'adsterra_3',
    network: 'Adsterra',
    title: 'Adsterra ডিরেক্ট স্পন্সর ভিজিট ৩',
    desc: 'স্পন্সর লিঙ্ক ভিজিট করুন এবং ২৫ সেকেন্ড টাইমার শেষে রিওয়ার্ড ক্লেইম করুন।',
    url: 'https://www.profitableratecpmnetwork.com/k34suttaj?key=1501104a81aef4f40db5c0b86a161fed',
    points: 30,
    timer: 25,
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    active: true,
  },
  // Monetag Smartlinks
  {
    id: 'monetag_1',
    network: 'Monetag',
    title: 'Monetag স্মার্টলিঙ্ক টাস্ক ১',
    desc: '১৫ সেকেন্ড স্পন্সরড পার্টনার ওয়েবসাইট ভিজিট করে পয়েন্ট নিন।',
    url: 'https://omg10.com/4/11775258',
    points: 20,
    timer: 15,
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: true,
  },
  {
    id: 'monetag_2',
    network: 'Monetag',
    title: 'Monetag স্মার্টলিঙ্ক টাস্ক ২',
    desc: '২০ সেকেন্ড স্পন্সরড পেজ স্ক্রোল করুন এবং রিওয়ার্ড আনলক করুন।',
    url: 'https://omg10.com/4/11794498',
    points: 25,
    timer: 20,
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: true,
  },
  {
    id: 'monetag_3',
    network: 'Monetag',
    title: 'Monetag স্পন্সরড অফার ৩',
    desc: 'স্পন্সরড পেজে ভিজিট করে ইনস্ট্যান্ট বোনাস পয়েন্ট সংগ্রহ করুন।',
    url: 'https://omg10.com/4/11794501',
    points: 20,
    timer: 15,
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: true,
  },
  {
    id: 'monetag_4',
    network: 'Monetag',
    title: 'Monetag স্মার্টলিঙ্ক টাস্ক ৪',
    desc: 'বিজ্ঞাপন পেজটি ২০ সেকেন্ড ব্রাউজ করে রিওয়ার্ড ক্লেইম করুন।',
    url: 'https://omg10.com/4/11794502',
    points: 25,
    timer: 20,
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: true,
  },
  {
    id: 'monetag_5',
    network: 'Monetag',
    title: 'Monetag প্রিমিয়াম লিঙ্ক ৫',
    desc: 'সম্পূর্ণ ৩০ সেকেন্ড ভিজিট করে বড় অংকের পয়েন্ট ক্লেইম করুন।',
    url: 'https://omg10.com/4/11794505',
    points: 35,
    timer: 30,
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: true,
  },
];

export const DEFAULT_ADMIN_CONFIG: AdminTasksConfig = {
  freecashBannerUrl: 'https://freecash.com/r/7GHGR',
  tasks: DEFAULT_ADMIN_TASKS,
  updatedAt: new Date().toISOString(),
};

export const AdminTasksManager: React.FC = () => {
  const [config, setConfig] = useState<AdminTasksConfig>(DEFAULT_ADMIN_CONFIG);
  const [activeTab, setActiveTab] = useState<'all' | 'adsterra' | 'monetag' | 'custom'>('all');
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskNetwork, setNewTaskNetwork] = useState<'Adsterra' | 'Monetag' | 'Custom'>('Adsterra');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(25);
  const [newTaskTimer, setNewTaskTimer] = useState<number>(20);

  // Load config on mount
  useEffect(() => {
    const loadConfig = () => {
      try {
        const saved = localStorage.getItem('nexvora_admin_tasks_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          setConfig({
            freecashBannerUrl: parsed.freecashBannerUrl || DEFAULT_ADMIN_CONFIG.freecashBannerUrl,
            tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : DEFAULT_ADMIN_CONFIG.tasks,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          });
        } else {
          setConfig(DEFAULT_ADMIN_CONFIG);
        }
      } catch (err) {
        console.warn('Error reading admin tasks config:', err);
        setConfig(DEFAULT_ADMIN_CONFIG);
      }
    };

    loadConfig();

    const handleConfigUpdated = () => loadConfig();
    window.addEventListener('tasksConfigUpdated', handleConfigUpdated);
    window.addEventListener('storage', handleConfigUpdated);

    return () => {
      window.removeEventListener('tasksConfigUpdated', handleConfigUpdated);
      window.removeEventListener('storage', handleConfigUpdated);
    };
  }, []);

  const handleUpdateTaskField = (id: string, field: keyof AdminTaskItem, value: any) => {
    setConfig((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }));
  };

  const handleToggleTaskActive = (id: string) => {
    setConfig((prev) => {
      const updatedTasks = prev.tasks.map((t) =>
        t.id === id ? { ...t, active: t.active === false ? true : false } : t
      );
      const newConfig: AdminTasksConfig = {
        ...prev,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('nexvora_admin_tasks_config', JSON.stringify(newConfig));
        window.dispatchEvent(new CustomEvent('tasksConfigUpdated', { detail: newConfig }));
        window.dispatchEvent(new Event('tasks_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.warn('Failed to save task status:', e);
      }
      return newConfig;
    });

    const currentTask = config.tasks.find((t) => t.id === id);
    const nextState = currentTask?.active === false ? 'Active' : 'Inactive';
    setSavedToast(`টাস্ক স্ট্যাটাস "${nextState}" হিসেবে সেভ করা হয়েছে।`);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleDeleteTask = (id: string) => {
    const targetTask = config.tasks.find((t) => t.id === id);
    const title = targetTask?.title || 'এই টাস্কটি';
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?\n\nIt will be removed immediately from both Admin view and the User Dashboard.`)) {
      return;
    }

    setConfig((prev) => {
      const filtered = prev.tasks.filter((t) => t.id !== id);
      const newConfig: AdminTasksConfig = {
        ...prev,
        tasks: filtered,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('nexvora_admin_tasks_config', JSON.stringify(newConfig));
        window.dispatchEvent(new CustomEvent('tasksConfigUpdated', { detail: newConfig }));
        window.dispatchEvent(new Event('tasks_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.warn('Failed to save task deletion:', e);
      }
      return newConfig;
    });

    setSavedToast(`টাস্ক "${title}" সফলভাবে ডিলিট করা হয়েছে।`);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskUrl.trim()) {
      alert('টাস্কের শিরোনাম এবং টার্গেট লিঙ্ক আবশ্যক!');
      return;
    }

    const badgeBg =
      newTaskNetwork === 'Adsterra'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : newTaskNetwork === 'Monetag'
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

    const newTaskItem: AdminTaskItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      network: newTaskNetwork,
      title: newTaskTitle.trim(),
      desc: newTaskDesc.trim() || `${newTaskTimer} সেকেন্ড পেজটি ভিজিট করে পয়েন্ট সংগ্রহ করুন।`,
      url: newTaskUrl.trim(),
      points: Number(newTaskPoints) || 20,
      timer: Number(newTaskTimer) || 15,
      badgeBg,
      active: true,
    };

    setConfig((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTaskItem],
    }));

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskUrl('');
    setNewTaskPoints(25);
    setNewTaskTimer(20);
    setShowAddModal(false);

    setSavedToast('✨ নতুন টাস্ক সফলভাবে তালিকায় যুক্ত করা হয়েছে! সেভ করতে "সব পরিবর্তন সেভ করুন" চাপুন।');
    setTimeout(() => setSavedToast(null), 4000);
  };

  const handleSaveAll = () => {
    const payload: AdminTasksConfig = {
      ...config,
      freecashBannerUrl: config.freecashBannerUrl.trim() || 'https://freecash.com/r/7GHGR',
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('nexvora_admin_tasks_config', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('tasksConfigUpdated', { detail: payload }));
    window.dispatchEvent(new Event('storage'));

    setSavedToast('✅ টাস্ক পয়েন্ট, টাইমার ও Freecash লিঙ্ক সফলভাবে সেভ করা হয়েছে এবং ব্যবহারকারীদের জন্য লাইভ করা হয়েছে!');
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি সব টাস্ক ও সেটিংস অরিজিনাল ভেরিফায়েড ডিফল্টে ফিরিয়ে নিতে চান?')) {
      setConfig(DEFAULT_ADMIN_CONFIG);
      localStorage.setItem('nexvora_admin_tasks_config', JSON.stringify(DEFAULT_ADMIN_CONFIG));
      window.dispatchEvent(new CustomEvent('tasksConfigUpdated', { detail: DEFAULT_ADMIN_CONFIG }));
      window.dispatchEvent(new Event('storage'));

      setSavedToast('🔄 অরিজিনাল ভেরিফায়েড ডিফল্ট কনফিগারেশন সফলভাবে রিস্টোর করা হয়েছে!');
      setTimeout(() => setSavedToast(null), 3500);
    }
  };

  const filteredTasks =
    activeTab === 'all'
      ? config.tasks
      : config.tasks.filter((t) => t.network.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Toast */}
      {savedToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-xs md:text-sm">{savedToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-bold border border-indigo-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> ডাইনামিক টাস্ক ইঞ্জিন ও সিপিএম ম্যানেজার
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            অ্যাডমিন স্পন্সরড টাস্ক ও পার্টনার হাব কনফিগারেশন
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            এখানে টাস্কের পয়েন্ট, টাইমার সেকেন্ড ও টার্গেট URL সরাসরি পরিবর্তন করুন। সেভ করার সাথে সাথে ব্যবহারকারীদের ড্যাশবোর্ড ও EarnSection-এ রিয়েলটাইমে আপডেট হবে। (১,০০০ PTS = $১.০০ USD)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            ডিফল্ট রিসেট
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-emerald-950 transition flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            সব পরিবর্তন সেভ করুন
          </button>
        </div>
      </div>

      {/* 1. Verified Global Partner (Freecash) Target URL */}
      <div className="p-5 md:p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> ভেরিফায়েড গ্লোবাল ব্যানার
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" /> Freecash পার্টনারশিপ লিংক কনফিগারেশন
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              EarnSection-এর শীর্ষে থাকা মূল ব্যানারের রিডাইরেক্ট লিংক। (ডিফল্ট: <span className="font-mono text-emerald-400">https://freecash.com/r/7GHGR</span>)
            </p>
          </div>
          <a
            href={config.freecashBannerUrl || 'https://freecash.com/r/7GHGR'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold underline underline-offset-4"
          >
            লিংক টেস্ট করুন <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={config.freecashBannerUrl}
            onChange={(e) => setConfig({ ...config, freecashBannerUrl: e.target.value })}
            placeholder="https://freecash.com/r/7GHGR"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs md:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> আপডেট করুন
          </button>
        </div>
      </div>

      {/* 2. Tasks Management Header & Filters */}
      <div className="p-5 md:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" /> সক্রিয় টাস্ক তালিকা ({config.tasks.length}টি টাস্ক)
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              প্রতিটি টাস্কের পয়েন্ট, সেকেন্ড এবং ক্লিক URL এডিট করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন টাস্ক যোগ করুন
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            সব ({config.tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adsterra')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
              activeTab === 'adsterra' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" /> Adsterra ({config.tasks.filter((t) => t.network === 'Adsterra').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monetag')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
              activeTab === 'monetag' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-blue-400" /> Monetag ({config.tasks.filter((t) => t.network === 'Monetag').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'custom' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            অন্যান্য ({config.tasks.filter((t) => t.network === 'Custom').length})
          </button>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {filteredTasks.map((task, idx) => {
            const isActive = task.active !== false;
            return (
              <div
                key={task.id || idx}
                className={`p-4 md:p-5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left task details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          task.network === 'Adsterra'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : task.network === 'Monetag'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}
                      >
                        {task.network}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">ID: {task.id}</span>
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          সক্রিয় (Active)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                          নিষ্ক্রিয় (Inactive)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">টাস্ক শিরোনাম:</label>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleUpdateTaskField(task.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">বর্ণনা / নির্দেশাবলী:</label>
                        <input
                          type="text"
                          value={task.desc}
                          onChange={(e) => handleUpdateTaskField(task.id, 'desc', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Target URL */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> টার্গেট লিঙ্ক (Target / Smartlink URL):
                        </label>
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                        >
                          ওপেন করে টেস্ট করুন ↗
                        </a>
                      </div>
                      <input
                        type="url"
                        value={task.url}
                        onChange={(e) => handleUpdateTaskField(task.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Right quick stats / points & timer editor */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 lg:min-w-[180px] p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" /> পয়েন্ট:
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="5000"
                            value={task.points}
                            onChange={(e) => handleUpdateTaskField(task.id, 'points', Number(e.target.value))}
                            className="w-20 px-2.5 py-1 text-center font-bold text-amber-300 bg-slate-950 border border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-slate-400 font-mono">
                            (${((task.points || 0) / 1000).toFixed(3)})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> টাইমার:
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={task.timer}
                            onChange={(e) => handleUpdateTaskField(task.id, 'timer', Number(e.target.value))}
                            className="w-20 px-2.5 py-1 text-center font-bold text-white bg-slate-950 border border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-[10px] text-slate-400">সেকেন্ড</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 w-full justify-end">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskActive(task.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                          isActive
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={isActive ? 'টাস্ক নিষ্ক্রিয় করুন' : 'টাস্ক সক্রিয় করুন'}
                      >
                        {isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs transition cursor-pointer"
                        title="টাস্ক ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> নতুন স্পন্সরড টাস্ক যোগ করুন
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">অ্যাড নেটওয়ার্ক:</label>
                <select
                  value={newTaskNetwork}
                  onChange={(e) => setNewTaskNetwork(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Adsterra">Adsterra (Direct CPM Link)</option>
                  <option value="Monetag">Monetag (Smartlink / Direct Offer)</option>
                  <option value="Custom">Custom / Direct Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">টাস্ক শিরোনাম *:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="যেমন: Adsterra হাই-সিপিএম অ্যাড ভিজিট"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">টার্গেট লিঙ্ক (Destination URL) *:</label>
                <input
                  type="url"
                  required
                  value={newTaskUrl}
                  onChange={(e) => setNewTaskUrl(e.target.value)}
                  placeholder="https://www.profitableratecpmnetwork.com/... বা https://omg10.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 text-xs font-mono focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">রিওয়ার্ড পয়েন্ট (PTS):</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    required
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ≈ ${((newTaskPoints || 0) / 1000).toFixed(3)} USD
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">টাইমার (সেকেন্ড):</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    required
                    value={newTaskTimer}
                    onChange={(e) => setNewTaskTimer(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">সংক্ষিপ্ত বিবরণ (Optional):</label>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="পেজটি ১৫ সেকেন্ড ব্রাউজ করে রিওয়ার্ড ক্লেইম করুন।"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> তালিকায় যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasksManager;
