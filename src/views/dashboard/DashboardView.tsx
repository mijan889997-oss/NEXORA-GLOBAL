import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Layers,
  Briefcase,
  ShoppingBag,
  CheckSquare,
  BookOpen,
  Share2,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  Plus,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  ChevronRight,
  Send,
  RefreshCw,
  FileQuestion,
  Flame,
  Coins,
  Upload,
  Image as ImageIcon,
  Camera,
  Trash2,
  Sparkles,
  Package,
  Gift,
  Menu,
  X,
} from 'lucide-react';
import { WithdrawalsView } from './WithdrawalsView';
import { InviteAndEarnCard } from '../../components/InviteAndEarnCard';
import { DailyBonusCard } from '../../components/DailyBonusCard';
import VerifiedMarketplaceView from '../../components/VerifiedMarketplaceView';
import { EarnMicroTasksView } from './EarnMicroTasksView';
import { TaskCard, extractTaskTargetUrl } from '../../components/TaskCard';
import { TaskDetailModal } from '../../components/TaskDetailModal';
import { ServiceCard } from '../../components/ServiceCard';
import { DigitalProductsSection } from '../../components/DigitalProductsSection';
import { FreelanceMarketplaceView } from '../../components/FreelanceMarketplaceView';
import { openUdemyAffiliate, openKworkAffiliate, KWORK_AFFILIATE_URL } from '../../config/affiliateLinks';
import { useUserBalance } from '../../lib/userBalance';
import {
  fetchSupabaseMicrotasks,
  insertSupabaseSubmission,
  subscribeToMicrotasks,
  subscribeToSubmissions,
} from '../../lib/supabase';
import type {
  Transaction,
  Withdrawal,
  PaymentGatewayConfig,
  Task,
  TaskSubmission,
  Service,
  Job,
  Notification,
  Message,
  Dispute,
  PaymentMethodType,
  MyReferralData,
} from '../../types';

