import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const LegalNoticeBanner: React.FC = () => {
  return (
    <aside aria-label="Legal Compliance Notice" className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-medium">Compliance Disclosure:</strong> Income is not guaranteed. Earnings depend on skills, effort, demand, completed work, approved transactions and applicable program terms.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-slate-400">
          <span className="inline-flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Zero Synthetic Statistics
          </span>
        </div>
      </div>
    </aside>
  );
};
