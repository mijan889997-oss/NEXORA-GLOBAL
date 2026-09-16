/**
 * Persistent helper utilities to manage 5-Hour Cooldown Task Locking.
 * 
 * 1. 5-Hour Expiration Lock: When a user completes/submits a task, save timestamp (completedAt).
 *    Keep the task locked for exactly 5 hours from submission time.
 * 2. Auto-Unlock After 5 Hours: If elapsed time > 5 hours, automatically removes the lock
 *    and makes the task available again for submission.
 * 3. Live Countdown: Available again in: Xh Ym (আবার কাজ করতে পারবেন: X ঘণ্টা Y মিনিটে).
 * 4. Persistence: Cooldown timestamps saved in localStorage across refreshes.
 */

export const TASK_COOLDOWN_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds (18,000,000 ms)

const STORAGE_KEY_PREFIX = 'nexvora_task_cooldowns_';
const GLOBAL_STORAGE_KEY = 'nexvora_task_cooldowns';

export interface TaskCooldownStatus {
  isLocked: boolean;
  remainingMs: number;
  completedAt: number | null;
  cooldownUntil: number | null;
  hours: number;
  minutes: number;
  seconds: number;
  formattedEn: string;
  formattedBn: string;
}

/**
 * Record a task completion or proof submission with a 5-hour cooldown.
 */
