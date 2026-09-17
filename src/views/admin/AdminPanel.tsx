import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
  Settings,
  Activity,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Plus,
  Lock,
  Trash2,
  PowerOff,
  Power,
  ExternalLink,
  ShoppingBag,
  Briefcase,
  Sparkles,
  Eye,
  Copy,
  Check,
  Wallet,
  Phone,
  Coins,
  Play,
  X,
  Image as ImageIcon,
  ZoomIn,
  Download,
  HelpCircle,
  MessageSquare,
  Database,
  Server,
  HardDrive,
} from 'lucide-react';
import { AdminRewardSettings } from '../../components/AdminRewardSettings';
import { AdminVideoTaskSettings } from '../../components/AdminVideoTaskSettings';
import { AdminSupportTickets } from '../../components/AdminSupportTickets';
import {
  supabase,
  fetchSupabaseMicrotasks,
  insertSupabaseMicrotask,
  updateSupabaseMicrotask,
  toggleSupabaseMicrotaskActive,
  deleteSupabaseMicrotask,
  fetchSupabaseSubmissions,
  updateSupabaseSubmissionStatus,
  deleteSupabaseSubmission,
  fetchSupabaseWithdrawals,
  updateSupabaseWithdrawalStatus,
  deleteSupabaseWithdrawal,
  subscribeToMicrotasks,
  subscribeToSubmissions,
  subscribeToWithdrawals,
  fetchSupabaseProfiles,
  subscribeToProfiles,
  fetchSupabaseTickets,
  subscribeToTickets,
} from '../../lib/supabase';
import type {
  User as UserType,
  Withdrawal,
  Task,
  TaskSubmission,
  PaymentGatewayConfig,
  PlatformStats,
  SystemLog,
  Dispute,
} from '../../types';

