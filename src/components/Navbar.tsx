import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUserBalance } from '../lib/userBalance';
import {
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  Wallet,
  Shield,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  Users,
  Trophy,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, wallet, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { formattedUsd, formattedPoints } = useUserBalance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-cyan-500/20 transition-colors shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              id="nav-brand-btn"
              onClick={() => handleNav('/dashboard/matrix')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform border border-cyan-400/30">
                <Zap className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-lg text-white font-['Space_Grotesk']">
                    NEXVORA
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    WEB3 MATRIX
                  </span>
                </div>
                <p className="text-[9px] text-emerald-400/80 font-mono tracking-wider uppercase">
                  100% P2P • BNB CHAIN
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links - Pure Web3 Matrix Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-semibold text-slate-300">
            <button
              id="nav-matrix-levels"
              onClick={() => handleNav('/dashboard/matrix')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPath === '/matrix' || currentPath === '/levels' || currentPath === '/dashboard/matrix' || currentPath === '/dashboard/levels'
                  ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-sm shadow-cyan-900/30'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>12-Level Matrix</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                $2
              </span>
            </button>

            <button
              id="nav-team-tree"
              onClick={() => handleNav('/dashboard/team')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPath === '/team' || currentPath === '/dashboard/team'
                  ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Team Tree</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1x3
              </span>
            </button>

            <button
              id="nav-leaderboard"
              onClick={() => handleNav('/dashboard/leaderboard')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPath === '/leaderboard' || currentPath === '/dashboard/leaderboard'
                  ? 'text-amber-300 bg-amber-950/60 border border-amber-500/40'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Earners</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LIVE
              </span>
            </button>

            <button
              id="nav-partner-card"
              onClick={() => handleNav('/dashboard/partner-card')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPath === '/partner-card' || currentPath === '/dashboard/partner-card'
                  ? 'text-purple-300 bg-purple-950/60 border border-purple-500/40'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Partner Card & QR</span>
            </button>

            <button
              id="nav-wallet-ledger"
              onClick={() => handleNav('/dashboard/wallet')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentPath === '/wallet' || currentPath === '/dashboard/wallet'
                  ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/40'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>P2P Ledger</span>
            </button>

            <a
              id="nav-bscscan-link"
              href="https://bscscan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-2 rounded-xl transition-all flex items-center gap-1 text-slate-400 hover:text-cyan-300 text-[11px]"
              title="Verify transactions on BscScan"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">BNB Chain</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </nav>

          {/* User Controls & Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Wallet Balance Pill */}
                <button
                  id="nav-wallet-pill"
                  onClick={() => handleNav('/dashboard/wallet')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-900/40 transition-colors"
                  title="Your Available Wallet Balance"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono font-bold">${formattedUsd}</span>
                </button>

                {/* Dashboard button */}
                <button
                  id="nav-goto-dashboard"
                  onClick={() => handleNav('/dashboard/matrix')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-950/50 transition-all border border-cyan-400/30"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Matrix</span> Dashboard
                </button>

                {isAdmin && (
                  <button
                    id="nav-goto-admin"
                    onClick={() => handleNav('/admin')}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-sm transition-colors border border-purple-400/30"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Admin</span>
                  </button>
                )}

                {/* User menu dropdown */}
                <div className="relative">
                  <button
                    id="nav-user-menu-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-900 text-slate-300 transition-colors border border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-xs font-bold text-cyan-300 font-mono">
                      {user.fullName?.charAt(0)?.toUpperCase() || 'W'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-800/80">
                        <p className="font-bold text-white truncate">{user.fullName}</p>
                        <p className="text-[11px] text-cyan-400 font-mono truncate">@{user.username}</p>
                        <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-800">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => handleNav('/dashboard/matrix')}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300 flex items-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        12-Level Matrix ($2)
                      </button>
                      <button
                        onClick={() => handleNav('/dashboard/team')}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300 flex items-center gap-2"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        Team Tree (1x3 Slots)
                      </button>
                      <button
                        onClick={() => handleNav('/dashboard/partner-card')}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300 flex items-center gap-2"
                      >
                        <Share2 className="w-3.5 h-3.5 text-purple-400" />
                        Partner Flyer Card & QR
                      </button>
                      <button
                        onClick={() => handleNav('/dashboard/wallet')}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300 flex items-center gap-2"
                      >
                        <Wallet className="w-3.5 h-3.5 text-teal-400" />
                        Matrix Ledger & Wallet
                      </button>
                      <button
                        onClick={() => handleNav('/dashboard/profile')}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300"
                      >
                        Web3 ID & Profile
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-4 py-2.5 text-purple-400 hover:bg-purple-950/40 flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Super Admin Console
                        </button>
                      )}
                      <div className="border-t border-slate-800/80 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          handleNav('/');
                        }}
                        className="w-full text-left px-4 py-2.5 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Disconnect / Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-signin-btn"
                  onClick={() => handleNav('/login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 rounded-xl transition-colors border border-slate-800"
                >
                  Sign In
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => handleNav('/register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-xl shadow-sm transition-all flex items-center gap-1 border border-cyan-400/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Join Matrix
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyan-500/20 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNav('/dashboard/matrix')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/30"
          >
            <span className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs">⚡ 12-Level Matrix Platform</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/30 text-cyan-300 font-mono">
              $2.00
            </span>
          </button>

          <button
            onClick={() => handleNav('/dashboard/team')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-slate-300 hover:bg-slate-900 border border-slate-800/80"
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-xs">🌳 Team Tree Visualizer</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
              1x3
            </span>
          </button>

          <button
            onClick={() => handleNav('/dashboard/leaderboard')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-amber-300 bg-amber-950/20 border border-amber-500/30 hover:bg-amber-900/30"
          >
            <span className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-xs">🏆 Top Earners Leaderboard</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-300">
              LIVE
            </span>
          </button>

          <button
            onClick={() => handleNav('/dashboard/partner-card')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-slate-300 hover:bg-slate-900 border border-slate-800/80"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-xs">🪪 Partner Card & Flyer QR</span>
          </button>

          <button
            onClick={() => handleNav('/dashboard/wallet')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-slate-300 hover:bg-slate-900 border border-slate-800/80"
          >
            <span className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-xs">💳 Matrix Ledger & Wallet</span>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              ${formattedUsd}
            </span>
          </button>

          <a
            href="https://bscscan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-slate-400 hover:text-cyan-300 text-xs font-mono"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              BNB Chain Mainnet / BscScan
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>

          <div className="border-t border-slate-800 pt-2 space-y-1">
            <button
              onClick={() => handleNav('/earnings-disclaimer')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Earnings Disclaimer
            </button>
            <button
              onClick={() => handleNav('/terms')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => handleNav('/privacy')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