export function recordTaskCompletion(
  taskId: string,
  userId?: string | null,
  customCompletedAt?: number | string,
  customCooldownUntil?: number | string
): void {
  if (typeof window === 'undefined' || !taskId) return;
  const cleanId = taskId.trim();
  const completedAt = customCompletedAt ? new Date(customCompletedAt).getTime() : Date.now();
  const cooldownUntil = customCooldownUntil ? new Date(customCooldownUntil).getTime() : (completedAt + TASK_COOLDOWN_MS);

  // 1. Save to user-specific key
  if (userId) {
    try {
      const userKey = `${STORAGE_KEY_PREFIX}${userId}`;
      const raw = localStorage.getItem(userKey);
      const map: Record<string, number> = raw ? JSON.parse(raw) : {};
      map[cleanId] = completedAt;
      localStorage.setItem(userKey, JSON.stringify(map));
    } catch (e) {
      console.warn('Failed to save user task cooldown:', e);
    }
  }

  // 2. Save to global key
  try {
    const raw = localStorage.getItem(GLOBAL_STORAGE_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[cleanId] = completedAt;
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save global task cooldown:', e);
  }

  // Dispatch custom event for reactive across-tab or component updates
  window.dispatchEvent(
    new CustomEvent('nexvora_task_locked', {
      detail: { taskId: cleanId, userId, completedAt, cooldownUntil },
    })
  );
}

/**
 * Backwards-compatible alias for recordTaskCompletion
 */
export function markTaskAsCompleted(
  taskId: string,
  userId?: string | null,
  customCompletedAt?: number | string,
  customCooldownUntil?: number | string
): void {
  recordTaskCompletion(taskId, userId, customCompletedAt, customCooldownUntil);
}

/**
 * Remove task cooldown (e.g. after expiry or reset)
 */
export function removeTaskCooldown(taskId: string, userId?: string | null): void {
  if (typeof window === 'undefined' || !taskId) return;
  const cleanId = taskId.trim();

  try {
    if (userId) {
      const userKey = `${STORAGE_KEY_PREFIX}${userId}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const map = JSON.parse(raw);
        if (map[cleanId]) {
          delete map[cleanId];
          localStorage.setItem(userKey, JSON.stringify(map));
        }
      }
    }

    const globalRaw = localStorage.getItem(GLOBAL_STORAGE_KEY);
    if (globalRaw) {
      const map = JSON.parse(globalRaw);
      if (map[cleanId]) {
        delete map[cleanId];
        localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(map));
      }
    }

    window.dispatchEvent(
      new CustomEvent('nexvora_task_unlocked', {
        detail: { taskId: cleanId, userId },
      })
    );
  } catch (e) {
    console.warn('Failed to remove task cooldown:', e);
  }
}

/**
 * Query the live cooldown status for a specific task.
 * Automatically unlocks if elapsed time > 5 hours.
 */
export function getTaskCooldownStatus(
  taskId: string,
  userId?: string | null,
  serverCompletedAt?: string | number | null,
  serverCooldownUntil?: string | number | null
): TaskCooldownStatus {
  const now = Date.now();
  let latestCompletedAt: number | null = null;

  // 1. Check server-provided completedAt / cooldownUntil
  if (serverCompletedAt) {
    const t = new Date(serverCompletedAt).getTime();
    if (!isNaN(t) && t > 0) latestCompletedAt = t;
  }
  if (serverCooldownUntil) {
    const t = new Date(serverCooldownUntil).getTime();
    if (!isNaN(t) && t > 0) {
      const impliedCompleted = t - TASK_COOLDOWN_MS;
      if (!latestCompletedAt || impliedCompleted > latestCompletedAt) {
        latestCompletedAt = impliedCompleted;
      }
    }
  }

  // 2. Check localStorage
  if (typeof window !== 'undefined' && taskId) {
    const cleanId = taskId.trim();

    if (userId) {
      try {
        const userRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
        if (userRaw) {
          const map = JSON.parse(userRaw);
          if (map && typeof map[cleanId] === 'number') {
            if (!latestCompletedAt || map[cleanId] > latestCompletedAt) {
              latestCompletedAt = map[cleanId];
            }
          }
        }
      } catch {}
    }

    try {
      const globalRaw = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (globalRaw) {
        const map = JSON.parse(globalRaw);
        if (map && typeof map[cleanId] === 'number') {
          if (!latestCompletedAt || map[cleanId] > latestCompletedAt) {
            latestCompletedAt = map[cleanId];
          }
        }
      }
    } catch {}
  }

  if (!latestCompletedAt) {
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

  const cooldownUntil = latestCompletedAt + TASK_COOLDOWN_MS;
  const remainingMs = cooldownUntil - now;

  // AUTO-UNLOCK AFTER 5 HOURS
  if (remainingMs <= 0) {
    removeTaskCooldown(taskId, userId);
    return {
      isLocked: false,
      remainingMs: 0,
      completedAt: latestCompletedAt,
      cooldownUntil,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedEn: '',
      formattedBn: '',
    };
  }

  // Calculate remaining time components
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format strings
  let formattedEn = `Available again in: ${hours}h ${minutes}m`;
  let formattedBn = `আবার কাজ করতে পারবেন: ${hours} ঘণ্টা ${minutes} মিনিটে`;

  if (hours === 0) {
    formattedEn = `Available again in: ${minutes}m ${seconds}s`;
    formattedBn = `আবার কাজ করতে পারবেন: ${minutes} মি: ${seconds} সে:`;
  }

  return {
    isLocked: true,
    remainingMs,
    completedAt: latestCompletedAt,
    cooldownUntil,
    hours,
    minutes,
    seconds,
    formattedEn,
    formattedBn,
  };
}

/**
 * Returns whether the task is currently in cooldown or locked.
 */
export function isTaskCompletedOrLocked(
  task: {
    id: string;
    userCompleted?: boolean;
    userSubmissionStatus?: string;
    completedAt?: string;
    cooldownUntil?: string;
    cooldownRemainingMs?: number;
  } | null | undefined,
  userId?: string | null
): boolean {
  if (!task || !task.id) return false;

  const status = getTaskCooldownStatus(
    task.id,
    userId,
    task.completedAt,
    task.cooldownUntil
  );

  if (status.isLocked) return true;

  // If server explicitly marked userCompleted with remaining time
  if (task.cooldownRemainingMs && task.cooldownRemainingMs > 0) {
    return true;
  }

  return false;
}
