import React from 'react';
import { 
  LayoutDashboard,
  ShoppingBag,
  CheckSquare,
  GraduationCap,
  Package,
  Share2,
  Users,
  Wallet,
  ArrowLeftRight,
  ArrowDownToLine,
  MessageSquare,
  Bell,
  HelpCircle,
  Settings,
  Briefcase,
  ShieldCheck,
  Coins,
  ExternalLink
} from 'lucide-react';

export interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath = '/dashboard/earn', onNavigate }) => {
  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 space-y-4 text-white min-h-screen overflow-y-auto">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-800/80 pb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 text-base">
          N
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white">NEXVORA GLOBAL</h1>
          <p className="text-[10px] text-slate-400 font-medium">LEARN • WORK • GROW • EARN</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {/* Dashboard Home */}
        <button
          onClick={() => handleNav('/dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          <span>Dashboard</span>
        </button>

        {/* My Orders */}
        <button
          onClick={() => handleNav('/dashboard/orders')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/orders'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-slate-400" />
          <span>My Orders</span>
        </button>

        {/* My Tasks */}
        <button
          onClick={() => handleNav('/dashboard/my-tasks')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/my-tasks'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-slate-400" />
          <span>My Tasks</span>
        </button>

        {/* My Courses */}
        <button
          onClick={() => handleNav('/dashboard/courses')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/courses'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-violet-400" />
          <span>My Courses</span>
        </button>

        {/* Digital Products */}
        <button
          onClick={() => handleNav('/dashboard/products')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/products'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4 text-pink-400" />
          <span>Digital Products</span>
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
            NEW
          </span>
        </button>

        {/* Affiliate Center */}
        <button
          onClick={() => handleNav('/dashboard/affiliate')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/affiliate'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span>Affiliate Center</span>
        </button>

        {/* Invite & Earn */}
        <button
          onClick={() => handleNav('/dashboard/invite')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/invite'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Invite & Earn</span>
        </button>

        {/* ================= SPECIAL EARNING SERVICES ================= */}
        <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Earn & Marketplace
        </div>

        {/* 1. Internal Earn / Micro-Tasks (Adsterra & Monetag) */}
        <button
          onClick={() => handleNav('/dashboard/earn')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/earn'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Earn / Micro-Tasks</span>
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            HOT
          </span>
        </button>

        {/* 2. Freelance Marketplace (Kwork Referral) */}
        <a
          href="https://kwork.com/ref/25226052"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all text-xs font-semibold group"
        >
          <Briefcase className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Freelance Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50 group-hover:opacity-100" />
        </a>

        {/* 3. Verified Paid Tasks (Freecash Direct Partner) */}
        <a
          href="https://freecash.com/r/7GHGR"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all text-xs font-semibold group"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Verified Paid Tasks</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50 group-hover:opacity-100" />
        </a>

        {/* ================= WALLET & FINANCES ================= */}
        <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Finance & Settings
        </div>

        {/* Wallet & Ledger */}
        <button
          onClick={() => handleNav('/dashboard/wallet')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/wallet'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wallet className="w-4 h-4 text-slate-400" />
          <span>Wallet & Ledger</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => handleNav('/dashboard/transactions')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/transactions'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          <span>Transactions</span>
        </button>

        {/* Withdrawals */}
        <button
          onClick={() => handleNav('/dashboard/withdrawals')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/withdrawals'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4 text-slate-400" />
          <span>Withdrawals</span>
        </button>

        {/* Messages */}
        <button
          onClick={() => handleNav('/dashboard/messages')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/messages'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span>Messages</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => handleNav('/dashboard/notifications')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/notifications'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bell className="w-4 h-4 text-slate-400" />
          <span>Notifications</span>
        </button>

        {/* Support & Tickets */}
        <button
          onClick={() => handleNav('/dashboard/support')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/support'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Support & Tickets</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => handleNav('/dashboard/settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            currentPath === '/dashboard/settings'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
