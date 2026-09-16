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
    : typeof row.instructions === 'string'
    ? row.instructions.split('\n').filter(Boolean)
    : ['Complete task instructions and submit proof.'];

  const rewardCoins =
    typeof row.reward_coins === 'number'
      ? row.reward_coins
      : typeof row.rewardCoins === 'number'
      ? row.rewardCoins
      : typeof row.reward_amount === 'number'
      ? Math.round(row.reward_amount * 1000)
      : typeof row.rewardAmount === 'number'
      ? Math.round(row.rewardAmount * 1000)
      : 25;

  const rewardAmount =
    typeof row.reward_amount === 'number'
      ? row.reward_amount
      : typeof row.rewardAmount === 'number'
      ? row.rewardAmount
      : Number((rewardCoins / 1000).toFixed(4));

  const isActive =
    row.is_active !== undefined
      ? Boolean(row.is_active)
      : row.status !== undefined
      ? row.status === 'active'
      : true;

  return {
    id: String(row.id),
    title: row.title || 'Microtask',
    category: row.category || 'PTC (Website Visit)',
    description: row.description || '',
    instructions,
    rewardAmount,
    rewardCoins,
    timerSeconds: row.timer_seconds ?? row.timerSeconds ?? 15,
    youtubeVideoId: row.youtube_video_id || row.youtubeVideoId || undefined,
    targetUrl: row.target_url || row.targetUrl || undefined,
    totalSlots: row.total_slots ?? row.totalSlots ?? 100,
    slotsRemaining: row.slots_remaining ?? row.slotsRemaining ?? row.total_slots ?? 100,
    timeLimitMinutes: row.time_limit_minutes ?? row.timeLimitMinutes ?? 30,
    verificationType: row.verification_type || row.verificationType || 'instant_timer',
    proofRequirements: row.proof_requirements || row.proofRequirements || undefined,
    status: isActive ? 'active' : 'inactive',
    createdById: row.created_by || row.createdById || 'admin',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || undefined,
  };
}

/**
 * Normalizes frontend Task to Supabase database row format
 */
