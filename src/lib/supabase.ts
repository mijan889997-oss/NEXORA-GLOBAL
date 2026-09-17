/**
 * NEXVORA GLOBAL - Supabase Database Client & Real-Time Task Management
 * Project URL: https://nnxdtwkwohjnkhynfujp.supabase.co
 * Anon / Publishable Key: sb_publishable_gDmobEaA5sK7jgA43gG8Dw_LbtEltO3
 */

import { createClient } from '@supabase/supabase-js';
import type { Task, TaskSubmission, Withdrawal, WithdrawalStatus } from '../types';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://nnxdtwkwohjnkhynfujp.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_gDmobEaA5sK7jgA43gG8Dw_LbtEltO3';

// Official Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const supabaseClient = supabase;

/**
 * Normalizes Supabase database row to frontend Task interface
 */
export function mapRowToTask(row: any): Task {
  const instructions = Array.isArray(row.instructions)
    ? row.instructions
    : typeof row.proof_instructions === 'string'
    ? row.proof_instructions.split('\n').filter(Boolean)
    : typeof row.instructions === 'string'
    ? row.instructions.split('\n').filter(Boolean)
    : ['Complete task instructions and submit proof.'];

  const rewardAmount =
    typeof row.reward === 'number'
      ? row.reward
      : typeof row.reward_amount === 'number'
      ? row.reward_amount
      : typeof row.rewardAmount === 'number'
      ? row.rewardAmount
      : 0.025;

  const rewardCoins =
    typeof row.reward_coins === 'number'
      ? row.reward_coins
      : typeof row.rewardCoins === 'number'
      ? row.rewardCoins
      : Math.round(rewardAmount * 1000);

  const isActive =
    row.is_active !== undefined
      ? Boolean(row.is_active)
      : row.status !== undefined
      ? row.status === 'active'
      : true;

  const totalSlots = row.slots ?? row.total_slots ?? row.totalSlots ?? 100;
  const completedSlots = row.completed_slots ?? 0;
  const slotsRemaining = Math.max(0, totalSlots - completedSlots);

  return {
    id: String(row.id),
    title: row.title || 'Microtask',
    category: row.category || 'PTC (Website Visit)',
    description: row.proof_instructions || row.description || '',
    instructions,
    rewardAmount,
    rewardCoins,
    timerSeconds: row.timer_seconds ?? row.timerSeconds ?? 15,
    youtubeVideoId: row.youtube_video_id || row.youtubeVideoId || undefined,
    targetUrl: row.link || row.target_url || row.targetUrl || undefined,
    totalSlots,
    slotsRemaining,
    timeLimitMinutes: row.time_limit_minutes ?? row.timeLimitMinutes ?? 30,
    verificationType: row.verification_type || row.verificationType || 'instant_timer',
    proofRequirements: row.proof_instructions || row.proof_requirements || row.proofRequirements || undefined,
    status: isActive ? 'active' : 'inactive',
    createdById: row.created_by || row.createdById || 'admin',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || undefined,
  };
}

/**
 * Normalizes frontend Task to Supabase database row format matching public.microtasks schema
 */
