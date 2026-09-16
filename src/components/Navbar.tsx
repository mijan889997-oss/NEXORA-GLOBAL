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
  BookOpen,
  Briefcase,
  Layers,
  CheckSquare,
  Package,
  FileQuestion,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { KWORK_AFFILIATE_URL, FREECASH_AFFILIATE_URL } from '../config/affiliateLinks';

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
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              id="nav-brand-btn"
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/20 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-lg text-white font-['Space_Grotesk']">
                    NEXVORA
                  </span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    GLOBAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Learn • Work • Grow • Earn
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-300">
            <button
              id="nav-services"
              onClick={() => handleNav('/services')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPath === '/services' ? 'text-cyan-400 bg-slate-900' : 'hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              Services
            </button>
            <a
              id="nav-jobs"
              href={KWORK_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900/60"
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Freelance</span>
              <ExternalLink className="w-3 h-3 opacity-60 text-slate-400" />
            </a>
            <a
              id="nav-tasks"
              href={FREECASH_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900/60"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Verified Tasks</span>
              <ExternalLink className="w-3 h-3 opacity-60 text-slate-400" />
            </a>
            <button
              id="nav-earn"
              onClick={() => handleNav('/earn')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPath === '/earn' || currentPath === '/dashboard/earn'
                  ? 'text-amber-400 bg-slate-900'
                  : 'hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Earn</span>
              <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HOT
              </span>
            </button>
            <button
              id="nav-courses"
              onClick={() => handleNav('/courses')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPath === '/courses' ? 'text-cyan-400 bg-slate-900' : 'hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              Academy
            </button>
            <button
              id="nav-products"
              onClick={() => handleNav('/products')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPath === '/products' ? 'text-cyan-400 bg-slate-900' : 'hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Package className="w-4 h-4 text-purple-400" />
              Products
            </button>
            <button
              id="nav-compliance"
              onClick={() => handleNav('/earnings-disclaimer')}
              className={`px-3 py-2 rounded-lg transition-colors text-xs ${
                currentPath === '/earnings-disclaimer' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compliance
            </button>
          </nav>

          {/* User Controls & Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Wallet Balance Pill */}
                <button
                  id="nav-wallet-pill"
                  onClick={() => handleNav('/dashboard/wallet')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold hover:bg-emerald-900/40 transition-colors"
                  title="Your Available Wallet Balance & Points"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>${formattedUsd}</span>
                  <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-700/40">
                    {formattedPoints} pts
                  </span>
                </button>

                {/* Dashboard button */}
                <button
                  id="nav-goto-dashboard"
                  onClick={() => handleNav('/dashboard')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">User</span> Dashboard
                </button>

                {isAdmin && (
                  <button
                    id="nav-goto-admin"
                    onClick={() => handleNav('/admin')}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Super</span> Admin
                  </button>
                )}

                {/* User menu dropdown */}
                <div className="relative">
                  <button
                    id="nav-user-menu-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-900 text-slate-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="font-semibold text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => handleNav('/dashboard/profile')}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        Profile & KYC
                      </button>
                      <button
                        onClick={() => handleNav('/dashboard/wallet')}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        Wallet & Withdrawals
                      </button>
                      <button
                        onClick={() => handleNav('/dashboard/affiliate')}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        Affiliate Center
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-4 py-2 text-purple-400 hover:bg-slate-800"
                        >
                          Super Admin Console
                        </button>
                      )}
                      <div className="border-t border-slate-800 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          handleNav('/');
                        }}
                        className="w-full text-left px-4 py-2 text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
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
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => handleNav('/register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => handleNav('/services')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-slate-900"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Digital Marketing Services
          </button>
          <a
            href={KWORK_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-slate-900"
          >
            <span className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Freelance Marketplace
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 text-slate-400" />
          </a>
          <a
            href={FREECASH_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-slate-900"
          >
            <span className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Verified Paid Tasks
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 text-slate-400" />
          </a>
          <button
            onClick={() => handleNav('/earn')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
          >
            <span className="flex items-center gap-3">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Earn / Micro-Tasks</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-300">
              TIMEWALL
            </span>
          </button>
          <button
            onClick={() => handleNav('/courses')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-slate-900"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Academy Courses
          </button>
          <button
            onClick={() => handleNav('/products')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-slate-900"
          >
            <Package className="w-4 h-4 text-purple-400" />
            Digital Products
          </button>
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