export function mapTaskToRow(task: Partial<Task> & { title: string; category?: string }) {
  const rewardAmount =
    typeof task.rewardAmount === 'number'
      ? task.rewardAmount
      : typeof task.rewardCoins === 'number'
      ? Number((task.rewardCoins / 1000).toFixed(4))
      : 0.025;

  const rewardCoins =
    typeof task.rewardCoins === 'number'
      ? task.rewardCoins
      : Math.round(rewardAmount * 1000);

  const isActive = task.status !== 'inactive';

  return {
    id: task.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: task.title,
    category: task.category || 'PTC (Website Visit)',
    description: task.description || '',
    instructions: task.instructions || ['Complete task requirements and submit proof of work.'],
    proof_requirements: task.proofRequirements || null,
    proofRequirements: task.proofRequirements || null,
    reward_amount: rewardAmount,
    rewardAmount: rewardAmount,
    reward_coins: rewardCoins,
    rewardCoins: rewardCoins,
    timer_seconds: task.timerSeconds || 15,
    timerSeconds: task.timerSeconds || 15,
    youtube_video_id: task.youtubeVideoId || null,
    youtubeVideoId: task.youtubeVideoId || null,
    target_url: task.targetUrl || null,
    targetUrl: task.targetUrl || null,
    total_slots: task.totalSlots || 100,
    totalSlots: task.totalSlots || 100,
    slots_remaining: task.slotsRemaining ?? task.totalSlots ?? 100,
    slotsRemaining: task.slotsRemaining ?? task.totalSlots ?? 100,
    verification_type: task.verificationType || 'instant_timer',
    verificationType: task.verificationType || 'instant_timer',
    is_active: isActive,
    status: isActive ? 'active' : 'inactive',
    created_by: task.createdById || 'admin',
    createdById: task.createdById || 'admin',
    created_at: task.createdAt || new Date().toISOString(),
    createdAt: task.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalizes Supabase database row to TaskSubmission interface
 */
export function mapRowToSubmission(row: any): TaskSubmission {
  const textNotes = row.text_notes || row.textNotes || row.proofData?.textNotes || row.proof_text || '';
  const proofUrl = row.proof_url || row.proofUrl || row.proofData?.proofUrl || row.link || '';
  const screenshotUrl = row.screenshot_url || row.screenshotUrl || row.proofData?.screenshotUrl || '';
  const transactionOrProfileId =
    row.transaction_or_profile_id ||
    row.transactionOrProfileId ||
    row.proofData?.transactionOrProfileId ||
    row.profile_id ||
    row.transaction_id ||
    '';

  return {
    id: String(row.id),
    taskId: String(row.task_id || row.taskId || ''),
    taskTitle: row.task_title || row.taskTitle || 'Microtask Submission',
    taskCategory: row.task_category || row.taskCategory || 'Microtask',
    rewardAmount: row.reward_amount ?? row.rewardAmount ?? 0.5,
    rewardCoins: row.reward_coins ?? row.rewardCoins ?? 500,
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
    status: (row.status === 'approved' || row.status === 'rejected' ? row.status : 'pending_review') as any,
    rejectionReason: row.rejection_reason || row.rejectionReason || undefined,
    reviewedBy: row.reviewed_by || row.reviewedBy || undefined,
    reviewedAt: row.reviewed_at || row.reviewedAt || undefined,
    submittedAt: row.submitted_at || row.submittedAt || row.created_at || row.createdAt || new Date().toISOString(),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalizes frontend TaskSubmission to Supabase row format
 */
export function mapSubmissionToRow(sub: Partial<TaskSubmission>) {
  const proofData = sub.proofData || {};
  const textNotes = sub.textNotes || proofData.textNotes || '';
  const proofUrl = sub.proofUrl || proofData.proofUrl || '';
  const screenshotUrl = sub.screenshotUrl || proofData.screenshotUrl || '';
  const transactionOrProfileId = sub.transactionOrProfileId || proofData.transactionOrProfileId || '';

  return {
    id: sub.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    task_id: sub.taskId,
    taskId: sub.taskId,
    task_title: sub.taskTitle || 'Microtask',
    taskTitle: sub.taskTitle || 'Microtask',
    task_category: sub.taskCategory || 'Microtask',
    taskCategory: sub.taskCategory || 'Microtask',
    reward_amount: sub.rewardAmount || 0.5,
    rewardAmount: sub.rewardAmount || 0.5,
    reward_coins: sub.rewardCoins || 500,
    rewardCoins: sub.rewardCoins || 500,
    user_id: sub.userId,
    userId: sub.userId,
    user_name: sub.userName || 'Member',
    userName: sub.userName || 'Member',
    user_email: sub.userEmail || '',
    userEmail: sub.userEmail || '',
    text_notes: textNotes,
    textNotes: textNotes,
    proof_url: proofUrl,
    proofUrl: proofUrl,
    screenshot_url: screenshotUrl,
    screenshotUrl: screenshotUrl,
    transaction_or_profile_id: transactionOrProfileId,
    transactionOrProfileId: transactionOrProfileId,
    proof_data: { textNotes, proofUrl, screenshotUrl, transactionOrProfileId },
    proofData: { textNotes, proofUrl, screenshotUrl, transactionOrProfileId },
    status: sub.status || 'pending_review',
    rejection_reason: sub.rejectionReason || null,
    rejectionReason: sub.rejectionReason || null,
    reviewed_by: sub.reviewedBy || null,
    reviewedBy: sub.reviewedBy || null,
    reviewed_at: sub.reviewedAt || null,
    reviewedAt: sub.reviewedAt || null,
    submitted_at: sub.submittedAt || sub.createdAt || new Date().toISOString(),
    created_at: sub.createdAt || new Date().toISOString(),
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
    const rowUpdates: any = {};
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.instructions !== undefined) rowUpdates.instructions = updates.instructions;
    if (updates.proofRequirements !== undefined) {
      rowUpdates.proof_requirements = updates.proofRequirements;
      rowUpdates.proofRequirements = updates.proofRequirements;
    }
    if (updates.rewardAmount !== undefined) {
      rowUpdates.reward_amount = updates.rewardAmount;
      rowUpdates.rewardAmount = updates.rewardAmount;
      rowUpdates.reward_coins = updates.rewardCoins || Math.round(updates.rewardAmount * 1000);
      rowUpdates.rewardCoins = updates.rewardCoins || Math.round(updates.rewardAmount * 1000);
    }
    if (updates.timerSeconds !== undefined) {
      rowUpdates.timer_seconds = updates.timerSeconds;
      rowUpdates.timerSeconds = updates.timerSeconds;
    }
    if (updates.youtubeVideoId !== undefined) {
      rowUpdates.youtube_video_id = updates.youtubeVideoId;
      rowUpdates.youtubeVideoId = updates.youtubeVideoId;
    }
    if (updates.targetUrl !== undefined) {
      rowUpdates.target_url = updates.targetUrl;
      rowUpdates.targetUrl = updates.targetUrl;
    }
    if (updates.totalSlots !== undefined) {
      rowUpdates.total_slots = updates.totalSlots;
      rowUpdates.totalSlots = updates.totalSlots;
    }
    if (updates.verificationType !== undefined) {
      rowUpdates.verification_type = updates.verificationType;
      rowUpdates.verificationType = updates.verificationType;
    }
    if (updates.status !== undefined) {
      const isAct = updates.status === 'active';
      rowUpdates.is_active = isAct;
      rowUpdates.status = updates.status;
    }

    rowUpdates.updated_at = new Date().toISOString();

    const { error: microErr } = await supabase.from('microtasks').update(rowUpdates).eq('id', id);
    if (!microErr) return { success: true, error: null };

    const { error: taskErr } = await supabase.from('tasks').update(rowUpdates).eq('id', id);
    return { success: !taskErr, error: taskErr || microErr };
  } catch (err: any) {
    console.warn('[Supabase] updateSupabaseMicrotask notice:', err);
    return { success: false, error: err };
  }
}

/**
 * Toggle Active/Inactive status of microtask in Supabase
 */
export async function toggleSupabaseMicrotaskActive(id: string, isActive: boolean): Promise<{ success: boolean; error: any }> {
  const rowUpdates = {
    is_active: isActive,
    status: isActive ? 'active' : 'inactive',
    updated_at: new Date().toISOString(),
  };

  try {
    const { error: microErr } = await supabase.from('microtasks').update(rowUpdates).eq('id', id);
    if (!microErr) return { success: true, error: null };

    const { error: taskErr } = await supabase.from('tasks').update(rowUpdates).eq('id', id);
    return { success: !taskErr, error: taskErr || microErr };
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