export function mapTaskToRow(task: Partial<Task> & { title: string; category?: string }) {
  const reward =
    typeof task.rewardAmount === 'number'
      ? task.rewardAmount
      : typeof task.rewardCoins === 'number'
      ? Number((task.rewardCoins / 1000).toFixed(4))
      : 0.025;

  const isActive = task.status !== 'inactive';
  const proofInstructions =
    task.proofRequirements ||
    (Array.isArray(task.instructions) ? task.instructions.join('\n') : task.description) ||
    'Complete requirements and submit proof.';

  return {
    id: task.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: task.title,
    category: task.category || 'PTC (Website Visit)',
    reward: Number(reward.toFixed(4)),
    slots: task.totalSlots || 100,
    completed_slots: task.totalSlots ? Math.max(0, (task.totalSlots || 100) - (task.slotsRemaining ?? task.totalSlots)) : 0,
    link: task.targetUrl || (task.youtubeVideoId ? `https://www.youtube.com/watch?v=${task.youtubeVideoId}` : null),
    proof_instructions: proofInstructions,
    is_active: isActive,
    created_at: task.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalizes Supabase database row to TaskSubmission interface
 */
export function mapRowToSubmission(row: any): TaskSubmission {
  const textNotes = row.proof_text || row.text_notes || row.textNotes || row.proofData?.textNotes || '';
  const proofUrl = row.proof_image || row.proof_url || row.proofUrl || row.proofData?.proofUrl || '';
  const screenshotUrl = row.proof_image || row.screenshot_url || row.screenshotUrl || row.proofData?.screenshotUrl || '';
  const transactionOrProfileId =
    row.transaction_or_profile_id ||
    row.transactionOrProfileId ||
    row.proofData?.transactionOrProfileId ||
    '';

  const rewardAmount = typeof row.reward === 'number' ? row.reward : row.reward_amount ?? row.rewardAmount ?? 0.5;
  const rewardCoins = Math.round(rewardAmount * 1000);

  const rawStatus = String(row.status || 'pending').toLowerCase();
  let normalizedStatus: 'pending_review' | 'approved' | 'rejected' = 'pending_review';
  if (rawStatus === 'approved') {
    normalizedStatus = 'approved';
  } else if (rawStatus === 'rejected') {
    normalizedStatus = 'rejected';
  }

  return {
    id: String(row.id),
    taskId: String(row.task_id || row.taskId || ''),
    taskTitle: row.task_title || row.taskTitle || 'Microtask Submission',
    taskCategory: row.task_category || row.taskCategory || 'Microtask',
    rewardAmount,
    rewardCoins,
    userId: String(row.user_id || row.userId || ''),
    userName: row.user_name || row.userName || row.user_email || 'Member',
    userEmail: row.user_email || row.userEmail || '',
    proofData: {
      textNotes,
      proofUrl,
      screenshotUrl,
      transactionOrProfileId,
    },
    textNotes,
    proofUrl,
    screenshotUrl,
    transactionOrProfileId,
    status: normalizedStatus,
    rejectionReason: row.rejection_reason || row.rejectionReason || undefined,
    reviewedBy: row.reviewed_by || row.reviewedBy || undefined,
    reviewedAt: row.reviewed_at || row.reviewedAt || undefined,
    submittedAt: row.created_at || row.submitted_at || row.submittedAt || new Date().toISOString(),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalizes frontend TaskSubmission to Supabase row format matching public.task_submissions schema
 */
export function mapSubmissionToRow(sub: Partial<TaskSubmission>) {
  const proofData = sub.proofData || {};
  const proofText = sub.textNotes || proofData.textNotes || '';
  const proofImage = sub.screenshotUrl || proofData.screenshotUrl || sub.proofUrl || proofData.proofUrl || '';
  const reward = sub.rewardAmount || (sub.rewardCoins ? sub.rewardCoins / 1000 : 0.05);

  const rawStatus = String(sub.status || 'pending').toLowerCase();
  const dbStatus = rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : 'pending';

  return {
    id: sub.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    task_id: sub.taskId,
    user_id: sub.userId || 'guest',
    user_name: sub.userName || 'Member',
    proof_text: proofText,
    proof_image: proofImage,
    status: dbStatus,
    rejection_reason: sub.rejectionReason || null,
    reward: Number(reward.toFixed(4)),
    created_at: sub.submittedAt || sub.createdAt || new Date().toISOString(),
  };
}

// ==============================================================================
// MICROTASKS CRUD OPERATIONS
// ==============================================================================

/**
 * Fetch all microtasks from Supabase 'microtasks' table (with fallback to 'tasks' table)
 */
export async function fetchSupabaseMicrotasks(): Promise<Task[]> {
  try {
    // 1. Try 'microtasks' table first
    const { data: microData, error: microError } = await supabase
      .from('microtasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!microError && Array.isArray(microData) && microData.length > 0) {
      return microData.map(mapRowToTask);
    }

    // 2. Try 'tasks' table if 'microtasks' was empty or had error
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!taskError && Array.isArray(taskData) && taskData.length > 0) {
      return taskData.map(mapRowToTask);
    }

    if (microData && Array.isArray(microData)) {
      return microData.map(mapRowToTask);
    }
  } catch (err) {
    console.warn('[Supabase] fetchSupabaseMicrotasks notice:', err);
  }
  return [];
}

/**
 * Insert a microtask into Supabase
 */
export async function insertSupabaseMicrotask(task: Partial<Task> & { title: string }): Promise<{ task: Task | null; error: any }> {
  const row = mapTaskToRow(task);
  try {
    // Insert into 'microtasks' table
    const { data, error } = await supabase
      .from('microtasks')
      .insert([row])
      .select()
      .single();

    if (!error && data) {
      return { task: mapRowToTask(data), error: null };
    }

    // Fallback: Also try 'tasks' table
    const { data: tData, error: tErr } = await supabase
      .from('tasks')
      .insert([row])
      .select()
      .single();

    if (!tErr && tData) {
      return { task: mapRowToTask(tData), error: null };
    }

    return { task: mapRowToTask(row), error: error || tErr };
  } catch (err: any) {
    console.warn('[Supabase] insertSupabaseMicrotask notice:', err);
    return { task: mapRowToTask(row), error: err };
  }
}

/**
 * Update task in Supabase
 */
export async function updateSupabaseMicrotask(id: string, updates: Partial<Task>): Promise<{ success: boolean; error: any }> {
  try {
    const microtaskUpdates: Record<string, any> = {};
    if (updates.title !== undefined) microtaskUpdates.title = updates.title;
    if (updates.category !== undefined) microtaskUpdates.category = updates.category;
    if (updates.rewardAmount !== undefined) {
      microtaskUpdates.reward = Number(updates.rewardAmount);
    } else if ((updates as any).reward !== undefined) {
      microtaskUpdates.reward = Number((updates as any).reward);
    }
    if (updates.totalSlots !== undefined) {
      microtaskUpdates.slots = Number(updates.totalSlots);
    } else if ((updates as any).slots !== undefined) {
      microtaskUpdates.slots = Number((updates as any).slots);
    }
    if (updates.targetUrl !== undefined) {
      microtaskUpdates.link = updates.targetUrl;
    } else if (updates.youtubeVideoId) {
      microtaskUpdates.link = `https://www.youtube.com/watch?v=${updates.youtubeVideoId}`;
    }
    if (updates.proofRequirements !== undefined || updates.description !== undefined) {
      microtaskUpdates.proof_instructions = updates.proofRequirements || updates.description;
    }
    if (updates.status !== undefined) {
      microtaskUpdates.is_active = updates.status === 'active';
    } else if ((updates as any).is_active !== undefined) {
      microtaskUpdates.is_active = Boolean((updates as any).is_active);
    }

    const { error: microErr } = await supabase.from('microtasks').update(microtaskUpdates).eq('id', id);
    if (!microErr) return { success: true, error: null };

    console.warn('[Supabase microtasks update notice]:', microErr);
    return { success: false, error: microErr };
  } catch (err: any) {
    console.warn('[Supabase] updateSupabaseMicrotask notice:', err);
    return { success: false, error: err };
  }
}

/**
 * Toggle Active/Inactive status of microtask in Supabase
 */
export async function toggleSupabaseMicrotaskActive(id: string, isActive: boolean): Promise<{ success: boolean; error: any }> {
  try {
    const { error: microErr } = await supabase.from('microtasks').update({ is_active: isActive }).eq('id', id);
    if (!microErr) return { success: true, error: null };

    console.warn('[Supabase toggle notice]:', microErr);
    return { success: false, error: microErr };
  } catch (err: any) {
    console.warn('[Supabase] toggleSupabaseMicrotaskActive notice:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete a microtask from Supabase
 */
export async function deleteSupabaseMicrotask(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error: microErr } = await supabase.from('microtasks').delete().eq('id', id);
    const { error: taskErr } = await supabase.from('tasks').delete().eq('id', id);
    return { success: !microErr || !taskErr, error: microErr && taskErr ? microErr : null };
  } catch (err: any) {
    console.warn('[Supabase] deleteSupabaseMicrotask notice:', err);
    return { success: false, error: err };
  }
}

// ==============================================================================
// TASK SUBMISSIONS CRUD OPERATIONS
// ==============================================================================

/**
 * Fetch task submissions from Supabase 'task_submissions' table
 */
export async function fetchSupabaseSubmissions(): Promise<TaskSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('task_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(mapRowToSubmission);
    }
  } catch (err) {
    console.warn('[Supabase] fetchSupabaseSubmissions notice:', err);
  }
  return [];
}

/**
 * Insert a proof submission into Supabase 'task_submissions'
 */
export async function insertSupabaseSubmission(sub: Partial<TaskSubmission>): Promise<{ submission: TaskSubmission | null; error: any }> {
  const row = mapSubmissionToRow(sub);
  try {
    const { data, error } = await supabase
      .from('task_submissions')
      .insert([row])
      .select()
      .single();

    if (!error && data) {
      return { submission: mapRowToSubmission(data), error: null };
    }
    return { submission: mapRowToSubmission(row), error };
  } catch (err: any) {
    console.warn('[Supabase] insertSupabaseSubmission notice:', err);
    return { submission: mapRowToSubmission(row), error: err };
  }
}

/**
 * Update submission status in Supabase (e.g. approve or reject)
 */
export async function updateSupabaseSubmissionStatus(
  id: string,
  status: 'approved' | 'rejected' | 'pending_review',
  rejectionReason?: string,
  reviewedBy?: string
): Promise<{ success: boolean; error: any }> {
  const rowUpdates = {
    status,
    rejection_reason: rejectionReason || null,
    rejectionReason: rejectionReason || null,
    reviewed_by: reviewedBy || 'admin',
    reviewedBy: reviewedBy || 'admin',
    reviewed_at: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('task_submissions')
      .update(rowUpdates)
      .eq('id', id);

    return { success: !error, error };
  } catch (err: any) {
    console.warn('[Supabase] updateSupabaseSubmissionStatus notice:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete a submission from Supabase
 */
export async function deleteSupabaseSubmission(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.from('task_submissions').delete().eq('id', id);
    return { success: !error, error };
  } catch (err: any) {
    console.warn('[Supabase] deleteSupabaseSubmission notice:', err);
    return { success: false, error: err };
  }
}

// ==============================================================================
// REALTIME SUBSCRIPTIONS
// ==============================================================================

/**
 * Subscribe to realtime changes on 'microtasks' table
 */
export function subscribeToMicrotasks(onChange: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:microtasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'microtasks' }, (payload) => {
        onChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        onChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Realtime microtasks subscription error:', err);
    return () => {};
  }
}

/**
 * Subscribe to realtime changes on 'task_submissions' table
 */
export function subscribeToSubmissions(onChange: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:task_submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_submissions' }, (payload) => {
        onChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Realtime submissions subscription error:', err);
    return () => {};
  }
}

// ==============================================================================
// WITHDRAWALS CRUD & SYNC
// ==============================================================================

/**
 * Normalizes Supabase database row to frontend Withdrawal interface
 */
export function mapRowToWithdrawal(row: any): Withdrawal {
  const accountNumber =
    row.account_number ||
    row.accountNumber ||
    row.account_details?.accountNumber ||
    row.accountDetails?.accountNumber ||
    row.accountDetails?.emailOrWalletAddress ||
    row.account_identifier ||
    row.accountIdentifier ||
    (typeof row.account_details === 'string' ? row.account_details : '') ||
    (typeof row.accountDetails === 'string' ? row.accountDetails : '') ||
    '';

  const method = row.method || row.payment_method || row.paymentMethod || 'bKash Personal';
  const amount = Number(row.amount || 0);
  const fee = Number(row.fee || 0);
  const netAmount = Number(row.net_amount ?? row.netAmount ?? (amount - fee));
  const rawStatus = String(row.status || 'PENDING').toUpperCase();

  let normalizedStatus: WithdrawalStatus = 'Pending';
  if (rawStatus === 'APPROVED' || rawStatus === 'PAID' || rawStatus === 'COMPLETED') {
    normalizedStatus = 'Completed';
  } else if (rawStatus === 'REJECTED' || rawStatus === 'CANCELLED') {
    normalizedStatus = 'Rejected';
  } else if (rawStatus === 'PROCESSING') {
    normalizedStatus = 'Processing';
  } else if (rawStatus === 'UNDER REVIEW' || rawStatus === 'UNDER_REVIEW') {
    normalizedStatus = 'Under Review';
  } else {
    normalizedStatus = 'Pending';
  }

  const generatedWdNumber = row.withdrawal_number || row.withdrawalNumber || `WD-${String(row.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || Math.floor(100000 + Math.random() * 900000)}`;

  return {
    id: String(row.id),
    withdrawalNumber: generatedWdNumber,
    userId: String(row.user_id || row.userId || ''),
    userName: row.user_name || row.userName || 'Member',
    userEmail: row.user_email || row.userEmail || '',
    accountIdentifier: accountNumber,
    walletId: row.wallet_id || row.walletId || 'wal_default',
    amount,
    fee,
    netAmount,
    paymentMethod: method as any,
    accountDetails: {
      accountNumber,
      emailOrWalletAddress: accountNumber,
      accountHolderName: row.user_name || row.userName || 'Member',
    },
    status: normalizedStatus,
    adminFeedback: row.rejection_reason || row.admin_feedback || row.adminFeedback || undefined,
    paymentConfirmationRef: row.payment_confirmation_ref || row.paymentConfirmationRef || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

/**
 * Fetch all withdrawals from Supabase (for Admin Panel)
 */
export async function fetchSupabaseWithdrawals(): Promise<Withdrawal[]> {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] fetchSupabaseWithdrawals error:', error.message);
      return [];
    }

    if (Array.isArray(data)) {
      return data.map(mapRowToWithdrawal);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] fetchSupabaseWithdrawals exception:', err);
    return [];
  }
}

/**
 * Fetch a single user's withdrawals from Supabase
 */
export async function fetchUserSupabaseWithdrawals(userId: string): Promise<Withdrawal[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .or(`user_id.eq.${userId},userId.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback to querying all and filtering if OR filter isn't supported
      const all = await fetchSupabaseWithdrawals();
      return all.filter((w) => w.userId === userId);
    }

    if (Array.isArray(data)) {
      return data.map(mapRowToWithdrawal);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] fetchUserSupabaseWithdrawals exception:', err);
    return [];
  }
}

/**
 * Insert a new withdrawal request into Supabase public.withdrawals table
 */
export async function insertSupabaseWithdrawal(payload: {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  method: string;
  accountNumber: string;
  fee?: number;
  netAmount?: number;
}): Promise<{ success: boolean; withdrawal?: Withdrawal; error?: any }> {
  const rowId = payload.id || `wd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const wdNumber = `WD-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();
  const fee = payload.fee || 0;
  const netAmount = payload.netAmount || payload.amount;

  const rowData: Record<string, any> = {
    id: rowId,
    user_id: payload.userId,
    userId: payload.userId,
    user_name: payload.userName || 'Member',
    userName: payload.userName || 'Member',
    user_email: payload.userEmail || '',
    userEmail: payload.userEmail || '',
    amount: payload.amount,
    method: payload.method,
    payment_method: payload.method,
    paymentMethod: payload.method,
    account_number: payload.accountNumber,
    accountNumber: payload.accountNumber,
    account_details: {
      accountNumber: payload.accountNumber,
      emailOrWalletAddress: payload.accountNumber,
    },
    accountDetails: {
      accountNumber: payload.accountNumber,
      emailOrWalletAddress: payload.accountNumber,
    },
    status: 'PENDING',
    withdrawal_number: wdNumber,
    withdrawalNumber: wdNumber,
    fee,
    net_amount: netAmount,
    netAmount,
    created_at: now,
    createdAt: now,
    updated_at: now,
    updatedAt: now,
  };

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([rowData])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase] insertSupabaseWithdrawal notice (attempting minimal row):', error.message);
      // Fallback with strictly minimal columns matching schema: id, user_id, user_name, user_email, amount, method, account_number, status, created_at
      const minimalRow = {
        id: rowId,
        user_id: payload.userId,
        user_name: payload.userName || 'Member',
        user_email: payload.userEmail || '',
        amount: payload.amount,
        method: payload.method,
        account_number: payload.accountNumber,
        status: 'PENDING',
        created_at: now,
      };
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('withdrawals')
        .insert([minimalRow])
        .select()
        .single();

      if (fallbackError) {
        console.error('[Supabase] insertSupabaseWithdrawal fallback error:', fallbackError);
        return { success: false, error: fallbackError };
      }
      return { success: true, withdrawal: mapRowToWithdrawal(fallbackData || minimalRow) };
    }

    return { success: true, withdrawal: mapRowToWithdrawal(data || rowData) };
  } catch (err: any) {
    console.warn('[Supabase] insertSupabaseWithdrawal exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Update withdrawal status in Supabase (e.g. Approve/Paid or Reject/Refund)
 */
export async function updateSupabaseWithdrawalStatus(
  id: string,
  status: 'APPROVED' | 'PAID' | 'REJECTED' | 'PENDING' | 'Completed' | 'Rejected',
  options?: {
    rejectionReason?: string;
    paymentRef?: string;
    reviewedBy?: string;
  }
): Promise<{ success: boolean; error?: any }> {
  const normalizedStatus = status.toUpperCase();
  const now = new Date().toISOString();

  const updates: Record<string, any> = {
    status: normalizedStatus,
    updated_at: now,
    updatedAt: now,
  };

  if (options?.rejectionReason) {
    updates.rejection_reason = options.rejectionReason;
    updates.rejectionReason = options.rejectionReason;
    updates.admin_feedback = options.rejectionReason;
    updates.adminFeedback = options.rejectionReason;
  }

  if (options?.paymentRef) {
    updates.payment_confirmation_ref = options.paymentRef;
    updates.paymentConfirmationRef = options.paymentRef;
  }

  if (options?.reviewedBy) {
    updates.reviewed_by = options.reviewedBy;
    updates.reviewedBy = options.reviewedBy;
    updates.reviewed_at = now;
  }

  try {
    const { error } = await supabase
      .from('withdrawals')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.warn('[Supabase] updateSupabaseWithdrawalStatus error (attempting minimal status update):', error.message);
      const { error: minError } = await supabase
        .from('withdrawals')
        .update({ status: normalizedStatus })
        .eq('id', id);

      if (minError) {
        return { success: false, error: minError };
      }
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] updateSupabaseWithdrawalStatus exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete a withdrawal record from Supabase
 */
export async function deleteSupabaseWithdrawal(id: string): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase.from('withdrawals').delete().eq('id', id);
    return { success: !error, error };
  } catch (err: any) {
    console.warn('[Supabase] deleteSupabaseWithdrawal exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Subscribe to realtime changes on 'withdrawals' table
 */
export function subscribeToWithdrawals(onChange: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, (payload) => {
        onChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Realtime withdrawals subscription error:', err);
    return () => {};
  }
}

// ==============================================================================
// USER PROFILES (public.profiles) CRUD & REALTIME
// ==============================================================================

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  phone?: string | null;
  role: string;
  points: number;
  balance: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Fetch all registered users from public.profiles for Admin Panel
 */
export async function fetchSupabaseProfiles(): Promise<SupabaseProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((r: any) => ({
        id: String(r.id),
        email: r.email || '',
        full_name: r.full_name || r.fullName || r.email || 'Member',
        username: r.username || (r.email ? r.email.split('@')[0] : 'user'),
        phone: r.phone || r.phoneNumber || null,
        role: String(r.role || 'USER').toUpperCase(),
        points: Number(r.points || 0),
        balance: Number(r.balance || 0),
        status: String(r.status || 'ACTIVE').toUpperCase(),
        created_at: r.created_at || new Date().toISOString(),
        updated_at: r.updated_at || undefined,
      }));
    }
  } catch (err) {
    console.warn('[Supabase] fetchSupabaseProfiles notice:', err);
  }
  return [];
}

/**
 * Insert or update a user profile into public.profiles
 */
export async function upsertSupabaseProfile(profile: {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  phone?: string | null;
  role?: string;
  points?: number;
  balance?: number;
  status?: string;
  created_at?: string;
}): Promise<{ success: boolean; error?: any }> {
  const row = {
    id: profile.id,
    email: profile.email.toLowerCase().trim(),
    full_name: profile.full_name || profile.username || 'Member',
    username: (profile.username || profile.email.split('@')[0]).toLowerCase().trim(),
    phone: profile.phone || null,
    role: (profile.role || 'USER').toUpperCase(),
    points: typeof profile.points === 'number' ? profile.points : 100,
    balance: typeof profile.balance === 'number' ? Number(profile.balance.toFixed(4)) : 0.10,
    status: (profile.status || 'ACTIVE').toUpperCase(),
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert([row], { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] upsertSupabaseProfile notice:', error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] upsertSupabaseProfile exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Update points and balance for a user profile in Supabase
 */
export async function updateSupabaseProfileBalance(
  userId: string,
  pointsDelta: number,
  balanceDelta: number
): Promise<{ success: boolean; newPoints?: number; newBalance?: number; error?: any }> {
  try {
    const { data: current, error: fetchErr } = await supabase
      .from('profiles')
      .select('points, balance')
      .eq('id', userId)
      .single();

    if (fetchErr || !current) {
      return { success: false, error: fetchErr };
    }

    const newPoints = Math.max(0, Math.round(Number(current.points || 0) + pointsDelta));
    const newBalance = Math.max(0, Number((Number(current.balance || 0) + balanceDelta).toFixed(4)));

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        points: newPoints,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateErr) {
      return { success: false, error: updateErr };
    }

    return { success: true, newPoints, newBalance };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

/**
 * Subscribe to realtime changes on 'profiles' table
 */
export function subscribeToProfiles(onChange: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        onChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Realtime profiles subscription error:', err);
    return () => {};
  }
}

// ==============================================================================
// SUPPORT TICKETS (public.support_tickets) CRUD & REALTIME
// ==============================================================================

export interface SupabaseTicket {
  id: string;
  ticket_number: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  category?: string;
  subject: string;
  description: string;
  status: string;
  admin_reply?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Fetch all support tickets from public.support_tickets
 */
export async function fetchSupabaseTickets(): Promise<SupabaseTicket[]> {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('[Supabase] fetchSupabaseTickets notice:', err);
  }
  return [];
}

/**
 * Insert a support ticket into public.support_tickets
 */
export async function insertSupabaseTicket(ticket: {
  id?: string;
  ticket_number?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  category?: string;
  subject: string;
  description: string;
  status?: string;
}): Promise<{ success: boolean; ticket?: SupabaseTicket; error?: any }> {
  const rowId = ticket.id || `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tktNumber = ticket.ticket_number || `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const row = {
    id: rowId,
    ticket_number: tktNumber,
    user_id: ticket.user_id || 'guest',
    user_name: ticket.user_name || 'Member',
    user_email: ticket.user_email || '',
    category: ticket.category || 'General Inquiry',
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status || 'open',
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([row])
      .select()
      .single();

    if (!error && data) {
      return { success: true, ticket: data };
    }
    return { success: !error, ticket: row, error };
  } catch (err: any) {
    console.warn('[Supabase] insertSupabaseTicket notice:', err);
    return { success: false, ticket: row, error: err };
  }
}

/**
 * Update support ticket status / reply in public.support_tickets
 */
export async function updateSupabaseTicketStatus(
  id: string,
  status: string,
  options?: { adminReply?: string; resolutionNotes?: string }
): Promise<{ success: boolean; error?: any }> {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (options?.adminReply) updates.admin_reply = options.adminReply;
  if (options?.resolutionNotes) updates.resolution_notes = options.resolutionNotes;

  try {
    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id);

    return { success: !error, error };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

/**
 * Subscribe to realtime changes on 'support_tickets' table
 */
export function subscribeToTickets(onChange: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('public:support_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload) => {
        onChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Realtime tickets subscription error:', err);
    return () => {};
  }
}

