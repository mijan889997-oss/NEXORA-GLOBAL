import React from 'react';
import { ShieldCheck, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LegalPagesProps {
  type: 'terms' | 'privacy' | 'refund' | 'affiliate' | 'earnings';
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Earnings Disclaimer */}
      {type === 'earnings' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                Earnings Disclaimer & Performance Transparency
              </h1>
              <p className="text-xs text-slate-400 mt-1">Official platform disclosure and regulatory terms</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-['Space_Grotesk']">
              Statutory Platform Notice
            </h2>
            <blockquote className="text-base sm:text-lg font-semibold italic text-white leading-relaxed">
              &ldquo;Income is not guaranteed. Earnings depend on skills, effort, demand, completed work, approved transactions and applicable program terms.&rdquo;
            </blockquote>
          </div>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white">1. No Guaranteed or Passive Income</h3>
            <p>
              NEXVORA GLOBAL is a legitimate digital marketing services exchange, freelance work marketplace, educational academy, and affiliate platform. We strictly prohibit any representation of automated, passive, or guaranteed income.
            </p>
            <p>
              Any examples of earnings, compensation rates, or project budgets presented on this platform describe potential contract figures agreed between independent clients and freelancers or approved task compensation amounts. Prior results do not guarantee future earnings.
            </p>

            <h3 className="text-base font-bold text-white">2. Basis of Work and Approval</h3>
            <p>
              Freelance contracts and microtasks are disbursed only upon verified delivery and formal client or administrative compliance approval. Submissions that fail to satisfy clear quality parameters, time limits, or verification protocols will be rejected without financial settlement.
            </p>

            <h3 className="text-base font-bold text-white">3. Payout Gateways & Processing Limits</h3>
            <p>
              Withdrawals are processed through recognized third-party payment rails (such as bKash, Nagad, Bank Transfer, PayPal, Payoneer, or compliant USDT networks). Users are solely responsible for local tax reporting and adhering to minimum payout thresholds. Where payment gateway integrations are pending technical configuration, disbursements are held securely until processing channels are verified.
            </p>
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      {type === 'terms' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                Terms and Conditions of Service
              </h1>
              <p className="text-xs text-slate-400 mt-1">Effective date: March 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white">1. Platform Acceptance</h3>
            <p>
              By accessing or creating an account on NEXVORA GLOBAL, you agree to comply with these terms, our community integrity guidelines, and all applicable digital commerce laws.
            </p>

            <h3 className="text-base font-bold text-white">2. User Accounts & Identity Verification (KYC)</h3>
            <p>
              Members must provide true and accurate information during registration. NEXVORA GLOBAL reserves the right to request Know-Your-Customer (KYC) identity documentation prior to processing withdrawal requests. Accounts attempting identity falsification, duplicate creation, or fraudulent task completion will be permanently banned.
            </p>

            <h3 className="text-base font-bold text-white">3. Escrow and Ledger Integrity</h3>
            <p>
              Project funds are secured in escrow during active contracts. Balances are credited to worker wallets only upon certified deliverable sign-off. Users cannot artificially modify or simulate wallet balances.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Policy */}
      {type === 'privacy' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                Privacy & Data Security Policy
              </h1>
              <p className="text-xs text-slate-400 mt-1">Commitment to personal privacy and data safety</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white">1. Information We Collect</h3>
            <p>
              We collect user registration credentials, profile information, communication histories, order milestones, and verification documents necessary for KYC compliance and payout disbursement.
            </p>

            <h3 className="text-base font-bold text-white">2. Storage and Cryptographic Security</h3>
            <p>
              Passwords are salted and cryptographically hashed with industry-standard bcrypt algorithms. Administrative access is restricted by granular Role-Based Access Control (RBAC).
            </p>
          </div>
        </div>
      )}

      {/* Refund Policy */}
      {type === 'refund' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                Refund & Dispute Resolution Policy
              </h1>
              <p className="text-xs text-slate-400 mt-1">Clear standards for orders, digital goods, and dispute mediation</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white">1. Freelance Services & Milestones</h3>
            <p>
              If a seller fails to submit project deliverables according to specifications or agreed timelines, the buyer may raise a formal dispute. Upon review by Support Admins, escrowed funds will be refunded to the buyer’s wallet ledger.
            </p>

            <h3 className="text-base font-bold text-white">2. Rejected Withdrawals</h3>
            <p>
              When a withdrawal request is rejected or cancelled due to incorrect payment credentials or regulatory flags, 100% of the debited amount is immediately credited back to the member&apos;s available wallet balance via an immutable &ldquo;Refund&rdquo; ledger transaction.
            </p>
          </div>
        </div>
      )}

      {/* Affiliate Disclosure */}
      {type === 'affiliate' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                Affiliate Program Disclosure
              </h1>
              <p className="text-xs text-slate-400 mt-1">Ethical promotion standards and transparency</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white">1. Affiliate Commission Structure</h3>
            <p>
              NEXVORA GLOBAL allows vetted partners to promote marketplace software tools, enterprise services, and educational programs. Affiliates earn legitimate commissions only upon genuine, verified customer purchases.
            </p>

            <h3 className="text-base font-bold text-white">2. Prohibition of Deceptive Advertising</h3>
            <p>
              Affiliates must never make false income guarantees, misleading speed-of-earnings claims, or engage in spam campaigns. Self-purchasing to claim commissions is strictly prohibited and leads to immediate account termination.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
