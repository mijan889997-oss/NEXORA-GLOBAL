import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getStoredUserPoints,
  pointsToUsd,
  formatPoints,
  formatUsd,
} from '../lib/balanceUtils';

export interface UserBalanceData {
  points: number;
  availableUsd: number;
  totalEarnedUsd: number;
  pendingUsd: number;
  totalWithdrawnUsd: number;
  formattedUsd: string;
  formattedPoints: string;
  refreshBalance: () => void;
}

/**
 * Robust hook for real-time synchronized user points and balances across all views.
 */
export const useUserBalance = (): UserBalanceData => {
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch {
    // If used outside of AuthProvider or during initialization
    authContext = null;
  }

  const user = authContext?.user ?? null;
  const wallet = authContext?.wallet ?? null;

  const [points, setPoints] = useState<number>(() => {
    return getStoredUserPoints(user, wallet);
  });

  const syncPoints = useCallback(() => {
    try {
      // Single authoritative source of truth across localStorage, database wallet, and active demo balance
      const stored = getStoredUserPoints(user, wallet);
      setPoints(stored);

      // Keep all localStorage balance aliases synchronized
      if (stored > 0 && typeof window !== 'undefined') {
        const storedUsd = (stored / 1000).toFixed(2);
        if (localStorage.getItem('nexvora_user_points') !== stored.toString()) {
          localStorage.setItem('nexvora_user_points', stored.toString());
          localStorage.setItem('points', stored.toString());
          localStorage.setItem('user_points', stored.toString());
          localStorage.setItem('nexvora_wallet_balance', storedUsd);
          localStorage.setItem('nexvora_user_balance', storedUsd);
        }
      }
    } catch {
      // safe fallback
    }
  }, [user, wallet]);

  // Remove any reactive window event dispatch here to prevent infinite loop cycles with components listening to balanceUpdated
  useEffect(() => {
    syncPoints();

    // Query Supabase directly if connected
    if (supabase && user?.id) {
      Promise.resolve(
        supabase
          .from('profiles')
          .select('points, balance')
          .eq('id', user.id)
      )
        .then(({ data, error }: any) => {
          if (!error && data) {
            const row = Array.isArray(data) ? data[0] : data;
            if (row?.points !== undefined && row?.points !== null) {
              const supaPts = Number(row.points);
              setPoints((prev) => (prev !== supaPts && supaPts > (prev || 0) ? supaPts : prev));
            } else if (row?.balance !== undefined && row?.balance !== null) {
              const supaPts = Math.round(Number(row.balance) * 1000);
              setPoints((prev) => (prev !== supaPts && supaPts > (prev || 0) ? supaPts : prev));
            }
          }
        })
        .catch(() => {});
    }
  }, [user?.id, wallet?.availableBalance, syncPoints]);

  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      try {
        const detail = e?.detail;
        if (detail?.points !== undefined) {
          setPoints(Number(detail.points));
        } else if (detail?.newBalance !== undefined) {
          setPoints(Math.round(Number(detail.newBalance) * 1000));
        } else if (detail?.added !== undefined) {
          setPoints((prev) => (prev || 0) + Number(detail.added));
        } else {
          syncPoints();
        }
      } catch {
        syncPoints();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'nexvora_user_points' ||
        e.key === 'points' ||
        e.key === 'user_points' ||
        e.key === 'nexvora_wallet_balance'
      ) {
        syncPoints();
      }
    };

    window.addEventListener('pointsUpdated', handleSyncEvent);
    window.addEventListener('balanceUpdated', handleSyncEvent);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('pointsUpdated', handleSyncEvent);
      window.removeEventListener('balanceUpdated', handleSyncEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncPoints]);

  const safePoints = isNaN(points) || points < 0 ? 0 : points;
  const availableUsd = Number((safePoints / 1000).toFixed(2));
  const totalEarnedUsd = Number(
    Math.max(
      wallet?.totalEarned ?? 0,
      availableUsd + (wallet?.totalWithdrawn ?? 0)
    ).toFixed(2)
  );
  const pendingUsd = wallet?.pendingBalance ?? 0;
  const totalWithdrawnUsd = wallet?.totalWithdrawn ?? 0;

  return {
    points: safePoints,
    availableUsd,
    totalEarnedUsd,
    pendingUsd,
    totalWithdrawnUsd,
    formattedUsd: formatUsd(availableUsd),
    formattedPoints: formatPoints(safePoints),
    refreshBalance: syncPoints,
  };
};

export { getStoredUserPoints, pointsToUsd, formatPoints, formatUsd };
