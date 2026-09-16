import React from 'react';
import { Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { openUdemyAffiliate } from '../config/affiliateLinks';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight text-lg text-white font-['Space_Grotesk']">
                NEXVORA GLOBAL
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An international digital marketing, online work, and skill mastery ecosystem. Built on real economic transactions, verified milestone deliverables, and strict ledger auditing.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Real Database Ledger
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Zero Fake Stats
              </span>
            </div>
          </div>

          {/* Academy & Earn Col */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 font-['Space_Grotesk']">
              Learn & Earn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openUdemyAffiliate()} className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 cursor-pointer">
                  <span>Nexvora Academy (Udemy)</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard/affiliate')} className="hover:text-cyan-400 transition-colors">
                  Affiliate Program Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard/referral')} className="hover:text-cyan-400 transition-colors">
                  Referral Network
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard/wallet')} className="hover:text-cyan-400 transition-colors">
                  Ledger Wallet
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal Col */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 font-['Space_Grotesk']">
              Compliance & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/refund-policy')} className="hover:text-cyan-400 transition-colors">
                  Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/affiliate-disclosure')} className="hover:text-cyan-400 transition-colors">
                  Affiliate Disclosure
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/earnings-disclaimer')} className="hover:text-cyan-400 transition-colors text-cyan-300 font-medium">
                  Earnings Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory Card */}
        <div className="mt-12 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">
                Statutory Regulatory & Performance Disclosure
              </p>
              <p className="text-slate-300">
                &ldquo;Income is not guaranteed. Earnings depend on skills, effort, demand, completed work, approved transactions and applicable program terms.&rdquo;
              </p>
              <p className="text-slate-400 mt-2 text-[11px]">
                NEXVORA GLOBAL operates strictly as a legitimate marketplace and education platform. We do not provide financial investment instruments, high-yield schemes, or automated passive returns. Payout methods (bKash, Nagad, Bank Transfer, PayPal, Payoneer, USDT) require completed service delivery, verified customer orders, or certified task approvals.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NEXVORA GLOBAL. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Secure Protocol v1.0.0</span>
            <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-slate-200">
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