interface AdminPanelProps {
  navigate: (path: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ navigate }) => {
  const { user, apiFetch, isAdmin } = useAuth();
  const isAuthorized = Boolean(
    user &&
      (user.email?.toLowerCase() === 'admin@nexvora.global' ||
        user.email?.toLowerCase() === 'mijan889997@gmail.com' ||
        isAdmin ||
        user.role === 'SUPER ADMIN')
  );

  useEffect(() => {
    if (!isAuthorized) {
      const timer = setTimeout(() => {
        navigate(user ? '/dashboard/earn' : '/login');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthorized, user, navigate]);
  const [adminTab, setAdminTab] = useState<
    | 'overview'
    | 'users'
    | 'tasks'
    | 'task_reviews'
    | 'support'
    | 'services'
    | 'jobs'
    | 'products'
    | 'withdrawals'
    | 'kyc'
    | 'ledger'
    | 'gateways'
    | 'affiliate_settings'
    | 'reward_settings'
    | 'video_settings'
    | 'logs'
  >('overview');

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<Withdrawal[]>([]);
  const [supportTickets, setSupportTickets] = useState<Dispute[]>([]);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [gatewaySpecs, setGatewaySpecs] = useState<any[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [kycUsers, setKycUsers] = useState<any[]>([]);

  // Platform items management lists
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);

  // Unified item delete state (Tasks, Submissions, Services, Jobs, Digital Products)
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'task' | 'submission' | 'service' | 'job' | 'product';
    id: string;
    title: string;
    meta?: string;
  } | null>(null);

  // Submissions status filter
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');

  // Action states
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Database Connection Diagnostics
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'checking' | 'degraded'>('checking');
  const [backendDbStatus, setBackendDbStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const [showDbDiagnostics, setShowDbDiagnostics] = useState(false);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);
  const [dbErrorBanner, setDbErrorBanner] = useState<string | null>(null);

  // Rejection modal
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectType, setRejectType] = useState<'withdrawal' | 'task_submission' | 'kyc'>('withdrawal');
  const [rejectionReason, setRejectionReason] = useState('');

  // Complete withdrawal modal
  const [completingWd, setCompletingWd] = useState<Withdrawal | null>(null);
  const [txRefNumber, setTxRefNumber] = useState('');
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [payoutSearch, setPayoutSearch] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Safe Screenshot Lightbox Preview state
  const [activeScreenshotPreview, setActiveScreenshotPreview] = useState<{
    url: string;
    title?: string;
    userName?: string;
    submittedAt?: string;
  } | null>(null);

  // Task delete & deactivation states
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskActionLoading, setTaskActionLoading] = useState<string | null>(null);
  const [taskAnalytics, setTaskAnalytics] = useState<{
    totalTasks: number;
    activeTasks: number;
    totalCompletions: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    totalCoinsDistributed: number;
    totalUsdDistributed: number;
  } | null>(null);
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');

  // New & Edit task modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<string>('PTC (Website Visit)');
  const [newTaskTargetUrl, setNewTaskTargetUrl] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('0.015');
  const [newTaskCoins, setNewTaskCoins] = useState('15');
  const [newTaskTimerSeconds, setNewTaskTimerSeconds] = useState('15');
  const [newTaskYoutubeId, setNewTaskYoutubeId] = useState('');
  const [newTaskSlots, setNewTaskSlots] = useState('100');
  const [newTaskProofRequirements, setNewTaskProofRequirements] = useState('');
  const [newTaskVerificationType, setNewTaskVerificationType] = useState<string>('screenshot_and_text');
  const [newTaskInstructions, setNewTaskInstructions] = useState('1. Open verified link\n2. Complete requested action\n3. Submit proof for verification');

  // New digital product modal
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Marketing SOPs');
  const [newProductPrice, setNewProductPrice] = useState('19.99');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductDownloadUrl, setNewProductDownloadUrl] = useState('');
  const [newProductFileSize, setNewProductFileSize] = useState('2.5');

  const fetchAdminData = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [
        ov,
        us,
        tk,
        wd,
        gw,
        lg,
        ky,
        ts,
        gws,
        srv,
        jb,
        prd,
        tka,
        sbTasks,
        sbSubs,
        sbWds,
        dspRes,
        sbProfiles,
        sbTickets,
      ] = await Promise.all([
        apiFetch('/api/admin/overview').catch((err) => {
          console.error('[Admin API Error] /api/admin/overview failed:', err);
          return { overview: null };
        }),
        apiFetch('/api/admin/users').catch((err) => {
          console.error('[Admin API Error] /api/admin/users failed:', err);
          return { users: [] };
        }),
        apiFetch('/api/admin/tasks').catch((err) => {
          console.error('[Admin API Error] /api/admin/tasks failed:', err);
          return { tasks: [] };
        }),
        apiFetch('/api/admin/withdrawals').catch((err) => {
          console.error('[Admin API Error] /api/admin/withdrawals failed:', err);
          return { withdrawals: [] };
        }),
        apiFetch('/api/admin/payment-gateways').catch((err) => {
          console.error('[Admin API Error] /api/admin/payment-gateways failed:', err);
          return { gateways: [] };
        }),
        apiFetch('/api/admin/audit-logs').catch((err) => {
          console.error('[Admin API Error] /api/admin/audit-logs failed:', err);
          return { audit_logs: [] };
        }),
        apiFetch('/api/admin/verifications').catch((err) => {
          console.error('[Admin API Error] /api/admin/verifications failed:', err);
          return { verifications: [] };
        }),
        apiFetch('/api/admin/task-submissions')
          .catch((err) => {
            console.error('[Admin API Error] /api/admin/task-submissions failed, trying /api/admin/submissions:', err);
            return apiFetch('/api/admin/submissions');
          })
          .catch((err2) => {
            console.error('[Admin API Error] /api/admin/submissions failed:', err2);
            return { submissions: [] };
          }),
        apiFetch('/api/admin/payment-gateways/specifications').catch(() => ({ specifications: [] })),
        apiFetch('/api/services').catch(() => ({ services: [] })),
        apiFetch('/api/jobs').catch(() => ({ jobs: [] })),
        apiFetch('/api/admin/products').catch(() => ({ products: [] })),
        apiFetch('/api/admin/tasks/analytics').catch(() => ({ analytics: null })),
        fetchSupabaseMicrotasks().catch((err) => {
          console.error('[Supabase Error] fetchSupabaseMicrotasks failed:', err);
          return [];
        }),
        fetchSupabaseSubmissions().catch((err) => {
          console.error('[Supabase Error] fetchSupabaseSubmissions failed:', err);
          return [];
        }),
        fetchSupabaseWithdrawals().catch((err) => {
          console.error('[Supabase Error] fetchSupabaseWithdrawals failed:', err);
          return [];
        }),
        apiFetch('/api/admin/disputes')
          .catch(() => apiFetch('/api/admin/support-tickets'))
          .catch(() => ({ disputes: [] })),
        fetchSupabaseProfiles().catch((err) => {
          console.error('[Supabase Error] fetchSupabaseProfiles failed (check RLS):', err);
          return [];
        }),
        fetchSupabaseTickets().catch((err) => {
          console.error('[Supabase Error] fetchSupabaseTickets failed (check RLS):', err);
          return [];
        }),
      ]);

      if (tka?.analytics) {
        setTaskAnalytics(tka.analytics);
      }

      const sbConnected = Array.isArray(sbTasks);
      setSupabaseStatus(sbConnected ? 'connected' : 'degraded');
      setBackendDbStatus(Array.isArray(us?.users) ? 'connected' : 'error');

      const liveDiag = [
        `Authoritative Disk Store: ${us?.users?.length ?? 0} users, ${tk?.tasks?.length ?? 0} tasks, ${wd?.withdrawals?.length ?? 0} withdrawals (data/nexvora.db.json)`,
        `Supabase Cloud: ${sbConnected ? `Active (${sbTasks?.length ?? 0} microtasks, ${sbSubs?.length ?? 0} submissions)` : 'Degraded (RLS / missing tables fallback active)'}`,
        `Local Storage Sync: Active (nexvora_registered_users & nexvora_custom_tasks)`,
      ];
      setDiagnosticsLogs(liveDiag);
      console.info('[Admin Database Diagnostics]:', liveDiag.join(' | '));

      const loadedUsers = us.users || [];
      const loadedTasks = tk.tasks || [];
      const loadedWithdrawals = wd.withdrawals || [];
      const loadedServices = srv?.services || [];
      const loadedJobs = jb?.jobs || [];
      const loadedProducts = prd?.products || [];
      const loadedDisputes: Dispute[] = dspRes?.disputes || dspRes?.tickets || [];

      // Merge backend tickets, Supabase tickets, and localStorage tickets
      let mergedTickets = [...loadedDisputes];
      const existingTicketIds = new Set(mergedTickets.map((t) => t.id || t.ticketNumber));

      // 1. Merge Supabase public.support_tickets
      if (Array.isArray(sbTickets) && sbTickets.length > 0) {
        for (const sbt of sbTickets) {
          if (!existingTicketIds.has(sbt.id) && !existingTicketIds.has(sbt.ticket_number)) {
            const mappedTkt: Dispute = {
              id: sbt.id,
              ticketNumber: sbt.ticket_number,
              raisedById: sbt.user_id || 'guest',
              userName: sbt.user_name || 'Member',
              userEmail: sbt.user_email || '',
              category: sbt.category || 'General',
              subject: sbt.subject,
              description: sbt.description,
              status: (sbt.status || 'open') as any,
              adminReply: sbt.admin_reply,
              resolutionNotes: sbt.resolution_notes,
              createdAt: sbt.created_at,
              updatedAt: sbt.updated_at || sbt.created_at,
              replies: sbt.admin_reply ? [{
                id: `rep_${sbt.id}`,
                senderName: 'Support Staff',
                senderRole: 'admin',
                message: sbt.admin_reply,
                createdAt: sbt.updated_at || sbt.created_at,
              }] : [],
            };
            mergedTickets.unshift(mappedTkt);
            existingTicketIds.add(sbt.id);
          }
        }
      }

      try {
        const rawTickets = localStorage.getItem('nexvora_support_tickets');
        if (rawTickets) {
          const parsedTickets: Dispute[] = JSON.parse(rawTickets);
          if (Array.isArray(parsedTickets)) {
            // Update existing or append new
            const localMap = new Map(parsedTickets.map((t) => [t.id, t]));
            mergedTickets = mergedTickets.map((t) => {
              const match = localMap.get(t.id);
              return match ? { ...t, ...match } : t;
            });

            for (const lt of parsedTickets) {
              if (!existingTicketIds.has(lt.id) && !existingTicketIds.has(lt.ticketNumber)) {
                mergedTickets.unshift(lt);
                existingTicketIds.add(lt.id);
              }
            }
          }
        }
      } catch (e) {
        console.warn('localStorage support tickets parse warning:', e);
      }

      setSupportTickets(mergedTickets);
      setServicesList(loadedServices);
      setJobsList(loadedJobs);
      setProductsList(loadedProducts);

      // Merge backend users, Supabase profiles, and locally registered users
      let mergedUsers: UserType[] = [...loadedUsers];
      const existingUserIds = new Set(mergedUsers.map((u) => u.id));
      const existingUserEmails = new Set(mergedUsers.map((u) => u.email.toLowerCase()));

      // 1. Merge Supabase public.profiles
      if (Array.isArray(sbProfiles) && sbProfiles.length > 0) {
        for (const sbp of sbProfiles) {
          if (!existingUserIds.has(sbp.id) && !existingUserEmails.has(sbp.email.toLowerCase())) {
            const mappedUser: UserType = {
              id: sbp.id,
              email: sbp.email,
              fullName: sbp.full_name || 'Member',
              username: sbp.username || sbp.email.split('@')[0],
              phone: sbp.phone || undefined,
              role: (sbp.role || 'USER') as any,
              status: (sbp.status?.toLowerCase() === 'banned' ? 'banned' : 'active') as any,
              referralCode: (sbp as any).referral_code || `${(sbp.username || 'USER').toUpperCase()}_REF`,
              emailVerified: true,
              passwordHash: '***',
              createdAt: sbp.created_at || new Date().toISOString(),
              updatedAt: sbp.updated_at || sbp.created_at || new Date().toISOString(),
            };
            mergedUsers.unshift(mappedUser);
            existingUserIds.add(sbp.id);
            existingUserEmails.add(sbp.email.toLowerCase());
          }
        }
      }

      // 2. Merge locally registered users from localStorage
      try {
        const rawReg = localStorage.getItem('nexvora_registered_users');
        if (rawReg) {
          const parsedReg = JSON.parse(rawReg);
          if (Array.isArray(parsedReg)) {
            for (const item of parsedReg) {
              const u = item?.user || item;
              if (u && u.email && !existingUserIds.has(u.id) && !existingUserEmails.has((u.email || '').toLowerCase())) {
                mergedUsers.unshift(u);
                existingUserIds.add(u.id);
                if (u.email) existingUserEmails.add(u.email.toLowerCase());
              }
            }
          }
        }
      } catch (e) {
        console.warn('localStorage registered users parse warning:', e);
      }

      // 3. Merge active current user if not in roster
      try {
        const rawCur = localStorage.getItem('nexvora_current_user');
        if (rawCur) {
          const curU = JSON.parse(rawCur);
          if (curU && curU.id && curU.email && !existingUserIds.has(curU.id) && !existingUserEmails.has(curU.email.toLowerCase())) {
            mergedUsers.unshift(curU);
            existingUserIds.add(curU.id);
            existingUserEmails.add(curU.email.toLowerCase());
          }
        }
      } catch {}

      // Asynchronously sync any new registered users to the backend Express database
      if (mergedUsers.length > loadedUsers.length) {
        apiFetch('/api/admin/users/sync', {
          method: 'POST',
          body: JSON.stringify({ users: mergedUsers }),
        }).catch(() => {});
      }

      setUsersList(mergedUsers);

      // Read deleted task IDs and status overrides for persistent consistency
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

      // Merge backend tasks, Supabase tasks, and localStorage custom tasks
      let mergedTasks = [...loadedTasks].filter(
        (t: any) =>
          t &&
          !deletedIds.includes(t.id) &&
          t.id !== 'TASK-101' &&
          t.id !== 'TASK-102' &&
          !t.title?.includes('Sign up and verify profile on partner website') &&
          !t.title?.includes('App feedback & UI bug testing')
      );
      const existingTaskIds = new Set(mergedTasks.map((t: any) => t.id));

      // 1. Merge Supabase microtasks
      if (Array.isArray(sbTasks) && sbTasks.length > 0) {
        for (const sbt of sbTasks) {
          if (!existingTaskIds.has(sbt.id) && !deletedIds.includes(sbt.id)) {
            mergedTasks.unshift(sbt);
            existingTaskIds.add(sbt.id);
          } else if (existingTaskIds.has(sbt.id)) {
            // Update with latest Supabase fields
            mergedTasks = mergedTasks.map((t: any) => (t.id === sbt.id ? { ...t, ...sbt } : t));
          }
        }
      }

      // 2. Merge with custom tasks from localStorage so state is always 100% resilient & dynamic
      try {
        const rawLocal = localStorage.getItem('nexvora_custom_tasks');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            for (const lt of parsed) {
              if (
                !existingTaskIds.has(lt.id) &&
                !deletedIds.includes(lt.id) &&
                lt.id !== 'TASK-101' &&
                lt.id !== 'TASK-102' &&
                !lt.title?.includes('Sign up and verify profile on partner website') &&
                !lt.title?.includes('App feedback & UI bug testing')
              ) {
                mergedTasks.unshift(lt);
                existingTaskIds.add(lt.id);
              }
            }
          }
        }
      } catch (e) {
        console.warn('localStorage tasks parse warning:', e);
      }

      // Apply status overrides so toggled states persist across reloads
      mergedTasks = mergedTasks.map((t: any) => {
        if (statusOverrides[t.id]) {
          return { ...t, status: statusOverrides[t.id] };
        }
        return t;
      });

      setTasksList(mergedTasks);

      // Merge backend withdrawals, Supabase withdrawals, and localStorage cache
      let mergedWithdrawals: Withdrawal[] = [...loadedWithdrawals];
      const existingWdIds = new Set(mergedWithdrawals.map((w: any) => w.id || w.withdrawalNumber));

      if (Array.isArray(sbWds) && sbWds.length > 0) {
        for (const sbw of sbWds) {
          if (!existingWdIds.has(sbw.id) && !existingWdIds.has(sbw.withdrawalNumber)) {
            mergedWithdrawals.unshift(sbw);
            existingWdIds.add(sbw.id);
          } else {
            mergedWithdrawals = mergedWithdrawals.map((w: any) =>
              (w.id === sbw.id || w.withdrawalNumber === sbw.withdrawalNumber) ? { ...w, ...sbw } : w
            );
          }
        }
      }

      // Check localStorage for any recent submissions
      try {
        const localKey = 'nexvora_admin_withdrawals_cache';
        const rawLocalWds = localStorage.getItem(localKey);
        if (rawLocalWds) {
          const parsedLocalWds = JSON.parse(rawLocalWds);
          if (Array.isArray(parsedLocalWds)) {
            for (const lw of parsedLocalWds) {
              if (!existingWdIds.has(lw.id) && !existingWdIds.has(lw.withdrawalNumber)) {
                mergedWithdrawals.unshift(lw);
                existingWdIds.add(lw.id || lw.withdrawalNumber);
              }
            }
          }
        }
      } catch {}

      // Scan all localStorage keys starting with nexvora_withdrawals_
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('nexvora_withdrawals_')) {
            const rawW = localStorage.getItem(k);
            if (rawW) {
              const parsed = JSON.parse(rawW);
              if (Array.isArray(parsed)) {
                for (const w of parsed) {
                  if (w && !existingWdIds.has(w.id) && !existingWdIds.has(w.withdrawalNumber)) {
                    mergedWithdrawals.unshift(w);
                    existingWdIds.add(w.id || w.withdrawalNumber);
                  }
                }
              }
            }
          }
        }
      } catch {}

      // Asynchronously sync any new withdrawals to backend Express database
      if (mergedWithdrawals.length > loadedWithdrawals.length) {
        apiFetch('/api/admin/withdrawals/sync', {
          method: 'POST',
          body: JSON.stringify({ withdrawals: mergedWithdrawals }),
        }).catch(() => {});
      }

      // Sort newest first
      mergedWithdrawals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWithdrawalsList(mergedWithdrawals);

      setGateways(gw?.gateways || []);
      setLogs(lg?.audit_logs || []);
      setKycUsers(ky?.verifications || []);

      // Merge backend submissions, Supabase submissions, and localStorage submissions
      let mergedSubmissions = [...(ts?.submissions || [])];
      const existingSubIds = new Set(mergedSubmissions.map((s: any) => s.id));

      // 1. Merge Supabase submissions
      if (Array.isArray(sbSubs) && sbSubs.length > 0) {
        for (const sbs of sbSubs) {
          if (!existingSubIds.has(sbs.id)) {
            mergedSubmissions.unshift(sbs);
            existingSubIds.add(sbs.id);
          } else {
            mergedSubmissions = mergedSubmissions.map((s: any) => (s.id === sbs.id ? { ...s, ...sbs } : s));
          }
        }
      }

      // 2. Merge with custom task submissions from localStorage
      try {
        const rawSubs = localStorage.getItem('nexvora_custom_submissions');
        if (rawSubs) {
          const parsedSubs = JSON.parse(rawSubs);
          if (Array.isArray(parsedSubs)) {
            const localSubMap = new Map(parsedSubs.map((s: any) => [s.id, s]));
            mergedSubmissions = mergedSubmissions.map((sub: any) => {
              const localMatch = localSubMap.get(sub.id);
              if (localMatch && localMatch.status) {
                return { ...sub, ...localMatch };
              }
              return sub;
            });

            for (const ls of parsedSubs) {
              if (!existingSubIds.has(ls.id)) {
                mergedSubmissions.unshift(ls);
                existingSubIds.add(ls.id);
              }
            }
          }
        }
      } catch (e) {
        console.warn('localStorage submissions parse warning:', e);
      }
      setTaskSubmissions(mergedSubmissions);
      setGatewaySpecs(gws?.specifications || []);

      const completedWds = mergedWithdrawals.filter(
        (w: any) => w.status === 'Completed' || w.status === 'APPROVED' || w.status === 'PAID'
      );
      const pendingWds = mergedWithdrawals.filter(
        (w: any) =>
          w.status === 'Pending' ||
          w.status === 'Under Review' ||
          w.status === 'Processing' ||
          w.status === 'PENDING'
      );

      setStats({
        totalRegisteredUsers: mergedUsers.length,
        totalDisbursedAmount: completedWds.reduce((acc: number, w: any) => acc + (w.netAmount || w.amount || 0), 0),
        pendingWithdrawalsAmount: pendingWds.reduce((acc: number, w: any) => acc + (w.amount || 0), 0),
        totalRealFeesEarned: completedWds.reduce((acc: number, w: any) => acc + (w.fee || 0), 0),
        activeServicesCount: loadedServices.length,
        openJobsCount: loadedJobs.length,
        approvedTasksCount: mergedTasks.length,
      });
    } catch (err) {
      console.error('Failed to load admin dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const handleSync = () => fetchAdminData();
    window.addEventListener('users_updated', handleSync);
    window.addEventListener('tasks_updated', handleSync);
    window.addEventListener('submissions_updated', handleSync);
    window.addEventListener('tickets_updated', handleSync);
    window.addEventListener('withdrawals_updated', handleSync);
    window.addEventListener('storage', handleSync);

    // Auto-poll every 6 seconds so user registrations and task submissions immediately appear in admin panel
    const livePollTimer = setInterval(() => {
      fetchAdminData();
    }, 6000);

    // Supabase Real-time subscriptions for instant live syncing
    const unsubMicro = subscribeToMicrotasks(() => {
      console.log('[Supabase Realtime] Microtasks table changed. Syncing UI...');
      fetchAdminData();
    });
    const unsubSubs = subscribeToSubmissions(() => {
      console.log('[Supabase Realtime] Submissions table changed. Syncing UI...');
      fetchAdminData();
    });
    const unsubWds = subscribeToWithdrawals(() => {
      console.log('[Supabase Realtime] Withdrawals table changed. Syncing UI...');
      fetchAdminData();
    });
    const unsubProfiles = subscribeToProfiles(() => {
      console.log('[Supabase Realtime] Profiles table changed. Syncing UI...');
      fetchAdminData();
    });
    const unsubTickets = subscribeToTickets(() => {
      console.log('[Supabase Realtime] Support tickets table changed. Syncing UI...');
      fetchAdminData();
    });

    return () => {
      clearInterval(livePollTimer);
      window.removeEventListener('users_updated', handleSync);
      window.removeEventListener('tasks_updated', handleSync);
      window.removeEventListener('submissions_updated', handleSync);
      window.removeEventListener('tickets_updated', handleSync);
      window.removeEventListener('withdrawals_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      if (typeof unsubMicro === 'function') unsubMicro();
      if (typeof unsubSubs === 'function') unsubSubs();
      if (typeof unsubWds === 'function') unsubWds();
      if (typeof unsubProfiles === 'function') unsubProfiles();
      if (typeof unsubTickets === 'function') unsubTickets();
    };
  }, [user]);

  // Reject action
  const handleConfirmReject = async () => {
    if (!rejectId) return;
    const currentRejectId = rejectId;
    const currentRejectType = rejectType;
    const reasonToUse =
      rejectionReason.trim() ||
      (currentRejectType === 'task_submission'
        ? 'Proof rejected by admin'
        : 'Request declined by administrator. Balance refunded.');

    // Optimistic UI update & immediate modal close to prevent UI lag or freezing
    setRejectId(null);
    setRejectionReason('');

    try {
      if (currentRejectType === 'withdrawal') {
        setWithdrawalsList((prev) =>
          prev.map((w) =>
            w.id === currentRejectId
              ? { ...w, status: 'Rejected', adminFeedback: reasonToUse }
              : w
          )
        );

        // 1. Supabase Withdrawal status update
        updateSupabaseWithdrawalStatus(currentRejectId, 'REJECTED', {
          rejectionReason: reasonToUse,
          reviewedBy: user?.email || 'Admin',
        }).catch((err) => console.warn('[Supabase] Withdrawal reject status error:', err));

        // 2. Refund balance and points to user in Supabase and local storage
        const targetWd = withdrawalsList.find((w) => w.id === currentRejectId);
        if (targetWd?.userId) {
          const refundAmount = targetWd.amount || 0;
          const refundPoints = Math.round(refundAmount * 1000);

          if (refundAmount > 0) {
            (async () => {
              try {
                const { data: profData } = await supabase
                  .from('profiles')
                  .select('points, balance')
                  .eq('id', targetWd.userId)
                  .single();

                if (profData) {
                  const curPts = Number((profData as any).points || 0);
                  const curBal = Number((profData as any).balance || 0);
                  await supabase
                    .from('profiles')
                    .update({
                      points: curPts + refundPoints,
                      balance: Number((curBal + refundAmount).toFixed(4)),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', targetWd.userId);
                }
              } catch (profErr) {
                console.warn('[Supabase Profile Refund Notice]:', profErr);
              }
            })();

            try {
              const uKey = `points_${targetWd.userId}`;
              const existingPts = parseInt(localStorage.getItem(uKey) || '0', 10);
              localStorage.setItem(uKey, (existingPts + refundPoints).toString());

              if (user?.id === targetWd.userId) {
                const curUserPts = parseInt(localStorage.getItem('nexvora_user_points') || '0', 10);
                const newUserPts = curUserPts + refundPoints;
                const newUserBal = (newUserPts / 1000).toFixed(2);
                localStorage.setItem('nexvora_user_points', newUserPts.toString());
                localStorage.setItem('points', newUserPts.toString());
                localStorage.setItem('user_points', newUserPts.toString());
                localStorage.setItem('nexvora_wallet_balance', newUserBal);
                localStorage.setItem('nexvora_user_balance', newUserBal);
                window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { newBalance: parseFloat(newUserBal), points: newUserPts } }));
                window.dispatchEvent(new CustomEvent('pointsUpdated', { detail: { newBalance: parseFloat(newUserBal), points: newUserPts } }));
              }
            } catch {}
          }
        }

        await apiFetch(`/api/admin/withdrawals/${currentRejectId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'Rejected', adminFeedback: reasonToUse }),
        });
        window.dispatchEvent(new Event('withdrawals_updated'));
        setActionFeedback('Withdrawal rejected and funds automatically refunded to member ledger.');
      } else if (currentRejectType === 'task_submission') {
        // Optimistic UI state update immediately
        setTaskSubmissions((prev) =>
          prev.map((s) =>
            s.id === currentRejectId
              ? { ...s, status: 'rejected', rejectionReason: reasonToUse }
              : s
          )
        );

        // Sync with localStorage submissions immediately
        try {
          const rawSubs = localStorage.getItem('nexvora_custom_submissions');
          const subs = rawSubs ? JSON.parse(rawSubs) : [];
          const existingIdx = subs.findIndex((s: any) => s.id === currentRejectId);
          if (existingIdx >= 0) {
            subs[existingIdx] = { ...subs[existingIdx], status: 'rejected', rejectionReason: reasonToUse };
          } else {
            subs.unshift({ id: currentRejectId, status: 'rejected', rejectionReason: reasonToUse });
          }
          localStorage.setItem('nexvora_custom_submissions', JSON.stringify(subs));
          window.dispatchEvent(new Event('submissions_updated'));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.warn('LocalStorage error on submission reject:', e);
        }

        // Supabase submission status update
        updateSupabaseSubmissionStatus(currentRejectId, 'rejected', reasonToUse, user?.email || 'Admin').catch((err) =>
          console.warn('[Supabase] Submission reject status sync:', err)
        );

        await apiFetch(`/api/admin/task-submissions/${currentRejectId}`, {
          method: 'PUT',
          body: JSON.stringify({ decision: 'rejected', rejectionReason: reasonToUse }),
        });
        setActionFeedback('Task submission rejected.');
      } else if (currentRejectType === 'kyc') {
        setKycUsers((prev) =>
          prev.map((u) => (u.id === currentRejectId ? { ...u, kycStatus: 'rejected' } : u))
        );
        await apiFetch(`/api/admin/verifications/${currentRejectId}`, {
          method: 'PUT',
          body: JSON.stringify({ decision: 'rejected', notes: reasonToUse }),
        });
        setActionFeedback('KYC rejected with feedback sent to user.');
      }
      await fetchAdminData();
    } catch (err: any) {
      console.error('Rejection action error:', err);
      setActionFeedback(err.message || 'Rejection action failed');
    }
  };

  // Complete withdrawal
  const handleConfirmComplete = async () => {
    if (!completingWd) return;
    const refToUse = txRefNumber.trim() || `MANUAL-${Date.now().toString(36).toUpperCase()}`;
    const wdToComplete = completingWd;
    setCompletingWd(null);
    setTxRefNumber('');

    try {
      setWithdrawalsList((prev) =>
        prev.map((w) =>
          w.id === wdToComplete.id
            ? { ...w, status: 'Completed', paymentConfirmationRef: refToUse }
            : w
        )
      );

      // 1. Supabase Withdrawal status update
      updateSupabaseWithdrawalStatus(wdToComplete.id, 'APPROVED', {
        paymentRef: refToUse,
        reviewedBy: user?.email || 'Admin',
      }).catch((err) => console.warn('[Supabase] Withdrawal approve status error:', err));

      await apiFetch(`/api/admin/withdrawals/${wdToComplete.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Completed',
          paymentConfirmationRef: refToUse,
        }),
      });

      window.dispatchEvent(new Event('withdrawals_updated'));
      setActionFeedback(`Withdrawal ${wdToComplete.withdrawalNumber} marked completed with Reference #${refToUse}.`);
      await fetchAdminData();
    } catch (err: any) {
      console.error('Complete withdrawal error:', err);
      setActionFeedback(err.message || 'Action failed');
    }
  };

  // Approve Task submission
  const handleApproveSubmission = async (subId: string) => {
    // Optimistic UI state update immediately
    setTaskSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'approved' } : s))
    );

    // Sync with localStorage submissions
    try {
      const rawSubs = localStorage.getItem('nexvora_custom_submissions');
      const subs = rawSubs ? JSON.parse(rawSubs) : [];
      const existingIdx = subs.findIndex((s: any) => s.id === subId);
      if (existingIdx >= 0) {
        subs[existingIdx] = { ...subs[existingIdx], status: 'approved' };
      } else {
        subs.unshift({ id: subId, status: 'approved' });
      }
      localStorage.setItem('nexvora_custom_submissions', JSON.stringify(subs));
      window.dispatchEvent(new Event('submissions_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('LocalStorage error on submission approval:', e);
    }

    // Supabase submission status update and user balance crediting
    const targetSub = taskSubmissions.find((s) => s.id === subId);
    if (targetSub?.userId) {
      const rewardCoins = targetSub.rewardCoins || (targetSub.rewardAmount ? Math.round(targetSub.rewardAmount * 1000) : 25);
      const rewardUsd = targetSub.rewardAmount || Number((rewardCoins / 1000).toFixed(4));

      // Direct profile balance increment in Supabase
      (async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('points, balance')
            .eq('id', targetSub.userId)
            .single();

          if (data) {
            const currentPts = Number((data as any).points || 0);
            const currentBal = Number((data as any).balance || 0);
            await supabase
              .from('profiles')
              .update({
                points: currentPts + rewardCoins,
                balance: Number((currentBal + rewardUsd).toFixed(4)),
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetSub.userId);
          }
        } catch (err) {
          console.warn('Supabase balance credit notice:', err);
        }
      })();

      try {
        const uKey = `points_${targetSub.userId}`;
        const existingPts = parseInt(localStorage.getItem(uKey) || '0', 10);
        localStorage.setItem(uKey, (existingPts + rewardCoins).toString());
      } catch {}
    }

    updateSupabaseSubmissionStatus(subId, 'approved', undefined, user?.email || 'Admin').catch((err) =>
      console.warn('[Supabase] Submission approve status sync:', err)
    );

    try {
      await apiFetch(`/api/admin/task-submissions/${subId}`, {
        method: 'PUT',
        body: JSON.stringify({ decision: 'approved' }),
      });
      setActionFeedback('Submission approved! Reward credited directly into user wallet ledger.');
      await fetchAdminData();
    } catch (err: any) {
      console.error('Submission approval error:', err);
      setActionFeedback(err.message || 'Approval action failed');
    }
  };

  // Approve KYC
  const handleApproveKyc = async (userId: string) => {
    try {
      await apiFetch(`/api/admin/verifications/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ decision: 'verified' }),
      });
      setActionFeedback('User KYC verified successfully.');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'KYC approval failed');
    }
  };

  // Toggle user ban
  const handleToggleBan = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      await apiFetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus, reason: 'Administrative review' }),
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Ban status update failed');
    }
  };

  // Create or Update Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calculatedCoins = newTaskCoins ? Number(newTaskCoins) : Math.round(Number(newTaskReward) * 1000);
      const calculatedReward = newTaskReward ? Number(newTaskReward) : calculatedCoins / 1000;

      let savedTaskId = editingTask ? editingTask.id : '';
      const taskPayload = {
        title: newTaskTitle,
        category: newTaskCategory,
        description: newTaskDesc,
        proofRequirements: newTaskProofRequirements.trim() || undefined,
        rewardAmount: calculatedReward,
        rewardCoins: calculatedCoins,
        timerSeconds: Number(newTaskTimerSeconds) || 15,
        youtubeVideoId: newTaskYoutubeId.trim() || undefined,
        totalSlots: Number(newTaskSlots),
        slotsRemaining: Number(newTaskSlots),
        timeLimitMinutes: 30,
        verificationType: newTaskVerificationType as any,
        targetUrl: newTaskTargetUrl.trim() || undefined,
        instructions: newTaskInstructions.split('\n').filter((x) => x.trim().length > 0),
        status: (editingTask?.status || 'active') as any,
      };

      if (editingTask) {
        // Updating existing task in Supabase
        updateSupabaseMicrotask(editingTask.id, taskPayload).catch((err) =>
          console.error('[Supabase Microtask Update Error]:', err)
        );

        // Updating existing task in backend
        await apiFetch(`/api/admin/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify(taskPayload),
        });
        savedTaskId = editingTask.id;
        setActionFeedback(`Task "${newTaskTitle}" updated successfully.`);
      } else {
        savedTaskId = `TASK-${Date.now()}`;
        // Insert into Supabase microtasks
        insertSupabaseMicrotask({ id: savedTaskId, ...taskPayload }).catch((err) =>
          console.error('[Supabase Microtask Insert Error]:', err)
        );

        // Creating new task in backend
        const res = await apiFetch('/api/admin/tasks', {
          method: 'POST',
          body: JSON.stringify({ id: savedTaskId, ...taskPayload }),
        });
        if (res?.task?.id) savedTaskId = res.task.id;
        setActionFeedback(`New microtask "${newTaskTitle}" created & published to Marketplace with $${calculatedReward.toFixed(2)} payout.`);
      }

      // Store created task in dynamic state / localStorage so it instantly appears on the user's Marketplace page (/dashboard/tasks)
      const taskObj = {
        id: savedTaskId,
        ...taskPayload,
        reward: calculatedReward,
        spotsLeft: Number(newTaskSlots),
        employer: 'Admin Verified',
        createdAt: new Date().toISOString(),
      };

      try {
        const rawLocal = localStorage.getItem('nexvora_custom_tasks');
        const customTasks = rawLocal ? JSON.parse(rawLocal) : [];
        const filtered = customTasks.filter((t: any) => t.id !== savedTaskId);
        filtered.unshift(taskObj);
        localStorage.setItem('nexvora_custom_tasks', JSON.stringify(filtered));
        window.dispatchEvent(new Event('tasks_updated'));
      } catch (err) {
        console.warn('localStorage sync error:', err);
      }

      // Asynchronously sync task to authoritative backend JSON disk database
      apiFetch('/api/admin/tasks/sync', {
        method: 'POST',
        body: JSON.stringify({ tasks: [taskObj] }),
      }).catch((syncErr) => console.warn('[Backend task sync notice]:', syncErr));

      setShowNewTaskModal(false);
      setEditingTask(null);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskProofRequirements('');
      setNewTaskTargetUrl('');
      setNewTaskYoutubeId('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save task');
    }
  };

  const handleOpenEditTask = (t: Task) => {
    setEditingTask(t);
    setNewTaskTitle(t.title);
    setNewTaskCategory(t.category || 'PTC (Website Visit)');
    setNewTaskDesc(t.description);
    setNewTaskProofRequirements(t.proofRequirements || '');
    setNewTaskReward((t.rewardAmount || (t.rewardCoins ? t.rewardCoins / 1000 : 0.015)).toString());
    setNewTaskCoins((t.rewardCoins || Math.round((t.rewardAmount || 0.015) * 1000)).toString());
    setNewTaskTimerSeconds((t.timerSeconds || 15).toString());
    setNewTaskYoutubeId(t.youtubeVideoId || '');
    setNewTaskSlots((t.totalSlots || 100).toString());
    setNewTaskVerificationType(t.verificationType || 'instant_timer');
    setNewTaskTargetUrl(t.targetUrl || '');
    setNewTaskInstructions(Array.isArray(t.instructions) ? t.instructions.join('\n') : (t.instructions || ''));
    setShowNewTaskModal(true);
  };

  // Toggle Gateway Status
  const handleToggleGateway = async (gatewayId: string, isConfigured: boolean) => {
    try {
      await apiFetch(`/api/admin/payment-gateways/${gatewayId}`, {
        method: 'PUT',
        body: JSON.stringify({ isConfigured: !isConfigured }),
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle gateway');
    }
  };

  const hasAdminPrivilege =
    user?.role === 'SUPER ADMIN' || user?.role === 'ADMIN' || user?.role === 'CONTENT ADMIN';

  // Toggle Task Status (Deactivate / Activate)
  const handleToggleDeactivateTask = async (task: Task) => {
    if (!hasAdminPrivilege) {
      setActionFeedback('Permission denied: Administrative role required to toggle task status.');
      return;
    }
    const nextStatus = task.status === 'active' ? 'inactive' : 'active';

    // 1. Optimistic UI update immediately
    setTasksList((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );
    setTaskActionLoading(task.id);

    // 2. Persist status override to localStorage immediately
    try {
      const rawOv = localStorage.getItem('nexvora_task_status_overrides');
      const overrides = rawOv ? JSON.parse(rawOv) : {};
      overrides[task.id] = nextStatus;
      localStorage.setItem('nexvora_task_status_overrides', JSON.stringify(overrides));

      const rawCustom = localStorage.getItem('nexvora_custom_tasks');
      if (rawCustom) {
        const custom = JSON.parse(rawCustom);
        if (Array.isArray(custom)) {
          const updatedCustom = custom.map((t: any) =>
            t.id === task.id ? { ...t, status: nextStatus } : t
          );
          localStorage.setItem('nexvora_custom_tasks', JSON.stringify(updatedCustom));
        }
      }

      // Dispatch event to hide/show on User Dashboard instantly
      window.dispatchEvent(new CustomEvent('tasks_updated', { detail: { taskId: task.id, status: nextStatus } }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('LocalStorage status override error:', e);
    }

    // 3. Supabase status toggle
    toggleSupabaseMicrotaskActive(task.id, nextStatus === 'active').catch((err) =>
      console.warn('[Supabase] Task toggle status notice:', err)
    );

    // 4. Update server database
    try {
      const endpoint =
        nextStatus === 'inactive'
          ? `/api/admin/tasks/${task.id}/deactivate`
          : `/api/admin/tasks/${task.id}/status`;
      const res = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      setActionFeedback(res?.message || `Task "${task.title}" is now ${nextStatus === 'active' ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      console.warn('Server task status update notice:', err);
      setActionFeedback(`Task "${task.title}" status set to ${nextStatus === 'active' ? 'Active' : 'Inactive'} (saved).`);
    } finally {
      setTaskActionLoading(null);
      await fetchAdminData();
    }
  };

  // Direct Delete Task - Immediate state wipe & storage removal (no blocking window.confirm)
  const handleDeleteTaskDirect = async (task: Task) => {
    console.log("Deleting task ID:", task.id);
    if (!hasAdminPrivilege) {
      setActionFeedback('Permission denied: Administrative role required to delete tasks.');
      return;
    }

    const taskId = task.id;
    const taskTitle = task.title;

    // 1. Direct State & DOM Filter - instantly remove from view
    setTasksList((prev) => prev.filter((t) => t.id !== taskId));
    setTaskActionLoading(taskId);

    // 2. Immediate localStorage cleanup & blacklist persistence
    try {
      // Remove from nexvora_custom_tasks
      const rawLocal = localStorage.getItem('nexvora_custom_tasks');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((t: any) => t.id !== taskId);
          localStorage.setItem('nexvora_custom_tasks', JSON.stringify(filtered));
        }
      }

      // Add to nexvora_deleted_tasks blacklist so it never reappears on reload
      const rawDeleted = localStorage.getItem('nexvora_deleted_tasks');
      const deletedIds: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
      if (!deletedIds.includes(taskId)) {
        deletedIds.push(taskId);
        localStorage.setItem('nexvora_deleted_tasks', JSON.stringify(deletedIds));
      }

      // Clean up from status overrides
      const rawOverrides = localStorage.getItem('nexvora_task_status_overrides');
      if (rawOverrides) {
        const overrides = JSON.parse(rawOverrides);
        delete overrides[taskId];
        localStorage.setItem('nexvora_task_status_overrides', JSON.stringify(overrides));
      }

      // Dispatch real-time events to all tabs and user dashboard
      window.dispatchEvent(new CustomEvent('tasks_updated', { detail: { deletedId: taskId } }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Storage sync error on task delete:', e);
    }

    // 3. Supabase delete
    deleteSupabaseMicrotask(taskId).catch((err) =>
      console.warn('[Supabase] Task delete notice:', err)
    );

    // 4. Delete from backend database
    try {
      const res = await apiFetch(`/api/admin/tasks/${taskId}`, { method: 'DELETE' });
      setActionFeedback(res?.message || `Task "${taskTitle}" permanently deleted.`);
    } catch (err: any) {
      console.warn('Backend delete response:', err);
      setActionFeedback(`Task "${taskTitle}" removed.`);
    } finally {
      setTaskActionLoading(null);
      await fetchAdminData();
    }
  };

  // Permanently Delete Item (Task, Submission, Service, Job, Product)
  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    if (!hasAdminPrivilege) {
      setActionFeedback('Permission denied: Administrative role required to delete items.');
      return;
    }
    const currentItem = itemToDelete;
    const deletedId = currentItem.id;
    const deletedType = currentItem.type;

    // Close modal immediately and update state optimistically so UI never freezes
    setItemToDelete(null);
    setTaskActionLoading(deletedId);

    try {
      let endpoint = '';
      if (deletedType === 'task') {
        endpoint = `/api/admin/tasks/${deletedId}`;
        // Optimistic UI state update
        setTasksList((prev) => prev.filter((t) => t.id !== deletedId));
        // Supabase delete
        deleteSupabaseMicrotask(deletedId).catch((err) =>
          console.warn('[Supabase] Task delete notice:', err)
        );
        try {
          const rawLocal = localStorage.getItem('nexvora_custom_tasks');
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal);
            const filtered = parsed.filter((t: any) => t.id !== deletedId);
            localStorage.setItem('nexvora_custom_tasks', JSON.stringify(filtered));
          }
          const rawDeleted = localStorage.getItem('nexvora_deleted_tasks');
          const deletedIds: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
          if (!deletedIds.includes(deletedId)) {
            deletedIds.push(deletedId);
            localStorage.setItem('nexvora_deleted_tasks', JSON.stringify(deletedIds));
          }
          const rawOverrides = localStorage.getItem('nexvora_task_status_overrides');
          if (rawOverrides) {
            const overrides = JSON.parse(rawOverrides);
            delete overrides[deletedId];
            localStorage.setItem('nexvora_task_status_overrides', JSON.stringify(overrides));
          }
          window.dispatchEvent(new CustomEvent('tasks_updated', { detail: { deletedId } }));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.warn('Storage sync error on task delete:', e);
        }
      } else if (deletedType === 'submission') {
        endpoint = `/api/admin/task-submissions/${deletedId}`;
        // Optimistic UI state update
        setTaskSubmissions((prev) => prev.filter((s) => s.id !== deletedId));
        // Supabase delete
        deleteSupabaseSubmission(deletedId).catch((err) =>
          console.warn('[Supabase] Submission delete notice:', err)
        );
        try {
          const rawSubs = localStorage.getItem('nexvora_custom_submissions');
          if (rawSubs) {
            const subs = JSON.parse(rawSubs);
            const filtered = subs.filter((s: any) => s.id !== deletedId);
            localStorage.setItem('nexvora_custom_submissions', JSON.stringify(filtered));
            window.dispatchEvent(new Event('submissions_updated'));
            window.dispatchEvent(new Event('storage'));
          }
        } catch (e) {
          console.warn('Storage sync error on submission delete:', e);
        }
      } else if (deletedType === 'service') {
        endpoint = `/api/admin/services/${deletedId}`;
        setServicesList((prev) => prev.filter((s) => s.id !== deletedId));
      } else if (deletedType === 'job') {
        endpoint = `/api/admin/jobs/${deletedId}`;
        setJobsList((prev) => prev.filter((j) => j.id !== deletedId));
      } else if (deletedType === 'product') {
        endpoint = `/api/admin/products/${deletedId}`;
        setProductsList((prev) => prev.filter((p) => p.id !== deletedId));
      }

      const res = await apiFetch(endpoint, { method: 'DELETE' });
      setActionFeedback(res?.message || `${deletedType.toUpperCase()} "${currentItem.title}" permanently removed.`);
      await fetchAdminData();
    } catch (err: any) {
      console.error('Delete item error:', err);
      setActionFeedback(err.message || `Failed to delete ${deletedType}.`);
    } finally {
      setTaskActionLoading(null);
    }
  };

  // Toggle Digital Product Status (Published / Unpublished)
  const handleToggleProductPublish = async (product: any) => {
    try {
      const res = await apiFetch(`/api/admin/products/${product.id}/toggle`, { method: 'PUT' });
      setActionFeedback(res.message || 'Product published status updated.');
      await fetchAdminData();
    } catch (err: any) {
      setActionFeedback(err.message || 'Failed to toggle product status.');
    }
  };

  // Create New Digital Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          title: newProductTitle,
          category: newProductCategory,
          description: newProductDesc,
          price: Number(newProductPrice),
          downloadUrl: newProductDownloadUrl,
          fileSizeMb: Number(newProductFileSize),
        }),
      });
      setShowNewProductModal(false);
      setNewProductTitle('');
      setNewProductDesc('');
      setNewProductDownloadUrl('');
      setActionFeedback('Digital product created and published to marketplace.');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create digital product');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-950/40">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Administrative Access Restricted</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          This portal is reserved strictly for Super Admins and authorized staff. You are being redirected to your dashboard...
        </p>
        <button
          onClick={() => navigate(user ? '/dashboard/earn' : '/login')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          {user ? 'Return to User Dashboard' : 'Sign In as Administrator'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white font-['Space_Grotesk']">
                Nexvora Governance & Control Portal
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 uppercase border border-purple-800">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Authoritative financial, compliance, and user management.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Connection Diagnostics Badge */}
          <button
            id="admin-db-status-badge"
            onClick={() => setShowDbDiagnostics(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs flex items-center gap-2 transition-all cursor-pointer group"
            title="Click to view database connection status and live diagnostics"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  supabaseStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  supabaseStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="font-semibold text-slate-200">
              {supabaseStatus === 'connected' ? 'Supabase Connected' : 'Persistent Storage'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
              JSON Disk
            </span>
          </button>

          <button
            onClick={async () => {
              setActionFeedback('Refreshing database and synchronizing all tables...');
              await fetchAdminData();
              setTimeout(() => setActionFeedback(null), 3000);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} /> Refresh Database
          </button>
        </div>
      </div>

      {dbErrorBanner && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{dbErrorBanner}</span>
          </div>
          <button
            onClick={() => setDbErrorBanner(null)}
            className="text-rose-400 hover:text-white px-2 py-1 rounded bg-rose-900/50 hover:bg-rose-900 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <button
          onClick={() => setAdminTab('overview')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Reports & Overview
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Users ({usersList.length})
        </button>
        <button
          onClick={() => setAdminTab('withdrawals')}
          className={`px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            adminTab === 'withdrawals' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Withdrawals ({withdrawalsList.length})</span>
          {withdrawalsList.filter((w) => w.status === 'Pending' || w.status === 'Under Review' || w.status === 'Processing').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {withdrawalsList.filter((w) => w.status === 'Pending' || w.status === 'Under Review' || w.status === 'Processing').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('task_reviews')}
          className={`px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            adminTab === 'task_reviews' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Task Approvals ({taskSubmissions.length})</span>
          {taskSubmissions.filter((s) => s.status === 'pending_review').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
              {taskSubmissions.filter((s) => s.status === 'pending_review').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('support')}
          className={`px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            adminTab === 'support' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          <span>Support / Tickets</span>
          {supportTickets.filter((t) => t.status === 'open' || t.status === 'under_review').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
              {supportTickets.filter((t) => t.status === 'open' || t.status === 'under_review').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('tasks')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'tasks' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Manage Microtasks ({tasksList.length})
        </button>
        <button
          onClick={() => setAdminTab('services')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'services' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Services ({servicesList.length})
        </button>
        <button
          onClick={() => setAdminTab('jobs')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'jobs' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Jobs ({jobsList.length})
        </button>
        <button
          onClick={() => setAdminTab('products')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'products' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Digital Products ({productsList.length})
        </button>
        <button
          onClick={() => setAdminTab('kyc')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'kyc' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          KYC ({kycUsers.length})
        </button>
        <button
          onClick={() => setAdminTab('gateways')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'gateways' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Payment Gateways
        </button>
        <button
          onClick={() => setAdminTab('reward_settings')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'reward_settings' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚙️ Task & Revenue Settings
        </button>
        <button
          onClick={() => setAdminTab('video_settings')}
          className={`px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            adminTab === 'video_settings' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current text-rose-400" /> Video Task Settings
        </button>
        <button
          onClick={() => setAdminTab('logs')}
          className={`px-3 py-2 rounded-xl font-medium transition-all ${
            adminTab === 'logs' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Audit Logs ({logs.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW & REPORTS */}
      {adminTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Total Registered Users</span>
              <p className="text-2xl font-bold text-white mt-1 font-['Space_Grotesk']">{stats.totalRegisteredUsers}</p>
              <span className="text-[10px] text-slate-500">Live DB records</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Total Disbursed Payouts</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-['Space_Grotesk']">
                ${stats.totalDisbursedAmount.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-500">Real completed transactions</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Pending Withdrawals</span>
              <p className="text-2xl font-bold text-amber-400 mt-1 font-['Space_Grotesk']">
                ${stats.pendingWithdrawalsAmount.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-500">Awaiting disbursal</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Platform Real Fees</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1 font-['Space_Grotesk']">
                ${stats.totalRealFeesEarned.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-500">Real transaction fees</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Active Freelance Services</span>
              <p className="text-xl font-bold text-white mt-1">{stats.activeServicesCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Open Client Jobs</span>
              <p className="text-xl font-bold text-white mt-1">{stats.openJobsCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400">Approved Paid Tasks</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{stats.approvedTasksCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Registered Users Roster</h3>
            <span className="text-xs text-slate-400">Strictly real records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="text-slate-300">
                    <td className="py-3">
                      <div>
                        <p className="font-bold text-white">{u.fullName}</p>
                        <span className="text-[10px] text-slate-500">@{u.username}</span>
                      </div>
                    </td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {u.role !== 'SUPER ADMIN' && (
                        <button
                          onClick={() => handleToggleBan(u.id, u.status)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                            u.status === 'active'
                              ? 'bg-rose-950 text-rose-300 hover:bg-rose-900'
                              : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend / Ban' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ADMIN PAYOUT MANAGEMENT & DISBURSAL QUEUE */}
      {adminTab === 'withdrawals' && (() => {
        const pendingWds = withdrawalsList.filter((w) => w.status === 'Pending' || w.status === 'Under Review');
        const completedWds = withdrawalsList.filter((w) => w.status === 'Completed');
        const rejectedWds = withdrawalsList.filter((w) => w.status === 'Rejected' || w.status === 'Cancelled');

        const totalPending$ = pendingWds.reduce((acc, w) => acc + (w.amount || 0), 0);
        const totalCompleted$ = completedWds.reduce((acc, w) => acc + (w.amount || 0), 0);
        const totalRejected$ = rejectedWds.reduce((acc, w) => acc + (w.amount || 0), 0);

        const filteredWds = withdrawalsList.filter((w) => {
          if (payoutFilter === 'pending') {
            if (w.status !== 'Pending' && w.status !== 'Under Review') return false;
          } else if (payoutFilter === 'completed') {
            if (w.status !== 'Completed') return false;
          } else if (payoutFilter === 'rejected') {
            if (w.status !== 'Rejected' && w.status !== 'Cancelled') return false;
          }

          if (payoutSearch.trim()) {
            const query = payoutSearch.toLowerCase();
            const accNum = (w.accountDetails?.accountNumber || w.accountDetails?.emailOrWalletAddress || (w as any).accountIdentifier || '').toLowerCase();
            const uName = (w.userName || '').toLowerCase();
            const uEmail = (w.userEmail || '').toLowerCase();
            const wdNum = (w.withdrawalNumber || '').toLowerCase();
            const pMethod = (w.paymentMethod || '').toLowerCase();
            return (
              accNum.includes(query) ||
              uName.includes(query) ||
              uEmail.includes(query) ||
              wdNum.includes(query) ||
              pMethod.includes(query)
            );
          }
          return true;
        });

        const copyToClipboard = (text: string) => {
          if (!text) return;
          navigator.clipboard.writeText(text);
          setCopiedAccount(text);
          setTimeout(() => setCopiedAccount(null), 2500);
        };

        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-cyan-400" /> Admin Payout Management & Disbursals
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect member account numbers/identifiers, copy them instantly, and mark payouts Completed or Reject with automated wallet refunding.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAdminData}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold block">Pending Review</span>
                  <span className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-0.5 block">
                    ${totalPending$.toFixed(2)}
                  </span>
                  <span className="text-xs text-amber-300/80">{pendingWds.length} Requests awaiting action</span>
                </div>
                <Clock className="w-8 h-8 text-amber-400/60" />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold block">Completed Payouts</span>
                  <span className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-0.5 block">
                    ${totalCompleted$.toFixed(2)}
                  </span>
                  <span className="text-xs text-emerald-300/80">{completedWds.length} Disbursed settlements</span>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-rose-400 uppercase tracking-wider font-semibold block">Rejected & Refunded</span>
                  <span className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-0.5 block">
                    ${totalRejected$.toFixed(2)}
                  </span>
                  <span className="text-xs text-rose-300/80">{rejectedWds.length} Requests refunded</span>
                </div>
                <XCircle className="w-8 h-8 text-rose-400/60" />
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setPayoutFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      payoutFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Pending ({pendingWds.length})
                  </button>
                  <button
                    onClick={() => setPayoutFilter('completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      payoutFilter === 'completed'
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed ({completedWds.length})
                  </button>
                  <button
                    onClick={() => setPayoutFilter('rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      payoutFilter === 'rejected'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rejected ({rejectedWds.length})
                  </button>
                  <button
                    onClick={() => setPayoutFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      payoutFilter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({withdrawalsList.length})
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={payoutSearch}
                    onChange={(e) => setPayoutSearch(e.target.value)}
                    placeholder="Search account #, user, ID..."
                    className="w-full pl-9 pr-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Withdrawals List */}
            {filteredWds.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                <Wallet className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-semibold text-white text-sm">No payout requests match criteria</p>
                <p className="text-xs text-slate-500">Try changing your filter pills or search query.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWds.map((w) => {
                  const accIdentifier =
                    w.accountDetails?.accountNumber ||
                    w.accountDetails?.emailOrWalletAddress ||
                    (w as any).accountIdentifier ||
                    (typeof w.accountDetails === 'string' ? w.accountDetails : 'N/A');

                  const isPending = w.status === 'Pending' || w.status === 'Under Review';
                  const isCompleted = w.status === 'Completed';
                  const isRejected = w.status === 'Rejected' || w.status === 'Cancelled';

                  return (
                    <div
                      key={w.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-white font-mono text-sm">{w.withdrawalNumber}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                              w.paymentMethod.includes('bKash')
                                ? 'bg-pink-950/80 text-pink-300 border border-pink-800/80'
                                : w.paymentMethod.includes('Nagad')
                                ? 'bg-orange-950/80 text-orange-300 border border-orange-800/80'
                                : w.paymentMethod.includes('Rocket')
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/80'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                            }`}
                          >
                            {w.paymentMethod}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : isRejected
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            }`}
                          >
                            {w.status}
                          </span>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="text-lg font-bold text-white font-['Space_Grotesk']">
                            ${w.amount.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Net Disbursal: <strong className="text-emerald-400">${w.netAmount.toFixed(2)}</strong> (Fee: ${w.fee.toFixed(2)})
                          </span>
                        </div>
                      </div>

                      {/* User & Account Identifier Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        {/* Member Information */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Member:</span>
                            <span className="font-semibold text-white">{w.userName || 'Member'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Email:</span>
                            <span className="font-mono text-slate-300">{w.userEmail || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Requested:</span>
                            <span className="text-slate-500">{new Date(w.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Account Identifier Card with Copy Button */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-3">
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              {w.paymentMethod.includes('USDT') ? (
                                <Wallet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              ) : (
                                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              )}
                              <span className="font-medium text-slate-300">Recipient Account Number / Identifier</span>
                            </div>
                            <div className="font-mono text-cyan-300 font-bold text-sm truncate select-all">
                              {accIdentifier}
                            </div>
                          </div>

                          <button
                            onClick={() => copyToClipboard(accIdentifier)}
                            title="Copy Account Number"
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
                              copiedAccount === accIdentifier
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {copiedAccount === accIdentifier ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Status Notes & Admin Feedback */}
                      {w.paymentConfirmationRef && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            TxID Confirmation Reference: <strong className="font-mono">{w.paymentConfirmationRef}</strong>
                          </span>
                        </div>
                      )}

                      {w.adminFeedback && (
                        <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                          isRejected
                            ? 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                            : 'bg-amber-950/40 border border-amber-800/60 text-amber-300'
                        }`}>
                          {isRejected ? <XCircle className="w-4 h-4 shrink-0 text-rose-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />}
                          <span>Admin Feedback / Reason: {w.adminFeedback}</span>
                        </div>
                      )}

                      {/* Admin Action Buttons for Pending */}
                      {isPending && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                          <button
                            onClick={() => {
                              setRejectId(w.id);
                              setRejectType('withdrawal');
                              setRejectionReason('');
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Reject & Refund Balance
                          </button>

                          <button
                            onClick={() => {
                              setCompletingWd(w);
                              setTxRefNumber('');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark Completed / Paid
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. TASK SUBMISSIONS REVIEW */}
      {adminTab === 'task_reviews' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Task Approvals & Worker Proof Review
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review worker-submitted proofs, verify screenshots, and approve or reject submissions to credit user wallets directly from escrow.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setSubmissionStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  submissionStatusFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({taskSubmissions.length})
              </button>
              <button
                onClick={() => setSubmissionStatusFilter('pending_review')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  submissionStatusFilter === 'pending_review' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({taskSubmissions.filter((s) => s.status === 'pending_review').length})
              </button>
              <button
                onClick={() => setSubmissionStatusFilter('approved')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  submissionStatusFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Approved ({taskSubmissions.filter((s) => s.status === 'approved').length})
              </button>
              <button
                onClick={() => setSubmissionStatusFilter('rejected')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  submissionStatusFilter === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rejected ({taskSubmissions.filter((s) => s.status === 'rejected').length})
              </button>
            </div>
          </div>

          {taskSubmissions.filter((s) => submissionStatusFilter === 'all' || s.status === submissionStatusFilter).length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800/80">
              No task submissions match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Worker</th>
                    <th className="px-4 py-3 font-semibold">Task & Reward</th>
                    <th className="px-4 py-3 font-semibold min-w-[280px]">Submitted Proof</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Compliance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {taskSubmissions
                    .filter((s) => submissionStatusFilter === 'all' || s.status === submissionStatusFilter)
                    .map((sub: any) => {
                      const screenshot = sub.screenshotUrl || sub.proofData?.screenshotUrl;
                      const proofLink = sub.proofUrl || sub.proofData?.proofUrl;
                      const notes = sub.textNotes || sub.proofData?.textNotes || '';
                      const txnOrProfileId = sub.transactionOrProfileId || sub.proofData?.transactionOrProfileId || sub.profileId || sub.transactionId || '';

                      return (
                        <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-white">{sub.userName || sub.userFullName || 'Worker'}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{sub.userEmail || `User: ${sub.userId}`}</div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-white line-clamp-1">{sub.taskTitle}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-bold text-emerald-400 font-['Space_Grotesk'] text-sm">
                                ${(sub.rewardAmount ?? 0.50).toFixed(2)}
                              </span>
                              {sub.taskCategory && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-medium">
                                  {sub.taskCategory}
                                </span>
                              )}
                            </div>
                            {sub.targetUrl && (
                              <a
                                href={sub.targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 mt-1 truncate max-w-[200px]"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" /> Link: {sub.targetUrl}
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="space-y-2">
                              {/* Transaction or Profile ID */}
                              {txnOrProfileId && (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-200">
                                  <span className="text-[10px] uppercase font-bold text-amber-400 font-sans tracking-wide">
                                    ID / Username:
                                  </span>
                                  <span className="font-mono font-bold text-xs text-white select-all">
                                    {txnOrProfileId}
                                  </span>
                                </div>
                              )}

                              {/* Text notes */}
                              {notes && (
                                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-sans text-[11px] text-slate-200 leading-relaxed max-w-sm whitespace-pre-wrap">
                                  <span className="font-semibold text-slate-400 text-[10px] block mb-0.5">Work Notes:</span>
                                  {notes}
                                </div>
                              )}

                              {/* Screenshot and external links */}
                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                {screenshot ? (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (screenshot) {
                                          setActiveScreenshotPreview({
                                            url: screenshot,
                                            title: sub?.taskTitle || 'Task Proof Submission',
                                            userName: sub?.userName || sub?.userFullName || 'Worker',
                                            submittedAt: sub?.submittedAt || sub?.createdAt,
                                          });
                                        }
                                      }}
                                      className="block w-14 h-11 rounded-lg border border-purple-800/80 overflow-hidden bg-black shrink-0 hover:opacity-80 transition cursor-pointer relative group/thumb shadow-sm"
                                      title="Click to view full image in preview"
                                    >
                                      <img
                                        src={screenshot}
                                        alt="Proof"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                        <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (screenshot) {
                                          setActiveScreenshotPreview({
                                            url: screenshot,
                                            title: sub?.taskTitle || 'Task Proof Submission',
                                            userName: sub?.userName || sub?.userFullName || 'Worker',
                                            submittedAt: sub?.submittedAt || sub?.createdAt,
                                          });
                                        }
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      <ZoomIn className="w-3.5 h-3.5 text-purple-400" /> View Screenshot
                                    </button>
                                  </div>
                                ) : null}
                                {proofLink && (
                                  <a
                                    href={proofLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 hover:text-white text-[10px] font-semibold transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" /> Verification Link
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}<br />
                            <span className="text-[10px] text-slate-500">{new Date(sub.submittedAt || sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {sub.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Approved & Credited
                              </span>
                            ) : sub.status === 'rejected' ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-400 border border-rose-800/80 text-[10px] font-bold">
                                  <XCircle className="w-3 h-3" /> Rejected
                                </span>
                                {sub.rejectionReason && (
                                  <p className="text-[10px] text-rose-300 max-w-[150px] truncate" title={sub.rejectionReason}>
                                    {sub.rejectionReason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/80 text-[10px] font-bold">
                                <Clock className="w-3 h-3" /> Pending Review
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {sub.status === 'pending_review' && (
                                <>
                                  <button
                                    onClick={() => handleApproveSubmission(sub.id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                                    title="Credit reward directly into user wallet balance"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve (+${(sub.rewardAmount ?? 0.50).toFixed(2)})
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectId(sub.id);
                                      setRejectType('task_submission');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Reject submission with feedback"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </>
                              )}
                              {/* Delete Submission Button */}
                              <button
                                onClick={() =>
                                  setItemToDelete({
                                    type: 'submission',
                                    id: sub.id,
                                    title: sub.taskTitle || 'Task Submission',
                                    meta: `Submitted by: ${sub.userName || sub.userId} | Status: ${sub.status}`,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-colors cursor-pointer"
                                title="Permanently delete submission"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. MANAGE TASKS & NATIVE EARNING ENGINE */}
      {adminTab === 'tasks' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          {/* Header & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                Dynamic Microtasks & Earning Engine Management
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create and publish microtasks with proof requirements, manage slots and rewards, and approve worker submissions.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setAdminTab('task_reviews')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/60 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Task Approvals ({taskSubmissions.filter((s) => s.status === 'pending_review').length})
              </button>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setNewTaskTitle('');
                  setNewTaskCategory('Micro Task');
                  setNewTaskDesc('');
                  setNewTaskProofRequirements('');
                  setNewTaskReward('0.25');
                  setNewTaskCoins('250');
                  setNewTaskTimerSeconds('15');
                  setNewTaskYoutubeId('');
                  setNewTaskSlots('50');
                  setNewTaskVerificationType('screenshot_and_text');
                  setNewTaskTargetUrl('');
                  setNewTaskInstructions('1. Open verified link\n2. Complete requested task instructions\n3. Submit required proof and screenshot');
                  setShowNewTaskModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Microtask
              </button>
            </div>
          </div>

          {/* Task Analytics Stats Bar */}
          {taskAnalytics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Total Tasks</span>
                <strong className="text-sm font-bold text-white font-['Space_Grotesk']">{taskAnalytics.totalTasks} ({taskAnalytics.activeTasks} Active)</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">PTC / Video Completions</span>
                <strong className="text-sm font-bold text-cyan-400 font-['Space_Grotesk']">{taskAnalytics.totalCompletions.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Social Submissions</span>
                <strong className="text-sm font-bold text-indigo-400 font-['Space_Grotesk']">{taskAnalytics.totalSubmissions} ({taskAnalytics.pendingSubmissions} Pending)</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Coins Distributed</span>
                <strong className="text-sm font-bold text-amber-400 font-['Space_Grotesk']">+{taskAnalytics.totalCoinsDistributed.toLocaleString()} Coins</strong>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Total Ledger Escrow Payout</span>
                <strong className="text-sm font-bold text-emerald-400 font-['Space_Grotesk']">${taskAnalytics.totalUsdDistributed.toFixed(3)} USD</strong>
              </div>
            </div>
          )}

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {['all', 'PTC', 'YouTube', 'Social', 'App'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTaskCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                    taskCategoryFilter === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
              placeholder="Search tasks by title or category..."
              className="px-3 py-1.5 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {tasksList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300 text-sm">No tasks in database</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                Click &quot;Add Native Task&quot; above to create verified website visit, video, or social earning tasks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasksList
                .filter((t) => {
                  if (taskCategoryFilter !== 'all' && !t.category?.toLowerCase().includes(taskCategoryFilter.toLowerCase())) {
                    return false;
                  }
                  if (taskSearchQuery && !t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())) {
                    return false;
                  }
                  return true;
                })
                .map((t) => {
                  const coins = t.rewardCoins || Math.round((t.rewardAmount || 0.015) * 1000);
                  const usd = t.rewardAmount || coins / 1000;
                  const isTimer = t.timerSeconds || t.category?.includes('PTC') || t.category?.includes('YouTube');

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl bg-slate-950 border space-y-3 text-xs flex flex-col justify-between transition-all ${
                        t.status === 'active' ? 'border-slate-800 hover:border-slate-700' : 'border-amber-900/40 opacity-75'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-semibold">
                              {t.category}
                            </span>
                            {isTimer && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                                ⏱️ {t.timerSeconds || 15}s
                              </span>
                            )}
                            {t.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/80 text-[10px] font-bold">
                                Inactive
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-amber-400 font-['Space_Grotesk'] text-sm">
                              +{coins} Coins
                            </span>
                            <span className="text-[10px] text-slate-500 block">(${usd.toFixed(3)})</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-white leading-snug">{t.title}</h4>
                        <p className="text-slate-400 line-clamp-2 leading-relaxed">{t.description}</p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                          <span>
                            Slots: <strong className="text-slate-200">{t.slotsRemaining} / {t.totalSlots}</strong>
                          </span>
                          {(t as any).completionsCount !== undefined && (
                            <span className="text-cyan-400 font-medium">
                              {(t as any).completionsCount} Completions
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Administrative Controls: Status Switch, Edit, Delete */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                        {/* Active / Inactive Switch */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={t.status === 'active'}
                            onClick={() => handleToggleDeactivateTask(t)}
                            disabled={taskActionLoading === t.id}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              t.status === 'active' ? 'bg-emerald-600' : 'bg-slate-700'
                            } disabled:opacity-50`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                t.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[11px] font-semibold ${t.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {t.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Edit Task Button */}
                          <button
                            onClick={() => handleOpenEditTask(t)}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 border border-slate-700"
                            title="Edit task parameters"
                          >
                            Edit
                          </button>

                          {/* Delete Task Button with instant removal on single click */}
                          <button
                            type="button"
                            style={{ pointerEvents: 'auto', zIndex: 50 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteTaskDirect(t);
                            }}
                            onTouchEnd={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteTaskDirect(t);
                            }}
                            disabled={taskActionLoading === t.id}
                            className="px-2.5 py-1 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                            title="Permanently delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 5B. MANAGE DIGITAL MARKETING SERVICES */}
      {adminTab === 'services' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Digital Marketing Services Management ({servicesList.length})
              </h3>
              <p className="text-xs text-slate-400">
                Manage freelancer services, deliverables, and agency packages listed on the marketplace.
              </p>
            </div>
          </div>

          {servicesList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300 text-sm">No services listed yet</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                All mock services have been cleared. Freelancer and agency services posted will appear here for administrative oversight.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicesList.map((srv) => (
                <div key={srv.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-semibold">
                        {srv.category}
                      </span>
                      <span className="font-bold text-emerald-400 font-['Space_Grotesk'] text-sm">
                        ${srv.price}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{srv.title}</h4>
                    <p className="text-slate-400 line-clamp-2 leading-relaxed">{srv.description}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Seller: <strong className="text-slate-200">{srv.sellerName}</strong></span>
                      <span>Delivery: <strong className="text-slate-200">{srv.deliveryDays} days</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/70 text-[10px] font-bold">
                      {srv.status || 'Active'}
                    </span>

                    <button
                      onClick={() =>
                        setItemToDelete({
                          type: 'service',
                          id: srv.id,
                          title: srv.title,
                          meta: `Seller: ${srv.sellerName} | Price: $${srv.price} | Category: ${srv.category}`,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title="Permanently remove service from marketplace"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5C. MANAGE FREELANCE JOB BOARD */}
      {adminTab === 'jobs' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Freelance Job Board Listings ({jobsList.length})
              </h3>
              <p className="text-xs text-slate-400">
                Oversee client project postings, milestones, and proposal bids across the platform.
              </p>
            </div>
          </div>

          {jobsList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <Activity className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300 text-sm">No job postings found</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                All mock jobs have been cleared. Client projects posted via the marketplace will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobsList.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-semibold">
                        {job.category}
                      </span>
                      <span className="font-bold text-emerald-400 font-['Space_Grotesk'] text-sm">
                        ${job.budget}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{job.title}</h4>
                    <p className="text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Client: <strong className="text-slate-200">{job.posterName}</strong></span>
                      <span>Proposals: <strong className="text-slate-200">{job.proposalsCount || 0}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/70 text-[10px] font-bold">
                      {job.status || 'Open'}
                    </span>

                    <button
                      onClick={() =>
                        setItemToDelete({
                          type: 'job',
                          id: job.id,
                          title: job.title,
                          meta: `Client: ${job.posterName} | Budget: $${job.budget} | Category: ${job.category}`,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title="Permanently remove job from board"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5D. MANAGE DIGITAL PRODUCTS & SOPS */}
      {adminTab === 'products' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Digital Products & SOPs Vault ({productsList.length})
              </h3>
              <p className="text-xs text-slate-400">
                Manage downloadable templates, agency SOP blueprints, marketing funnels, and design assets.
              </p>
            </div>
            <button
              onClick={() => setShowNewProductModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 self-start sm:self-auto shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Add Digital Product
            </button>
          </div>

          {productsList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300 text-sm">No digital products in vault</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                All mock products have been cleared. Click &quot;Add Digital Product&quot; above to publish a blueprint or SOP template.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productsList.map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 text-[10px] font-semibold border border-purple-800/60">
                        {prod.category}
                      </span>
                      <span className="font-bold text-emerald-400 font-['Space_Grotesk'] text-sm">
                        ${prod.price?.toFixed(2)}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{prod.title}</h4>
                    <p className="text-slate-400 line-clamp-2 leading-relaxed">{prod.description}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                      <span>File Size: <strong className="text-slate-200">{prod.fileSizeMb || 2.5} MB</strong></span>
                      <a
                        href={prod.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        Download Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    {/* Published / Unpublished Toggle */}
                    <button
                      onClick={() => handleToggleProductPublish(prod)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        prod.published !== false
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {prod.published !== false ? 'Published (Active)' : 'Unpublished (Hidden)'}
                    </button>

                    <button
                      onClick={() =>
                        setItemToDelete({
                          type: 'product',
                          id: prod.id,
                          title: prod.title,
                          meta: `Category: ${prod.category} | Price: $${prod.price?.toFixed(2)}`,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title="Permanently remove digital product"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. KYC VERIFICATIONS */}
      {adminTab === 'kyc' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Pending KYC Identity Verifications</h3>

          {kycUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No pending KYC submissions.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {kycUsers.map((k) => (
                <div key={k.userId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-white">{k.fullName} (@{k.username})</h4>
                    <p className="text-slate-300 mt-1">
                      {k.profile.kycDocumentType}: <strong className="font-mono text-cyan-400">{k.profile.kycDocumentNumber}</strong>
                    </p>
                    {k.profile.kycNotes && <p className="text-slate-400 text-[11px]">Notes: {k.profile.kycNotes}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveKyc(k.userId)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve KYC
                    </button>
                    <button
                      onClick={() => {
                        setRejectId(k.userId);
                        setRejectType('kyc');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. PAYMENT GATEWAY SETTINGS */}
      {adminTab === 'gateways' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Payment & Settlement Gateways</h3>
              <p className="text-xs text-slate-400">
                Production disbursement routes, environment variables, webhook callbacks, and credential statuses.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-full font-medium">
                Mandatory Admin Compliance Protocol
              </span>
            </div>
          </div>

          {/* Payout Channels Policy */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Direct Manual Payout Operational:</span> All payout methods (bKash Personal, Nagad Personal, Rocket Personal, USDT / Binance Pay) allow direct user submissions and route directly to the Admin Payout Disbursal Queue for immediate review and fulfillment.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gateways.map((gw) => {
              const spec = gatewaySpecs.find((s: any) => s.id === gw.id);
              const isConfigured = spec ? spec.isConfigured : gw.isConfigured;

              return (
                <div key={gw.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{gw.name}</span>
                      <span className="block text-[11px] text-slate-500">Method ID: {gw.id}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Active
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {gw.statusMessage || 'Active and accepting direct manual withdrawal requests.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Min Payout</span>
                      <span className="text-white font-semibold">${gw.minWithdrawal || 10}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Platform Fee</span>
                      <span className="text-white font-semibold">{gw.feePercentage || 0}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Settlement</span>
                      <span className="text-white font-semibold">{gw.processingTime || '1-3 Business Days'}</span>
                    </div>
                  </div>

                  {/* Environment Variables Checklist */}
                  {spec && spec.requiredEnvVars && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Environment Secrets</span>
                      <div className="space-y-1">
                        {spec.requiredEnvVars.map((ev: any) => (
                          <div key={ev.key} className="flex items-center justify-between text-[10px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            <span className={ev.isSet ? 'text-emerald-400' : 'text-slate-400'}>{ev.key}</span>
                            <span className={ev.isSet ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                              {ev.isSet ? 'SET' : 'MISSING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Webhook Endpoint */}
                  {spec && spec.webhookUrl && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Merchant Webhook URL</span>
                      <div className="text-[10px] font-mono text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 break-all select-all">
                        {spec.webhookUrl}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Model: {spec?.settlementModel ? spec.settlementModel.replace(/_/g, ' ') : 'Standard Payout'}
                    </span>
                    <button
                      onClick={() => handleToggleGateway(gw.id, gw.isConfigured)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        gw.isConfigured
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      {gw.isConfigured ? 'Disable Route' : 'Mark Configured'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REWARD & REVENUE SETTINGS */}
      {adminTab === 'reward_settings' && (
        <div>
          <AdminRewardSettings />
        </div>
      )}

      {/* VIDEO TASK SETTINGS */}
      {adminTab === 'video_settings' && (
        <div>
          <AdminVideoTaskSettings />
        </div>
      )}

      {/* SUPPORT & ISSUE TICKETS */}
      {adminTab === 'support' && (
        <div>
          <AdminSupportTickets
            tickets={supportTickets}
            onRefresh={fetchAdminData}
            apiFetch={apiFetch}
            currentUser={user}
          />
        </div>
      )}

      {/* 8. AUDIT LOGS */}
      {adminTab === 'logs' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Platform System Audit Trail</h3>
            <span className="text-xs text-slate-400">Total Entries: {logs.length}</span>
          </div>
          {logs.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <p className="font-semibold text-slate-300 text-sm">No audit logs recorded (0)</p>
              <p className="text-slate-500">Administrative actions, financial events, and security audits will be logged here in real-time.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div>
                      <span className="font-semibold text-cyan-400">[{log.action}]</span>{' '}
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                    <span className="block text-[10px] text-slate-500">
                      Actor: {log.actorEmail || log.actorId} {log.targetModel ? `• Target: ${log.targetModel}` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp || (log as any).createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Specify Rejection Reason</h3>
            <p className="text-xs text-slate-400">
              This message is recorded in the audit trail and sent to the member. Leave blank to use default reason.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete deliverable proof or screenshot not verified (default reason applied if blank)"
              className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setRejectId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer shadow-lg shadow-rose-950"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE WITHDRAWAL MODAL */}
      {completingWd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Disburse Payout Settlement
              </h3>
              <span className="text-[11px] font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {completingWd.withdrawalNumber}
              </span>
            </div>

            {/* Recipient Account Details with One-Click Copy */}
            {(() => {
              const accNum =
                completingWd.accountDetails?.accountNumber ||
                completingWd.accountDetails?.emailOrWalletAddress ||
                (completingWd as any).accountIdentifier ||
                (typeof completingWd.accountDetails === 'string' ? completingWd.accountDetails : 'N/A');

              return (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Send Payout To:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold text-[10px]">
                      {completingWd.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-mono text-cyan-300 font-bold text-sm select-all break-all">
                      {accNum}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(accNum);
                        setCopiedAccount(accNum);
                        setTimeout(() => setCopiedAccount(null), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold shrink-0 flex items-center gap-1 transition-colors"
                    >
                      {copiedAccount === accNum ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <span>Member: <strong className="text-white">{completingWd.userName || 'Member'}</strong></span>
                    <span>Net to Disburse: <strong className="text-emerald-400 font-mono text-sm">${completingWd.netAmount.toFixed(2)}</strong></span>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1">
                Transaction Reference Number / TxID (Optional or Bank Reference)
              </label>
              <input
                type="text"
                value={txRefNumber}
                onChange={(e) => setTxRefNumber(e.target.value)}
                placeholder="e.g. BKS-894729103 or TRC-0x9812... (or leave blank to auto-generate)"
                className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCompletingWd(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Mark Disbursed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DATABASE & STORAGE DIAGNOSTICS MODAL */}
      {showDbDiagnostics && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Database & Storage Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setShowDbDiagnostics(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Architecture overview */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">Authoritative Disk Storage</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    100% Persistent
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Target: <code className="text-slate-300 font-mono">data/nexvora.db.json</code>. Persists all registered users, microtasks, withdrawals, and submissions directly to server disk. Survives browser refresh and server restarts.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-slate-200">Supabase Cloud Database</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                      supabaseStatus === 'connected'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {supabaseStatus === 'connected' ? 'Connected' : 'Degraded (Fallback active)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  URL: <code className="text-slate-300 font-mono">https://nnxdtwkwohjnkhynfujp.supabase.co</code>. Table <code className="text-slate-300 font-mono">microtasks</code> is mapped and synchronized.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-200">Client-Side Cache (LocalStorage)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Provides zero-latency optimistic UI caching with automated cross-tab synchronization.
                </p>
              </div>
            </div>

            {/* Diagnostic Logs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Live Diagnostic Health Logs
              </span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                {diagnosticsLogs.length > 0 ? (
                  diagnosticsLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">›</span>
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No diagnostic logs recorded yet.</div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                onClick={async () => {
                  setActionFeedback('Re-testing database endpoints...');
                  await fetchAdminData();
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Run Health Ping
              </button>
              <button
                onClick={() => setShowDbDiagnostics(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  {editingTask ? `Edit Microtask: ${editingTask.title}` : 'Add New Microtask'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowNewTaskModal(false);
                  setEditingTask(null);
                }}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Visit Nexvora Finance Partner & Verify 15s"
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category & Verification Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setNewTaskCategory(cat);
                      if (cat.includes('PTC')) {
                        setNewTaskVerificationType('instant_timer');
                        setNewTaskCoins('15');
                        setNewTaskReward('0.015');
                        setNewTaskTimerSeconds('15');
                      } else if (cat.includes('YouTube')) {
                        setNewTaskVerificationType('youtube_watch');
                        setNewTaskCoins('35');
                        setNewTaskReward('0.035');
                        setNewTaskTimerSeconds('45');
                      } else {
                        setNewTaskVerificationType('screenshot_and_text');
                        setNewTaskCoins('100');
                        setNewTaskReward('0.10');
                      }
                    }}
                    className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="PTC (Website Visit)">PTC (Website Visit)</option>
                    <option value="YouTube Video">YouTube Video Watch</option>
                    <option value="Social Media">Social Media (Telegram / Facebook / X)</option>
                    <option value="App Testing">App Discovery & Install</option>
                    <option value="Survey & Research">Survey & Research</option>
                    <option value="Data Verification">Data Verification</option>
                    <option value="Micro Task">General Micro Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Verification Method</label>
                  <select
                    value={newTaskVerificationType}
                    onChange={(e) => setNewTaskVerificationType(e.target.value)}
                    className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="instant_timer">Instant Timer & Anti-Cheat Puzzle</option>
                    <option value="youtube_watch">YouTube Watch-Time Verification</option>
                    <option value="screenshot_and_text">Manual Proof (Screenshot / Text Review)</option>
                    <option value="link_submission">Profile / Post Link Submission</option>
                  </select>
                </div>
              </div>

              {/* Rewards (Coins vs USD sync) & Slots */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Reward per Completed Task</span>
                  <div className="flex items-center gap-1.5">
                    {[0.25, 0.50, 0.75, 1.00, 2.00].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setNewTaskReward(amt.toFixed(2));
                          setNewTaskCoins((amt * 1000).toString());
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          Number(newTaskReward) === amt
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        ${amt.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-emerald-400 font-semibold mb-1 text-xs">Reward (USD $)</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={newTaskReward}
                      onChange={(e) => {
                        const r = e.target.value;
                        setNewTaskReward(r);
                        const num = Number(r);
                        if (!isNaN(num)) setNewTaskCoins(Math.round(num * 1000).toString());
                      }}
                      className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 0.50"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Worker receives this</span>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-1 text-xs">Reward (Coins)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newTaskCoins}
                      onChange={(e) => {
                        const c = e.target.value;
                        setNewTaskCoins(c);
                        const num = Number(c);
                        if (!isNaN(num)) setNewTaskReward((num / 1000).toFixed(3));
                      }}
                      className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g. 500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">1,000 Coins = $1.00</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1 text-xs">Total Worker Slots</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newTaskSlots}
                      onChange={(e) => setNewTaskSlots(e.target.value)}
                      className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. 100"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Max completions</span>
                  </div>
                </div>
              </div>

              {/* Timer Seconds (for PTC and YouTube) */}
              {(newTaskCategory.includes('PTC') || newTaskCategory.includes('YouTube') || newTaskVerificationType === 'instant_timer' || newTaskVerificationType === 'youtube_watch') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Timer Duration (Seconds)</label>
                    <select
                      value={newTaskTimerSeconds}
                      onChange={(e) => setNewTaskTimerSeconds(e.target.value)}
                      className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="15">15 Seconds (Standard PTC)</option>
                      <option value="30">30 Seconds (Medium PTC)</option>
                      <option value="45">45 Seconds (Video Watch)</option>
                      <option value="60">60 Seconds (Full Video / In-Depth)</option>
                      <option value="90">90 Seconds (Extended)</option>
                    </select>
                  </div>

                  {newTaskCategory.includes('YouTube') && (
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">YouTube Video ID</label>
                      <input
                        type="text"
                        value={newTaskYoutubeId}
                        onChange={(e) => {
                          let val = e.target.value.trim();
                          // Support full youtube url extraction:
                          if (val.includes('v=')) {
                            val = val.split('v=')[1].split('&')[0];
                          } else if (val.includes('youtu.be/')) {
                            val = val.split('youtu.be/')[1].split('?')[0];
                          }
                          setNewTaskYoutubeId(val);
                        }}
                        placeholder="e.g. dQw4w9WgXcQ"
                        className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Target Work URL / Specific External Link */}
              <div>
                <label className="block text-slate-200 font-bold mb-1 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Specific External Link (Job Destination URL) *</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Workers click this link to perform the job</span>
                </label>
                <input
                  type="url"
                  value={newTaskTargetUrl}
                  onChange={(e) => setNewTaskTargetUrl(e.target.value)}
                  placeholder="https://example.com/target-link, https://t.me/... or partner portal"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-1 text-xs">Task Overview / Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Describe the job overview and what needs to be done..."
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Step by step instructions */}
              <div>
                <label className="block text-slate-300 font-medium mb-1 text-xs">
                  Step-by-Step Instructions (One step per line) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTaskInstructions}
                  onChange={(e) => setNewTaskInstructions(e.target.value)}
                  placeholder="1. Click the external link above to open the job page&#10;2. Register or complete the required action&#10;3. Take a screenshot or copy your profile/transaction ID"
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Proof Requirements */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-purple-400 font-semibold flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Proof Requirements *</span>
                  </label>
                  <span className="text-[10px] text-slate-500">What workers must submit</span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={newTaskProofRequirements}
                  onChange={(e) => setNewTaskProofRequirements(e.target.value)}
                  placeholder="e.g. Screenshot of completed screen or your Profile / Transaction ID"
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-950/40 cursor-pointer flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{editingTask ? 'Save Microtask Changes' : 'Publish Microtask to Marketplace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW DIGITAL PRODUCT MODAL */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Create & Publish Digital Product</h3>
              </div>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProductTitle}
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  placeholder="e.g. Ultimate SEO Agency Playbook & SOPs"
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Marketing SOPs">Marketing SOPs</option>
                    <option value="Funnels & Landing Pages">Funnels & Landing Pages</option>
                    <option value="E-Books & Guides">E-Books & Guides</option>
                    <option value="Design Assets">Design Assets</option>
                    <option value="Software Scripts">Software Scripts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description & Deliverables</label>
                <textarea
                  rows={3}
                  required
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Describe files included, target audience, and usage rights..."
                  className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Download URL</label>
                  <input
                    type="url"
                    required
                    value={newProductDownloadUrl}
                    onChange={(e) => setNewProductDownloadUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or secure vault URL"
                    className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">File Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={newProductFileSize}
                    onChange={(e) => setNewProductFileSize(e.target.value)}
                    className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIFIED PERMANENT DELETION CONFIRMATION MODAL (Tasks, Services, Jobs, Products) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Permanent {itemToDelete.type.toUpperCase()} Deletion
                </h3>
                <p className="text-xs text-rose-400 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-200 font-semibold">{itemToDelete.title}</p>
              {itemToDelete.meta && <p className="text-slate-400">{itemToDelete.meta}</p>}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete this {itemToDelete.type}? It will be completely removed from the marketplace and dashboard.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-item-btn"
                disabled={taskActionLoading === itemToDelete.id}
                onClick={handleConfirmDeleteItem}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-950 transition-colors disabled:opacity-50"
              >
                {taskActionLoading === itemToDelete.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Yes, Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. SAFE SCREENSHOT PROOF LIGHTBOX VIEWER */}
      {activeScreenshotPreview && (
        <div
          id="admin-screenshot-lightbox"
          onClick={() => setActiveScreenshotPreview(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden animate-scaleUp"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-purple-400" /> Proof Screenshot
                  </span>
                  {activeScreenshotPreview.userName && (
                    <span className="text-xs text-slate-300 font-medium truncate">
                      by <strong className="text-white">{activeScreenshotPreview.userName}</strong>
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                  {activeScreenshotPreview.title || 'Microtask Submission Proof'}
                </h4>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeScreenshotPreview.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  title="Open image in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveScreenshotPreview(null);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
                  title="Close viewer (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Preview Canvas */}
            <div className="p-3 sm:p-6 flex-1 overflow-auto bg-slate-950/90 flex items-center justify-center min-h-[300px] max-h-[72vh]">
              <img
                src={activeScreenshotPreview.url}
                alt="Full proof screenshot"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.img-err-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'img-err-fallback p-6 text-center text-rose-400 text-xs space-y-2';
                    fallback.innerHTML = '<span>Failed to render image format. You can still open it in a new tab above.</span>';
                    parent.appendChild(fallback);
                  }
                }}
                className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-lg border border-slate-800/80"
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
              <span>Click outside or press Close to return to the submissions table.</span>
              <button
                type="button"
                onClick={() => setActiveScreenshotPreview(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