interface DashboardViewProps {
  currentSubpath?: string;
  navigate: (path: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentSubpath = 'earn', navigate }) => {
  const { user, profile, wallet, refreshMe, apiFetch } = useAuth();
  const {
    points: liveUserPoints,
    availableUsd: liveAvailableBalance,
    totalEarnedUsd: liveTotalEarned,
    pendingUsd: livePendingBalance,
    totalWithdrawnUsd: liveTotalWithdrawn,
    formattedUsd: liveFormattedUsd,
    formattedPoints: liveFormattedPoints,
  } = useUserBalance();

  const [activeSection, setActiveSection] = useState<string>(currentSubpath || 'earn');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Synchronize with URL path and ensure mobile drawer auto-collapses on page load/change
  useEffect(() => {
    setActiveSection(currentSubpath || 'earn');
    setMobileNavOpen(false);
  }, [currentSubpath]);

  const handleSubnav = (sec: string) => {
    setMobileNavOpen(false);
    if (sec === 'jobs') {
      openKworkAffiliate();
      return;
    }
    setActiveSection(sec);
    navigate(`/dashboard/${sec}`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const mobileQuickNavRef = React.useRef<HTMLDivElement | null>(null);
  const desktopQuickNavRef = React.useRef<HTMLDivElement | null>(null);
  const activeTabMobileRef = React.useRef<HTMLButtonElement | null>(null);
  const activeTabDesktopRef = React.useRef<HTMLButtonElement | null>(null);

  // Auto-scroll the horizontal bar so the active tab is centered and visible
  useEffect(() => {
    if (activeTabMobileRef.current && mobileQuickNavRef.current) {
      activeTabMobileRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    if (activeTabDesktopRef.current && desktopQuickNavRef.current) {
      activeTabDesktopRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeSection]);

  const handleQuickTabClick = (tabId: string) => {
    setMobileNavOpen(false);
    if (tabId === 'jobs') {
      openKworkAffiliate();
      return;
    }

    if (tabId === 'bonus') {
      if (activeSection === 'overview') {
        const el = document.getElementById('daily-login-bonus-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-purple-400', 'ring-offset-2', 'ring-offset-slate-950');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-purple-400', 'ring-offset-2', 'ring-offset-slate-950');
          }, 2500);
          return;
        }
      }
      handleSubnav('bonus');
      return;
    }

    if (tabId === 'marketplace') {
      if (activeSection === 'overview') {
        const el = document.getElementById('dashboard-marketplace-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950');
          }, 2500);
          return;
        }
      }
      handleSubnav('marketplace');
      return;
    }

    handleSubnav(tabId);
  };

  const isTabActive = (tabId: string) => {
    if (tabId === activeSection) return true;
    if (tabId === 'earn' && (activeSection === 'timewall' || activeSection === 'micro-tasks')) return true;
    if (tabId === 'withdrawals' && (activeSection === 'withdraw' || activeSection === 'payout')) return true;
    if (tabId === 'marketplace' && (activeSection === 'marketplace' || activeSection === 'services' || activeSection === 'products')) return true;
    if (tabId === 'referral' && (activeSection === 'affiliate')) return true;
    if (tabId === 'tasks' && (activeSection === 'microtasks' || activeSection === 'orders')) return true;
    return false;
  };

  // Real data states
  const [stats, setStats] = useState({
    activeServicesCount: 0,
    activeJobsCount: 0,
    proposalsCount: 0,
    ordersCount: 0,
    submittedTasksCount: 0,
    approvedTasksCount: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Dispute[]>([]);
  const [referralData, setReferralData] = useState<MyReferralData>({
    referralCode: '',
    totalReferrals: 0,
    qualifiedCount: 0,
    rewardsEarned: 0,
    referrals: [],
  });

  // Live microtasks states
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState<Task | null>(null);
  const [taskProofText, setTaskProofText] = useState('');
  const [taskScreenshotUrl, setTaskScreenshotUrl] = useState('');
  const [taskScreenshotFileName, setTaskScreenshotFileName] = useState('');
  const [taskScreenshotFileSize, setTaskScreenshotFileSize] = useState('');
  const [taskIsProcessingImg, setTaskIsProcessingImg] = useState(false);
  const [taskProofUrl, setTaskProofUrl] = useState('');
  const [taskSubmitLoading, setTaskSubmitLoading] = useState(false);
  const [taskSubmitMsg, setTaskSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const dashTaskFileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const handleDashTaskFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setTaskIsProcessingImg(true);
      setTaskSubmitMsg(null);
      const dataUri = await processImageFile(file);
      setTaskScreenshotUrl(dataUri);
      setTaskScreenshotFileName(file.name);
      setTaskScreenshotFileSize(formatFileSize(file.size));
    } catch (err: any) {
      setTaskSubmitMsg({ type: 'error', text: err.message || 'Error loading image / ছবি লোড করতে সমস্যা হয়েছে।' });
    } finally {
      setTaskIsProcessingImg(false);
    }
  };

  const handleRemoveDashTaskScreenshot = () => {
    setTaskScreenshotUrl('');
    setTaskScreenshotFileName('');
    setTaskScreenshotFileSize('');
    if (dashTaskFileInputRef.current) {
      dashTaskFileInputRef.current.value = '';
    }
  };

  const [loading, setLoading] = useState(false);

  // Forms states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethodType>('bKash Personal');
  const [accountDetails, setAccountDetails] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // KYC state
  const [kycDocType, setKycDocType] = useState('National ID / NID');
  const [kycDocNumber, setKycDocNumber] = useState('');
  const [kycNotes, setKycNotes] = useState('');
  const [kycMsg, setKycMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Service creation state
  const [srvTitle, setSrvTitle] = useState('');
  const [srvCategory, setSrvCategory] = useState<any>('SEO & SEM');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDays, setSrvDays] = useState('3');
  const [showNewSrvModal, setShowNewSrvModal] = useState(false);

  // Support ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'order_issue' | 'payment' | 'account' | 'task_submission' | 'other'>('account');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketMsg, setTicketMsg] = useState<string | null>(null);

  const getProcessedTasks = (serverTasksList: any[] = []) => {
    let deletedIds: string[] = [];
    try {
      const rawDel = localStorage.getItem('nexvora_deleted_tasks');
      if (rawDel) deletedIds = JSON.parse(rawDel);
    } catch {}

    let statusOverrides: Record<string, string> = {};
    try {
      const rawOv = localStorage.getItem('nexvora_task_status_overrides');
      if (rawOv) statusOverrides = JSON.parse(rawOv);
    } catch {}

    let merged = [...serverTasksList].filter(
      (t: any) =>
        t &&
        t.id !== 'TASK-101' &&
        t.id !== 'TASK-102' &&
        !t.title?.includes('Sign up and verify profile on partner website') &&
        !t.title?.includes('App feedback & UI bug testing')
    );
    try {
      const rawLocal = localStorage.getItem('nexvora_custom_tasks');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (t: any) =>
              t &&
              t.id !== 'TASK-101' &&
              t.id !== 'TASK-102' &&
              !t.title?.includes('Sign up and verify profile on partner website') &&
              !t.title?.includes('App feedback & UI bug testing')
          );
          const existingIds = new Set(merged.map((t: any) => t.id));
          for (const lt of filtered) {
            if (!existingIds.has(lt.id)) {
              merged.unshift(lt);
              existingIds.add(lt.id);
            }
          }
        }
      }
    } catch {}

    return merged.filter((t: any) => {
      if (!t || !t.id) return false;
      if (deletedIds.includes(t.id)) return false;
      const effStatus = statusOverrides[t.id] || t.status;
      return effStatus === 'active';
    });
  };

  // Refresh dashboard data
  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Synchronize global AuthContext wallet & user ledger state
      await refreshMe();

      const [st, tx, wd, gw, ts, sr, jb, nt, mg, rf, tk, tks, sbTasks] = await Promise.all([
        apiFetch('/api/user/dashboard-stats').catch(() => null),
        apiFetch('/api/wallet/transactions').catch(() => ({ transactions: [] })),
        apiFetch('/api/withdrawals/my').catch(() => ({ withdrawals: [] })),
        apiFetch('/api/withdrawals/methods').catch(() => ({ methods: [] })),
        apiFetch('/api/tasks/my-submissions').catch(() => ({ submissions: [] })),
        apiFetch('/api/services/my').catch(() => ({ services: [] })),
        apiFetch('/api/jobs/my').catch(() => ({ jobs: [] })),
        apiFetch('/api/notifications').catch(() => []),
        apiFetch('/api/messages').catch(() => []),
        apiFetch('/api/referrals/my').catch(() => null),
        apiFetch('/api/support/tickets').catch(() => ({ tickets: [] })),
        apiFetch('/api/tasks').catch(() => ({ tasks: [] })),
        fetchSupabaseMicrotasks().catch(() => []),
      ]);

      if (st && typeof st.availableBalance === 'number') {
        setStats({
          ...st,
          availableBalance: Math.max(st.availableBalance, liveAvailableBalance),
          totalEarned: Math.max(st.totalEarned, liveTotalEarned),
        });
      }
      if (tx?.transactions) setTransactions(tx.transactions);
      if (wd?.withdrawals) setWithdrawals(wd.withdrawals);
      if (gw?.methods) setGateways(gw.methods);
      if (ts?.submissions) setMyTasks(ts.submissions);
      if (sr?.services) setMyServices(sr.services);
      if (jb?.jobs) setMyJobs(jb.jobs);
      if (Array.isArray(nt?.notifications)) {
        setNotifications(nt.notifications);
      } else if (Array.isArray(nt)) {
        setNotifications(nt);
      }
      if (Array.isArray(mg?.messages)) {
        setMessages(mg.messages);
      } else if (Array.isArray(mg)) {
        setMessages(mg);
      }
      if (rf && rf.referralCode) setReferralData(rf);
      
      let mergedUserTickets = [...(tk?.tickets || [])];
      const existingTicketIds = new Set(mergedUserTickets.map((t: any) => t.id || t.ticketNumber));
      try {
        const rawLocal = localStorage.getItem('nexvora_support_tickets');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            const userFilter = parsed.filter((t: any) => t.raisedById === user.id || t.userEmail === user.email || !t.raisedById || t.raisedById === 'guest');
            for (const lt of userFilter) {
              if (!existingTicketIds.has(lt.id) && !existingTicketIds.has(lt.ticketNumber)) {
                mergedUserTickets.unshift(lt);
                existingTicketIds.add(lt.id);
              } else {
                mergedUserTickets = mergedUserTickets.map((t: any) => (t.id === lt.id || t.ticketNumber === lt.ticketNumber ? { ...t, ...lt } : t));
              }
            }
          }
        }
      } catch (e) {
        console.warn('Dashboard support ticket parse warning:', e);
      }
      setTickets(mergedUserTickets);

      // Merge backend tasks with Supabase microtasks
      const rawTasks = tks?.tasks || [];
      const combinedTasks = [...rawTasks];
      const existingTaskIds = new Set(combinedTasks.map((t: any) => t.id));
      if (Array.isArray(sbTasks)) {
        for (const sbt of sbTasks) {
          if (!existingTaskIds.has(sbt.id)) {
            combinedTasks.unshift(sbt);
            existingTaskIds.add(sbt.id);
          }
        }
      }
      setAvailableTasks(getProcessedTasks(combinedTasks));
    } catch (err) {
      console.warn('Dashboard data load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTaskProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForProof) return;
    setTaskSubmitLoading(true);
    setTaskSubmitMsg(null);
    try {
      // 1. Insert proof into Supabase task_submissions
      insertSupabaseSubmission({
        taskId: selectedTaskForProof.id,
        taskTitle: selectedTaskForProof.title,
        taskCategory: selectedTaskForProof.category,
        rewardAmount: selectedTaskForProof.rewardAmount,
        rewardCoins: selectedTaskForProof.rewardCoins,
        userId: user?.id || 'guest',
        userName: (user as any)?.name || user?.email || 'Member',
        userEmail: user?.email || '',
        textNotes: taskProofText,
        screenshotUrl: taskScreenshotUrl,
        proofUrl: taskProofUrl,
        proofData: {
          textNotes: taskProofText,
          screenshotUrl: taskScreenshotUrl,
          proofUrl: taskProofUrl,
        },
        status: 'pending_review',
        submittedAt: new Date().toISOString(),
      }).catch((err) => console.warn('[Supabase] Submission insert notice:', err));

      // 2. Submit to backend API
      await apiFetch(`/api/tasks/${selectedTaskForProof.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          textNotes: taskProofText,
          screenshotUrl: taskScreenshotUrl,
          proofUrl: taskProofUrl,
        }),
      });
      setTaskSubmitMsg({ type: 'success', text: 'Task proof submitted! Compliance will review and credit reward.' });
      setTaskProofText('');
      setTaskScreenshotUrl('');
      setTaskProofUrl('');
      await loadDashboardData();
      setTimeout(() => {
        setSelectedTaskForProof(null);
        setTaskSubmitMsg(null);
      }, 1800);
    } catch (err: any) {
      setTaskSubmitMsg({ type: 'error', text: err.message || 'Failed to submit proof.' });
    } finally {
      setTaskSubmitLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeSection]);

  // Listen to points, balance, and task updates from /dashboard/earn, AdminPanel, and other tabs
  useEffect(() => {
    const handleEventUpdate = () => {
      loadDashboardData();
    };

    const handleTasksUpdated = (e?: any) => {
      const detail = e?.detail;
      if (detail?.deletedId) {
        setAvailableTasks((prev) => prev.filter((t) => t.id !== detail.deletedId));
      }
      if (detail?.taskId && detail?.status && detail.status !== 'active') {
        setAvailableTasks((prev) => prev.filter((t) => t.id !== detail.taskId));
      }
      loadDashboardData();
    };

    window.addEventListener('balanceUpdated', handleEventUpdate);
    window.addEventListener('pointsUpdated', handleEventUpdate);
    window.addEventListener('tasks_updated', handleTasksUpdated);
    window.addEventListener('storage', handleTasksUpdated);

    // Supabase Real-time microtasks listener for User Dashboard
    const unsubMicro = subscribeToMicrotasks(() => {
      loadDashboardData();
    });

    return () => {
      window.removeEventListener('balanceUpdated', handleEventUpdate);
      window.removeEventListener('pointsUpdated', handleEventUpdate);
      window.removeEventListener('tasks_updated', handleTasksUpdated);
      window.removeEventListener('storage', handleTasksUpdated);
      if (typeof unsubMicro === 'function') unsubMicro();
    };
  }, []);

  // Handle KYC Submission
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycMsg(null);
    try {
      await apiFetch('/api/user/kyc', {
        method: 'POST',
        body: JSON.stringify({
          documentType: kycDocType,
          documentNumber: kycDocNumber,
          notes: kycNotes,
        }),
      });
      setKycMsg({ type: 'success', text: 'Identity documentation submitted for compliance review.' });
      refreshMe();
    } catch (err: any) {
      setKycMsg({ type: 'error', text: err.message || 'Failed to submit KYC' });
    }
  };

  // Handle Withdrawal Request
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    const amountNum = Number(withdrawAmount);
    const minLimit = withdrawMethod === 'USDT / Binance Pay' ? 1.0 : 0.5;
    const currentBalance = Math.max(wallet?.availableBalance ?? 0, liveAvailableBalance);

    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      setWithdrawMsg({ type: 'error', text: 'Please enter a valid positive withdrawal amount.' });
      return;
    }
    if (amountNum < minLimit) {
      setWithdrawMsg({
        type: 'error',
        text: `Minimum withdrawal amount for ${withdrawMethod} is $${minLimit.toFixed(2)}.`,
      });
      return;
    }
    if (amountNum > currentBalance) {
      setWithdrawMsg({
        type: 'error',
        text: `Insufficient balance. Your available balance is $${currentBalance.toFixed(2)}, but you requested $${amountNum.toFixed(2)}.`,
      });
      return;
    }
    if (!accountDetails.trim()) {
      setWithdrawMsg({
        type: 'error',
        text: 'Please enter your account number or wallet identifier.',
      });
      return;
    }

    try {
      const res = await apiFetch('/api/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod: withdrawMethod,
          accountDetails: {
            emailOrWalletAddress: accountDetails.trim(),
            accountNumber: accountDetails.trim(),
          },
        }),
      });
      setWithdrawMsg({
        type: 'success',
        text: res.message || 'Withdrawal request submitted successfully with status Pending.',
      });
      setWithdrawAmount('');
      setAccountDetails('');
      refreshMe();
      loadDashboardData();
    } catch (err: any) {
      setWithdrawMsg({ type: 'error', text: err.message || 'Failed to request withdrawal' });
    }
  };

  // Handle New Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          title: srvTitle,
          category: srvCategory,
          description: srvDesc,
          basicPrice: Number(srvPrice),
          basicDeliveryDays: Number(srvDays),
        }),
      });
      setShowNewSrvModal(false);
      setSrvTitle('');
      setSrvDesc('');
      setSrvPrice('');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to create service');
    }
  };

  // Handle Support Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        subject: ticketSubject,
        category: ticketCategory,
        description: ticketDesc,
        userName: user?.fullName || (user as any)?.name || 'Member',
        email: user?.email || '',
      };

      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => null);

      // Save to localStorage for instant synchronization across tabs
      try {
        const rawLocal = localStorage.getItem('nexvora_support_tickets');
        let localTickets: any[] = rawLocal ? JSON.parse(rawLocal) : [];
        const ticketNum = res?.ticket?.ticketNumber || `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        const localObj = {
          id: res?.ticket?.id || `tkt_${Date.now()}`,
          ticketNumber: ticketNum,
          raisedById: user?.id || 'guest',
          userName: user?.fullName || (user as any)?.name || 'Member',
          userEmail: user?.email || '',
          category: ticketCategory,
          subject: ticketSubject,
          description: ticketDesc,
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: [],
        };
        localTickets.unshift(localObj);
        localStorage.setItem('nexvora_support_tickets', JSON.stringify(localTickets));
        window.dispatchEvent(new Event('tickets_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.warn('Local ticket save notice:', err);
      }

      setTicketMsg('Support ticket logged successfully! Our team will review and reply shortly.');
      setTicketSubject('');
      setTicketDesc('');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to create ticket');
    }
  };

  const quickNavTabs = [
    {
      id: 'earn',
      label: '🔥 Micro-Tasks',
      icon: Flame,
      badge: 'HOT',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'tasks',
      label: '✅ Verified Tasks',
      icon: CheckSquare,
      badge: 'Escrow',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'courses',
      label: '🎓 Academy Courses',
      icon: BookOpen,
      badge: 'Udemy',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'bonus',
      label: '🎁 Daily Bonus',
      icon: Gift,
      badge: '$0.01 Free',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'withdrawals',
      label: '💰 Withdraw',
      icon: ArrowUpRight,
      badge: 'Fast',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'products',
      label: '📦 Products',
      icon: Package,
      badge: 'NEW',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'overview',
      label: '📊 Overview',
      icon: LayoutDashboard,
      badge: null,
      badgeBg: '',
    },
    {
      id: 'wallet',
      label: '💳 Wallet',
      icon: Wallet,
      badge: null,
      badgeBg: '',
    },
    {
      id: 'referral',
      label: '👥 Invite & Earn',
      icon: Users,
      badge: '20%',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'profile',
      label: '👤 Profile & KYC',
      icon: User,
      badge: null,
      badgeBg: '',
    },
    {
      id: 'support',
      label: '💬 Support',
      icon: HelpCircle,
      badge: null,
      badgeBg: '',
    },
  ];

  const isAdminUser = Boolean(
    user && (user.email === 'admin@nexvora.global' || user.role === 'SUPER ADMIN' || user.role === 'ADMIN')
  );

  const navItems = [
    { id: 'earn', label: 'Earn / Micro-Tasks', icon: Flame, badge: 'HOT' },
    { id: 'tasks', label: 'Verified Paid Tasks', icon: CheckSquare },
    { id: 'courses', label: 'Academy Courses', icon: BookOpen },
    { id: 'products', label: 'Digital Products', icon: Package, badge: 'NEW' },
    { id: 'bonus', label: 'Daily Bonus', icon: Gift, badge: '$0.01' },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight, badge: 'Fast' },
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Marketplace Hub', icon: Package, badge: 'Verified' },
    { id: 'profile', label: 'Profile & KYC', icon: User },
    ...(isAdminUser
      ? [
          { id: 'services', label: 'My Services', icon: Layers },
          { id: 'jobs', label: 'Freelance Marketplace', icon: Briefcase, isExternal: true },
        ]
      : []),
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'affiliate', label: 'Affiliate Center', icon: Share2 },
    { id: 'referral', label: 'Invite & Earn', icon: Users },
    { id: 'wallet', label: 'Wallet & Ledger', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: ArrowDownLeft },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support & Tickets', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto shadow-2xl">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-800 text-cyan-400">
              Authentication Required
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              Nexvora Portal
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Sign In to Access Dashboard & Verified Marketplace
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Please log in to your account to access verified tasks, manage service orders, track earnings, and withdraw from your wallet.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors shadow-lg"
          >
            Sign In Now
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
          >
            Create Free Account
          </button>
        </div>
      </div>
    );
  }

  const currentNavItem = navItems.find((item) => item.id === activeSection) || navItems[0];
  const CurrentNavIcon = currentNavItem?.icon || LayoutDashboard;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Mobile Top Navigation & Quick Switcher Bar (Visible only on mobile/tablet < lg) */}
      <div className="lg:hidden mb-6 space-y-3">
        {/* Compact Mobile Section Header & Hamburger Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
              <CurrentNavIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs truncate">
                  {currentNavItem?.label || 'Dashboard'}
                </span>
                {currentNavItem?.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {currentNavItem.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Bal: <strong className="text-emerald-400 font-mono font-bold">${liveFormattedUsd}</strong> ({liveFormattedPoints} PTS)
              </p>
            </div>
          </div>

          <button
            id="mobile-dashboard-nav-toggle"
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shrink-0 shadow-sm transition-colors cursor-pointer"
          >
            {mobileNavOpen ? (
              <>
                <X className="w-4 h-4 text-cyan-400" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4 text-cyan-400" />
                <span>Menu</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Horizontal Scrollable Tabs for Instant 1-Tap Switching */}
        <div
          ref={mobileQuickNavRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth snap-x touch-pan-x text-xs"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {quickNavTabs.map((item) => {
            const Icon = item.icon;
            const isActive = isTabActive(item.id);
            return (
              <button
                key={item.id}
                ref={isActive ? activeTabMobileRef : null}
                onClick={() => handleQuickTabClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 snap-start transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 text-white font-bold shadow-md shadow-cyan-950/40 border border-cyan-400/50 scale-[1.02]'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 text-[8px] font-bold rounded ${
                    isActive ? 'bg-white/20 text-white' : item.badgeBg || 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 cursor-pointer"
          >
            <span>All ({navItems.length}) ▾</span>
          </button>
        </div>

        {/* Expandable Mobile Navigation Menu Drawer as Modal Overlay */}
        {mobileNavOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="fixed inset-x-3 top-20 max-h-[82vh] z-50 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-cyan-700/60 shadow-2xl overflow-y-auto space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Profile Summary Card inside drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-inner">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-white text-xs truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">@{user?.username} • <span className="text-cyan-400 font-semibold">{user?.role}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-xs font-mono block">
                      ${liveFormattedUsd}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {liveFormattedPoints} PTS
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of All Navigation Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleSubnav(item.id);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-600 text-white font-bold shadow-md'
                          : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.isExternal ? (
                          <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                        ) : (
                          <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-30'}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dashboard Shell Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Nav (Hidden on mobile < lg) */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          {/* User ID card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="font-bold text-white text-sm truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">@{user?.username}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Quick Wallet Glance */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Available Balance:</span>
              <div className="text-right">
                <span className="font-bold text-emerald-400 text-sm font-['Space_Grotesk'] block">
                  ${liveFormattedUsd}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {liveFormattedPoints} PTS
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="p-2 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`dash-tab-${item.id}`}
                  onClick={() => handleSubnav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.isExternal ? (
                      <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 text-indigo-400" />
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-30'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Desktop Top Horizontal Quick Navigation Bar */}
          <div className="hidden lg:flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm backdrop-blur-sm">
            <div
              ref={desktopQuickNavRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full"
            >
              {quickNavTabs.map((item) => {
                const Icon = item.icon;
                const isActive = isTabActive(item.id);
                return (
                  <button
                    key={item.id}
                    ref={isActive ? activeTabDesktopRef : null}
                    onClick={() => handleQuickTabClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 text-white font-bold shadow-md shadow-cyan-950/40 border border-cyan-400/50 scale-[1.02]'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.2 text-[8px] font-bold rounded ${
                        isActive ? 'bg-white/20 text-white' : item.badgeBg || 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">User Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real accounting records and activity statistics.</p>
                </div>
                <button
                  onClick={loadDashboardData}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* Stat Cards - Display live user balance and accounting figures */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Available Balance</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1 font-['Space_Grotesk']">
                    ${liveFormattedUsd}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">{liveFormattedPoints} PTS Verified</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Pending Escrow</span>
                  <p className="text-xl font-bold text-amber-400 mt-1 font-['Space_Grotesk']">
                    ${(stats?.pendingBalance || livePendingBalance || 0).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">In review / Escrow</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Lifetime Earned</span>
                  <p className="text-xl font-bold text-cyan-400 mt-1 font-['Space_Grotesk']">
                    ${Math.max(stats?.totalEarned || 0, liveTotalEarned).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Cumulative approved</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Total Withdrawn</span>
                  <p className="text-xl font-bold text-purple-400 mt-1 font-['Space_Grotesk']">
                    ${(stats?.totalWithdrawn || liveTotalWithdrawn || 0).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Processed payouts</span>
                </div>
              </div>

              {/* Live Real-Time Microtasks Feed (Positioned directly below balance metrics) */}
              <div id="live-verified-microtasks-feed" className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-4 sm:space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <h3 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                        Live Verified Microtasks (লাইভ ভেরিফাইড মাইক্রোটাস্ক)
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] sm:text-[11px] font-bold shrink-0">
                        100% Escrow Protected
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      সহজ টাস্ক সম্পন্ন করুন, সিক্রেট কোড সাবমিট করুন এবং সাথে সাথে ওয়ালেটে ডলার ইনকাম গ্রহণ করুন।
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/marketplace?tab=tasks')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-800 transition-colors shrink-0 cursor-pointer"
                  >
                    View All Tasks in Marketplace <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {availableTasks.length === 0 ? (
                  <div className="py-10 sm:py-12 px-4 sm:px-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
                    <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="font-bold text-slate-200 text-sm">No microtasks active at this moment</p>
                    <p className="text-slate-400 text-xs max-w-md mx-auto">
                      All sample tasks have been removed. Live advertiser tasks will display here with real-time slot tracking, direct work links, and instant proof submission.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {availableTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStartTask={(t) => {
                          setSelectedTaskForProof(t);
                          setTaskSubmitMsg(null);
                        }}
                        isLoggedIn={!!user}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* TimeWall Earn / Micro-Tasks Offerwall Banner */}
              <div
                onClick={() => handleSubnav('earn')}
                className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/30 hover:border-amber-400/60 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-['Space_Grotesk'] group-hover:text-amber-300 transition-colors">
                        Earn / Micro-Tasks (TimeWall)
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        HOT OFFERS
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complete high-paying surveys, clicks, testing & micro-tasks. Automatic postback credit directly to your points balance.
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubnav('earn');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md transition cursor-pointer"
                >
                  <span>Open Offerwall</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* In-House Daily Login Bonus Card ($0.01 / 24h) */}
              <DailyBonusCard onClaimSuccess={loadDashboardData} />

              {/* MARKETPLACE Quick-Access Section */}
              <div id="dashboard-marketplace-section" className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 scroll-mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk']">
                          Marketplace
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                          Instant Access
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Explore verified services, freelance job listings, paid microtasks, and digital resources.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      4 Marketplace Hubs
                    </span>
                  </div>
                </div>

                {/* Quick-Access Navigation Tabs / Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Earn / Micro-Tasks */}
                  <div
                    id="dash-marketplace-earn"
                    onClick={() => handleSubnav('earn')}
                    className="group relative p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-950 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-900/50 transition-all">
                          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-medium text-amber-400 flex items-center gap-0.5">
                          HOT <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        Earn / Micro-Tasks
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        High-yield offerwalls, Monetag, Adsterra, and fast-crediting microtasks.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Instant Points</span>
                      <span className="font-semibold text-amber-400">Start Earning →</span>
                    </div>
                  </div>

                  {/* 2. Verified Paid Tasks */}
                  <div
                    id="dash-marketplace-tasks"
                    onClick={() => handleSubnav('tasks')}
                    className="group relative p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-950 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-900/50 transition-all">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
                          Explore <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Verified Paid Tasks
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        100% verified manual microtasks with escrow review and direct wallet payouts.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Escrow Protected</span>
                      <span className="font-semibold text-emerald-400">View Tasks →</span>
                    </div>
                  </div>

                  {/* 3. Academy Courses */}
                  <div
                    id="dash-marketplace-courses"
                    onClick={() => handleSubnav('courses')}
                    className="group relative p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-950 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-900/50 transition-all">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 group-hover:text-indigo-400 flex items-center gap-0.5 transition-colors">
                          Udemy <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        Academy Courses
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Accredited skill training in SEO, AI Engineering, Full-Stack Development & Marketing.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Certified Skills</span>
                      <span className="font-semibold text-indigo-400">Learn Now →</span>
                    </div>
                  </div>

                  {/* 4. Digital Products & SOPs */}
                  <div
                    id="dash-marketplace-products"
                    onClick={() => handleSubnav('products')}
                    className="group relative p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-950 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-900/50 transition-all">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 group-hover:text-purple-400 flex items-center gap-0.5 transition-colors">
                          Explore <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                        Digital Products & SOPs
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Marketing blueprints, funnel templates, software assets & manuals.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Digital Vault</span>
                      <span className="font-semibold text-purple-400">View Products →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prominent "Invite & Earn" Referral Section */}
              <InviteAndEarnCard
                referralCode={user?.referralCode || referralData.referralCode}
                serverProvidedAppUrl={referralData.appUrl}
                serverProvidedReferralLink={referralData.referralLink}
                totalReferrals={referralData.totalReferrals}
                qualifiedCount={referralData.qualifiedCount}
                rewardsEarned={referralData.rewardsEarned}
              />

              {/* Work Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">My Services</span>
                  <p className="text-lg font-bold text-white mt-1">{stats.activeServicesCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">My Jobs / Projects</span>
                  <p className="text-lg font-bold text-white mt-1">{stats.activeJobsCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Tasks Submitted</span>
                  <p className="text-lg font-bold text-white mt-1">{stats.submittedTasksCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Tasks Approved</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{stats.approvedTasksCount}</p>
                </div>
              </div>

              {/* Quick Actions & Recent Transactions */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Ledger Transactions</h3>
                  <button
                    onClick={() => handleSubnav('transactions')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    View Full Ledger →
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No transactions recorded yet. Complete verified work or refer members to earn.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-white">{tx.description}</p>
                          <span className="text-[10px] text-slate-500">
                            {new Date(tx.createdAt).toLocaleString()} • Type: {tx.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold font-['Space_Grotesk'] text-sm ${
                              tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.amount >= 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </span>
                          <p className="text-[10px] text-slate-500">Balance: ${tx.balanceAfter.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: PROFILE & KYC */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Profile & Identity Verification</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage professional details and KYC compliance credentials.</p>
              </div>

              {/* KYC Status Banner */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">KYC Status:</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                        profile?.kycStatus === 'verified'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : profile?.kycStatus === 'pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {profile?.kycStatus || 'Unsubmitted'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {profile?.kycStatus === 'verified'
                      ? 'Identity verified. Payouts and withdrawals are fully authorized.'
                      : profile?.kycStatus === 'pending'
                      ? 'Your verification documents are currently under review by compliance staff.'
                      : 'Complete KYC verification to unlock seamless withdrawals.'}
                  </p>
                </div>
              </div>

              {/* KYC Form (if unsubmitted or rejected) */}
              {profile?.kycStatus !== 'verified' && (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Submit Official KYC Identification</h3>
                  {kycMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs ${
                        kycMsg.type === 'success'
                          ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {kycMsg.text}
                    </div>
                  )}
                  <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Document Type</label>
                      <select
                        value={kycDocType}
                        onChange={(e) => setKycDocType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      >
                        <option value="National ID / NID">National ID / NID Card</option>
                        <option value="International Passport">International Passport</option>
                        <option value="Driver License">Driver&apos;s License</option>
                        <option value="Taxpayer Identification (TIN)">Taxpayer Identification / TIN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Document Number</label>
                      <input
                        type="text"
                        required
                        value={kycDocNumber}
                        onChange={(e) => setKycDocNumber(e.target.value)}
                        placeholder="e.g. 5928192019"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Notes / Issuing Authority</label>
                      <input
                        type="text"
                        value={kycNotes}
                        onChange={(e) => setKycNotes(e.target.value)}
                        placeholder="e.g. Govt of Bangladesh / Election Commission"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                    >
                      Submit Verification Documents
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Section: MY SERVICES */}
          {activeSection === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">My Marketing Services</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Services you offer to clients on Nexvora.</p>
                </div>
                {isAdminUser && (
                  <button
                    onClick={() => setShowNewSrvModal(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Service
                  </button>
                )}
              </div>

              {myServices.length === 0 ? (
                <div className="space-y-6">
                  <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                    <p className="font-semibold text-white">No custom services published by your account yet.</p>
                    <p className="text-slate-500 mt-1">Publish graphics, photo editing, SEO, or social media services to get hired by global clients.</p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Platform Showcase Service
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ServiceCard
                        service={{
                          id: 'srv_photo_001',
                          userId: 'usr_superadmin_001',
                          title: 'Background Removal & Bulk Photo Editing',
                          slug: 'background-removal-bulk-photo-editing',
                          category: 'Graphics & Design',
                          description:
                            'Professional e-commerce product background removal and high-volume photo editing. Get clean transparent PNG cutouts, 100% pure Amazon/eBay/Shopify compliant white backgrounds, and razor-sharp hand-drawn clipping paths for high-converting store listings.',
                          pricingTier: {
                            basicPrice: 5.0,
                            basicDeliveryDays: 1,
                            basicDescription:
                              '10 E-Commerce Products: Precise clipping path, pure white (#FFFFFF) or transparent PNG, shadow creation & web-ready export.',
                          },
                          tags: [
                            'Background Removal',
                            'Bulk Photo Editing',
                            'Transparent PNG',
                            'White Background',
                            'Clipping Path',
                            'E-Commerce Editing',
                          ],
                          features: [
                            'Transparent PNG (Alpha Cutout)',
                            'Pure White Background (#FFFFFF Amazon & Shopify Standard)',
                            'Hand-Drawn Precise Clipping Path',
                            'Bulk Photo Editing & High-Volume Processing',
                            'Natural, Drop & Reflection Shadow Creation',
                          ],
                          fiverrUrl: 'https://www.fiverr.com/mdmijan4',
                          rating: 5.0,
                          reviewsCount: 148,
                          sellerName: 'Mijanur Rahman (mdmijan4)',
                          sellerUsername: 'mdmijan4',
                          status: 'active',
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        }}
                        featured={true}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myServices.map((s) => (
                    <ServiceCard key={s.id} service={s} featured={s.id === 'srv_photo_001'} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: MY JOBS & LIVE FREELANCE MARKETPLACE */}
          {activeSection === 'jobs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Freelance Projects & Client Jobs</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Explore live client contracts from Freelancer.com API standard feed or manage your posted jobs.</p>
                </div>
              </div>

              {/* Live Freelancer.com Projects Feed */}
              <FreelanceMarketplaceView onNavigate={navigate} isLoggedIn={!!user} />

              {/* My Posted Jobs Accordion / Section */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>My Locally Posted Projects ({myJobs.length})</span>
                </h3>

                {myJobs.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-slate-400 text-xs">
                    <p className="font-semibold text-white">No custom local jobs posted yet.</p>
                    <p className="text-slate-500 mt-1">Post a freelance project requirement from the marketplace board to hire marketing and engineering talent.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myJobs.map((j) => (
                      <div key={j.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-white text-sm">{j.title}</h4>
                          <p className="text-slate-400 mt-0.5">Budget: ${j.budget} • Proposals: {j.proposalsCount}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-400 font-medium">
                          {j.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: MY ORDERS */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">My Orders</h2>
                <p className="text-xs text-slate-400 mt-0.5">Direct client contracts and digital product deliveries.</p>
              </div>

              <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-white text-sm">No data available yet.</p>
                <p className="text-slate-500 mt-1">When clients purchase your services or you buy digital goods, contracts appear here.</p>
              </div>
            </div>
          )}

          {/* Section: EARN / MICRO-TASKS (TIMEWALL) */}
          {(activeSection === 'earn' || activeSection === 'timewall' || activeSection === 'micro-tasks') && (
            <EarnMicroTasksView />
          )}

          {/* Section: DAILY BONUS & STREAK REWARDS */}
          {activeSection === 'bonus' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950 border border-purple-800 text-purple-400">
                      Daily Reward Program
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      7-Day Multiplier
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-1">
                    Daily Login Bonus & Streak Rewards
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Claim free instant wallet cash every 24 hours. Keep your daily streak active to unlock jackpot milestone rewards.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSubnav('earn')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Earn Micro-Tasks</span>
                  </button>
                  <button
                    onClick={() => handleSubnav('withdrawals')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Daily Bonus Card */}
              <DailyBonusCard onClaimSuccess={loadDashboardData} />

              {/* 7-Day Streak Roadmap / Milestones */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk']">
                      7-Day Consecutive Streak Roadmap
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    Auto-Credited to Balance
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {[
                    { day: 1, reward: '$0.01', pts: '10 PTS', label: 'Day 1' },
                    { day: 2, reward: '$0.015', pts: '15 PTS', label: 'Day 2' },
                    { day: 3, reward: '$0.02', pts: '20 PTS', label: 'Day 3' },
                    { day: 4, reward: '$0.025', pts: '25 PTS', label: 'Day 4' },
                    { day: 5, reward: '$0.03', pts: '30 PTS', label: 'Day 5' },
                    { day: 6, reward: '$0.04', pts: '40 PTS', label: 'Day 6' },
                    { day: 7, reward: '$0.075', pts: '75 PTS', label: 'Jackpot', isJackpot: true },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        item.isJackpot
                          ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/50 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <span className={`text-[10px] font-bold block ${item.isJackpot ? 'text-amber-400' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                      <p className="text-sm font-bold text-white mt-1 font-mono">{item.reward}</p>
                      <span className="text-[9px] text-slate-500 block font-mono mt-0.5">{item.pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section: MARKETPLACE HUB */}
          {activeSection === 'marketplace' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-800 text-cyan-400">
                      Verified Ecosystem
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                      Instant Access
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-1">
                    Verified Marketplace Hub
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explore marketing services, digital product downloads, paid microtasks, and global freelance contracts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSubnav('services')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>My Services</span>
                  </button>
                  <button
                    onClick={() => handleSubnav('earn')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Micro-Tasks</span>
                  </button>
                </div>
              </div>

              {/* 4 Marketplace Category Hub Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div
                  onClick={() => handleSubnav('earn')}
                  className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-all">
                        <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-medium text-amber-400 flex items-center gap-0.5">
                        HOT <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      Earn / Micro-Tasks
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Monetag, Adsterra, TimeWall offerwalls, surveys & quick reward engines.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleSubnav('tasks')}
                  className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-all">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
                        Verified <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Verified Paid Tasks
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Escrow-backed manual tasks, direct payouts, and verified partner jobs.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleSubnav('courses')}
                  className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-all">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 group-hover:text-indigo-400 flex items-center gap-0.5 transition-colors">
                        Udemy <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                      Academy Courses
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Accredited masterclasses in SEO, AI Engineering, Full-Stack & Copywriting.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleSubnav('products')}
                  className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-all">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 group-hover:text-purple-400 flex items-center gap-0.5 transition-colors">
                        Instant <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                      Digital Products Store
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      E-books, prompt packs, code kits, and ready-to-use digital assets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital Products Section Embed */}
              <div className="pt-2">
                <DigitalProductsSection />
              </div>
            </div>
          )}

          {/* Section: VERIFIED MARKETPLACE & MY TASKS */}
          {(activeSection === 'tasks' || activeSection === 'microtasks' || activeSection === 'surveys' || activeSection === 'offers' || activeSection === 'cpalead' || activeSection === 'cpalead-offers' || activeSection === 'ptc' || activeSection === 'youtube') && (
            <VerifiedMarketplaceView />
          )}

          {/* Section: MY COURSES */}
          {activeSection === 'courses' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">My Courses & Certifications</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enrolled learning modules and lesson completion.</p>
              </div>

              <div className="p-10 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-white">No active course enrollments yet.</p>
                <p className="text-slate-500 mt-1">Visit Nexvora Academy to enroll in technical SEO, PPC, or copywriting courses.</p>
                <button
                  onClick={() => openUdemyAffiliate()}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Courses on Udemy</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Section: DIGITAL PRODUCTS & TEMPLATES */}
          {(activeSection === 'products' || activeSection === 'digital-products') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Digital Products & Assets</h2>
                <p className="text-xs text-slate-400 mt-0.5">Explore digital downloads, creative assets, and resources.</p>
              </div>

              <DigitalProductsSection onNavigate={navigate} />
            </div>
          )}

          {/* Section: AFFILIATE CENTER */}
          {activeSection === 'affiliate' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Affiliate Center</h2>
                <p className="text-xs text-slate-400 mt-0.5">Promote verified software tools and earn performance commissions.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <h3 className="font-bold text-white">Your Affiliate Referral Identifier</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://nexvora.global/?ref=${user?.referralCode || 'AFF'}`}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-mono text-xs"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://nexvora.global/?ref=${user?.referralCode || 'AFF'}`);
                      alert('Affiliate link copied to clipboard!');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 shrink-0"
                  >
                    Copy Link
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Commissions are credited directly to your wallet upon verified customer payment completion.
                </p>
              </div>
            </div>
          )}

          {/* Section: INVITE & EARN / REFERRAL CENTER */}
          {activeSection === 'referral' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Invite & Earn Program</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Share your exclusive referral link to earn verified bonuses when invitees complete qualified marketplace milestones.
                </p>
              </div>

              {/* Main Invite & Earn Card */}
              <InviteAndEarnCard
                referralCode={user?.referralCode || referralData.referralCode}
                serverProvidedAppUrl={referralData.appUrl}
                serverProvidedReferralLink={referralData.referralLink}
                totalReferrals={referralData.totalReferrals}
                qualifiedCount={referralData.qualifiedCount}
                rewardsEarned={referralData.rewardsEarned}
              />

              {/* How It Works - 3 Step Flow */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">How Qualified Referrals Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <p className="font-semibold text-white">Share Your Link</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Copy your link or click Share to invite colleagues, freelancers, and marketers.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold flex items-center justify-center text-xs">
                      2
                    </div>
                    <p className="font-semibold text-white">Friend Registers & Works</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      The referral code is preserved on registration. When your invitee completes approved tasks, qualification triggers.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                    <p className="font-semibold text-white">Automated Wallet Credit</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Upon qualified work milestone completion, bonuses are credited directly to your authoritative financial balance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real Referred Members List */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    Your Referred Members ({referralData.referrals?.length || 0})
                  </h3>
                  <span className="text-[11px] text-slate-500">Real database records</span>
                </div>

                {!referralData.referrals || referralData.referrals.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                    <Users className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="font-medium text-slate-400">No referred members recorded yet.</p>
                    <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                      Share your dynamic referral link above to invite colleagues and earn verified milestone rewards!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                          <th className="pb-3 font-medium">Member Name</th>
                          <th className="pb-3 font-medium">Date Joined</th>
                          <th className="pb-3 font-medium">Milestone Status</th>
                          <th className="pb-3 font-medium text-right">Bonus Disbursed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {referralData.referrals.map((item: any) => (
                          <tr key={item.id} className="text-slate-300">
                            <td className="py-3">
                              <p className="font-medium text-white">{item.name}</p>
                              {item.username && (
                                <p className="text-[10px] text-slate-500 font-mono">@{item.username}</p>
                              )}
                            </td>
                            <td className="py-3 text-slate-400">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              {item.status === 'qualified_work_completed' || item.status === 'rewarded' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Qualified Milestone
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  Registered (Pending Work)
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              {item.rewardPaid ? (
                                <span className="font-semibold text-emerald-400 font-['Space_Grotesk']">
                                  +${item.rewardAmount.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">
                                  Pending ($2.00)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: WALLET & LEDGER */}
          {activeSection === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Wallet & Financial Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5">Authoritative balance breakdown and immutable accounting ledger.</p>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
                  <span className="text-xs text-emerald-300 font-semibold">Available to Withdraw</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1 font-['Space_Grotesk']">
                    ${liveFormattedUsd}
                  </p>
                  <span className="text-[10px] text-emerald-500 font-mono">{liveFormattedPoints} PTS live</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Pending Escrow</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1 font-['Space_Grotesk']">
                    ${(wallet?.pendingBalance || livePendingBalance || 0).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Under review period</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Lifetime Earned</span>
                  <p className="text-2xl font-bold text-cyan-400 mt-1 font-['Space_Grotesk']">
                    ${Math.max(wallet?.totalEarned || 0, liveTotalEarned).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Total approved</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Total Withdrawn</span>
                  <p className="text-2xl font-bold text-purple-400 mt-1 font-['Space_Grotesk']">
                    ${(wallet?.totalWithdrawn || liveTotalWithdrawn || 0).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Disbursed to date</span>
                </div>
              </div>

              {/* Daily Login Bonus Claim Card */}
              <DailyBonusCard onClaimSuccess={loadDashboardData} />

              <div className="flex gap-3">
                <button
                  onClick={() => handleSubnav('withdrawals')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" /> Request Withdrawal
                </button>
                <button
                  onClick={() => handleSubnav('transactions')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
                >
                  View Full Transaction History
                </button>
              </div>
            </div>
          )}

          {/* Section: TRANSACTIONS */}
          {activeSection === 'transactions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Transaction History</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ledger of all debits, credits, commissions, and refunds.
                </p>
              </div>

              {transactions.length === 0 ? (
                <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                  <ArrowDownLeft className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-white text-sm">No transactions available yet.</p>
                  <p className="text-slate-500 mt-1">Transactions are created strictly upon approved earnings or processed withdrawals.</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">Transaction ID</th>
                        <th className="pb-3 font-semibold">Date & Time</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Description</th>
                        <th className="pb-3 font-semibold text-right">Amount</th>
                        <th className="pb-3 font-semibold text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="text-slate-300">
                          <td className="py-3 font-mono text-[11px] text-slate-500">{tx.id}</td>
                          <td className="py-3 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-semibold">
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 max-w-xs truncate">{tx.description}</td>
                          <td
                            className={`py-3 text-right font-bold font-['Space_Grotesk'] ${
                              tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.amount >= 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </td>
                          <td className="py-3 text-right font-medium text-slate-400">
                            ${tx.balanceAfter.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section: WITHDRAWALS */}
          {activeSection === 'withdrawals' && (
            <WithdrawalsView navigate={navigate} onBalanceUpdated={loadDashboardData} />
          )}

          {/* Section: MESSAGES */}
          {activeSection === 'messages' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Direct Messaging</h2>
                <p className="text-xs text-slate-400 mt-0.5">Secure communication with clients, freelancers, and support.</p>
              </div>

              {messages.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-white">No messages available yet.</p>
                  <p className="text-slate-500 mt-1">Conversations with clients and team members appear here.</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <p className="text-slate-300">{m.content}</p>
                      <span className="text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Notifications</h2>
                <p className="text-xs text-slate-400 mt-0.5">System, milestone, task, and withdrawal updates.</p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-white">No notifications available yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 text-xs flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{n.title}</h4>
                        <p className="text-slate-400 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: SUPPORT & TICKETS */}
          {activeSection === 'support' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Support & Dispute Center</h2>
                <p className="text-xs text-slate-400 mt-0.5">Submit questions, milestone disputes, or order reviews.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Open a Support Ticket</h3>
                {ticketMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs">
                    {ticketMsg}
                  </div>
                )}
                <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Question about task verification"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="account">Account & KYC</option>
                      <option value="task_submission">Task Verification Review</option>
                      <option value="payment">Payment / Withdrawal</option>
                      <option value="order_issue">Milestone / Contract Dispute</option>
                      <option value="other">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Description</label>
                    <textarea
                      rows={4}
                      required
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      placeholder="Please provide full details so our support team can resolve quickly..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Your Support Inquiries ({tickets.length})</h3>
                  <button
                    type="button"
                    onClick={loadDashboardData}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Refresh Status
                  </button>
                </div>

                {tickets.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                    No support tickets or disputes filed.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((t) => {
                      const hasReply = Boolean(t.adminReply || (t.replies && t.replies.length > 0));
                      return (
                        <div key={t.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                                {t.ticketNumber}
                              </span>
                              <span className="font-semibold text-white">{t.subject}</span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                t.status === 'resolved'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : t.status === 'replied'
                                  ? 'bg-purple-950 text-purple-400 border border-purple-800'
                                  : t.status === 'under_review'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Your Issue Description:</p>
                            <p className="whitespace-pre-wrap">{t.description}</p>
                            <span className="block text-[10px] text-slate-500 mt-2">
                              Submitted on: {new Date(t.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {/* Staff Response Box */}
                          {hasReply && (
                            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                                  🛡️ Official Staff Response:
                                </span>
                                {t.updatedAt && (
                                  <span className="text-[10px] text-purple-400/80">
                                    {new Date(t.updatedAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-200 pl-3 border-l-2 border-purple-500/60 whitespace-pre-wrap">
                                {t.adminReply || (t.replies && t.replies[t.replies.length - 1]?.message)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: SETTINGS */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Account Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage security, credentials, and notification preferences.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-white">Account Details</h3>
                <div className="space-y-2 text-slate-300">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Username:</strong> @{user?.username}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                  <p><strong>Referral Code:</strong> {user?.referralCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE SERVICE MODAL */}
      {showNewSrvModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Publish Marketing Service</h3>
                <p className="text-xs text-slate-400">Offer your expertise to global clients</p>
              </div>
              <button onClick={() => setShowNewSrvModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  placeholder="e.g. Technical SEO Audit & Core Web Vitals Optimization"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  >
                    <option value="SEO & SEM">SEO & SEM</option>
                    <option value="Social Media Marketing">Social Media Marketing</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="Email Marketing">Email Marketing</option>
                    <option value="Performance Ads">Performance Ads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Starting Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Scope & Deliverables</label>
                <textarea
                  rows={4}
                  required
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  placeholder="Outline what the client receives, delivery timeline, and revision limits..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSrvModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Publish Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details & Proof Submission Popup Modal */}
      <TaskDetailModal
        task={selectedTaskForProof}
        onClose={() => {
          setSelectedTaskForProof(null);
          setTaskSubmitMsg(null);
        }}
        onSuccessSubmit={() => {
          loadDashboardData();
        }}
        isLoggedIn={!!user}
      />
    </div>
  );
};
