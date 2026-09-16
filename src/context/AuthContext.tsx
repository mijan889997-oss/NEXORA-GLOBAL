import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Profile, Wallet, UserRole } from '../types';
import { getStoredUserPoints } from '../lib/balanceUtils';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    referralCode?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<{ user: User | null; profile: Profile | null; wallet: Wallet | null } | null>;
  updateWallet: (updatedWallet: Partial<Wallet> | Wallet) => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(() => {
    if (typeof window === 'undefined') return null;
    const initPts = getStoredUserPoints();
    const initBal = Number((initPts / 1000).toFixed(2));
    return {
      id: 'wal_init',
      userId: 'usr_current',
      availableBalance: initBal,
      pendingBalance: 0,
      totalEarned: initBal,
      totalWithdrawn: 0,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    };
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexvora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateWallet = (updatedWallet: Partial<Wallet> | Wallet) => {
    setWallet((prev) => {
      const merged = prev ? { ...prev, ...updatedWallet } : (updatedWallet as Wallet);
      if (typeof merged.availableBalance === 'number' && typeof window !== 'undefined') {
        const pts = Math.round(merged.availableBalance * 1000);
        localStorage.setItem('nexvora_wallet_balance', merged.availableBalance.toFixed(2));
        localStorage.setItem('nexvora_user_balance', merged.availableBalance.toFixed(2));
        localStorage.setItem('nexvora_user_points', pts.toString());
        localStorage.setItem('points', pts.toString());
        localStorage.setItem('user_points', pts.toString());
      }
      return merged;
    });
  };

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    const currentToken = token || localStorage.getItem('nexvora_token');
    if (currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e) {
        data = { error: 'Invalid JSON response from server' };
      }
    } else {
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Plain text or HTML fallback (e.g. 404 or 500 HTML page)
        if (!res.ok) {
          throw new Error(`Request failed (${res.status}: ${res.statusText || 'Endpoint Error'})`);
        }
        data = { message: text };
      }
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `HTTP error ${res.status}`);
    }
    return data;
  };

  const refreshMe = async (): Promise<{ user: User | null; profile: Profile | null; wallet: Wallet | null } | null> => {
    try {
      const currentToken = localStorage.getItem('nexvora_token');
      if (!currentToken) {
        setUser(null);
        setProfile(null);
        setWallet(null);
        setIsLoading(false);
        return null;
      }

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        
        if (data.wallet) {
          const localPts = getStoredUserPoints(data.user, data.wallet);
          const localUsd = Number((localPts / 1000).toFixed(2));
          const avail = Math.max(typeof data.wallet.availableBalance === 'number' ? data.wallet.availableBalance : 0, localUsd);
          const totalEarn = Math.max(typeof data.wallet.totalEarned === 'number' ? data.wallet.totalEarned : avail, avail + (data.wallet.totalWithdrawn || 0));
          const syncedWallet = {
            ...data.wallet,
            availableBalance: Number(avail.toFixed(2)),
            totalEarned: Number(totalEarn.toFixed(2)),
          };
          setWallet(syncedWallet);

          if (localUsd > (data.wallet.availableBalance || 0)) {
            fetch('/api/wallet/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentToken}`,
              },
              body: JSON.stringify({ availableBalance: avail, totalEarned: totalEarn, points: localPts }),
            }).catch(() => {});
          }
        } else {
          setWallet(null);
        }
        return data;
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('nexvora_token');
        setToken(null);
        setUser(null);
        setProfile(null);
        setWallet(null);
        return null;
      }
      return null;
    } catch (err) {
      console.warn('Silent refresh error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();

    const handleBalanceUpdate = (e: any) => {
      const detail = e?.detail;
      if (detail?.newBalance !== undefined) {
        const bal = Number(Number(detail.newBalance).toFixed(2));
        setWallet((prev) =>
          prev
            ? { ...prev, availableBalance: bal, totalEarned: Math.max(prev.totalEarned || 0, bal), updatedAt: new Date().toISOString() }
            : {
                id: `wal_${Date.now()}`,
                userId: user?.id || 'usr_superadmin_001',
                availableBalance: bal,
                pendingBalance: 0,
                totalEarned: bal,
                totalWithdrawn: 0,
                currency: 'USD',
                updatedAt: new Date().toISOString(),
              }
        );
      } else if (detail?.points !== undefined) {
        const pts = Number(detail.points);
        const bal = Number((pts / 1000).toFixed(2));
        setWallet((prev) =>
          prev
            ? { ...prev, availableBalance: bal, totalEarned: Math.max(prev.totalEarned || 0, bal), updatedAt: new Date().toISOString() }
            : {
                id: `wal_${Date.now()}`,
                userId: user?.id || 'usr_superadmin_001',
                availableBalance: bal,
                pendingBalance: 0,
                totalEarned: bal,
                totalWithdrawn: 0,
                currency: 'USD',
                updatedAt: new Date().toISOString(),
              }
        );
      } else if (detail?.wallet) {
        setWallet(detail.wallet);
      } else if (detail?.added !== undefined) {
        const addedUsd = Number(detail.added) / 1000;
        setWallet((prev) => {
          const currentBal = prev?.availableBalance || 0;
          const currentEarned = prev?.totalEarned || 0;
          const newBal = Number((currentBal + addedUsd).toFixed(4));
          const newEarned = Number((currentEarned + addedUsd).toFixed(4));
          return prev
            ? { ...prev, availableBalance: newBal, totalEarned: newEarned, updatedAt: new Date().toISOString() }
            : {
                id: `wal_${Date.now()}`,
                userId: user?.id || 'usr_superadmin_001',
                availableBalance: newBal,
                pendingBalance: 0,
                totalEarned: newEarned,
                totalWithdrawn: 0,
                currency: 'USD',
                updatedAt: new Date().toISOString(),
              };
        });
      } else {
        const localPts = getStoredUserPoints(user, null);
        if (localPts > 0) {
          const bal = localPts / 1000;
          setWallet((prev) =>
            prev
              ? { ...prev, availableBalance: Math.max(prev.availableBalance || 0, bal), totalEarned: Math.max(prev.totalEarned || 0, bal) }
              : {
                  id: `wal_${Date.now()}`,
                  userId: user?.id || 'usr_superadmin_001',
                  availableBalance: bal,
                  pendingBalance: 0,
                  totalEarned: bal,
                  totalWithdrawn: 0,
                  currency: 'USD',
                  updatedAt: new Date().toISOString(),
                }
          );
        }
      }
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    window.addEventListener('pointsUpdated', handleBalanceUpdate);
    window.addEventListener('storage', handleBalanceUpdate);
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      window.removeEventListener('pointsUpdated', handleBalanceUpdate);
      window.removeEventListener('storage', handleBalanceUpdate);
    };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('nexvora_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    setWallet(data.wallet);
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    referralCode?: string;
    phone?: string;
  }) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    localStorage.setItem('nexvora_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    setWallet(data.wallet);
  };

  const logout = () => {
    localStorage.removeItem('nexvora_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setWallet(null);
  };

  const adminRoles: UserRole[] = [
    'SUPER ADMIN',
    'ADMIN',
    'FINANCE ADMIN',
    'MODERATOR',
    'SUPPORT ADMIN',
    'CONTENT ADMIN',
  ];
  const isAdmin = Boolean(user && adminRoles.includes(user.role));
  const isSuperAdmin = Boolean(user && user.role === 'SUPER ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        wallet,
        token,
        isLoading,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        logout,
        refreshMe,
        updateWallet,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
