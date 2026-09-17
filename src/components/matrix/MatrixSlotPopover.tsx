import React from 'react';
import { CheckCircle2, RefreshCw, Zap, ExternalLink, Clock, ShieldCheck, Wallet } from 'lucide-react';
import { MatrixPartnerSlot } from '../../types';
import { buildBscScanUrl, formatShortWalletAddress } from '../../utils/web3Wallet';

interface MatrixSlotPopoverProps {
  slot: MatrixPartnerSlot;
  level: number;
  levelCost: number;
  onClose?: () => void;
}

export const MatrixSlotPopover: React.FC<MatrixSlotPopoverProps> = ({
  slot,
  level,
  levelCost,
  onClose,
}) => {
  const txHash = slot.txHash;
  const bscScanUrl = slot.bscScanUrl || (txHash ? buildBscScanUrl(txHash, 'tx') : null);

  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-72 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 shadow-[0_10px_35px_rgba(6,182,212,0.25)] text-left animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Caret pointing down */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/40 rotate-45" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white font-['Space_Grotesk']">
            Slot {slot.slotNumber} / 3 Occupied
          </span>
        </div>
        <span
          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            slot.isRecycle
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {slot.isRecycle ? 'Auto-Recycle' : '100% P2P Payout'}
        </span>
      </div>

      {/* Partner Info */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-cyan-500/30 shrink-0">
          {(slot.partnerName || 'P')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate font-['Space_Grotesk']">
            {slot.partnerName}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono truncate">
            {slot.partnerWalletAddress ? formatShortWalletAddress(slot.partnerWalletAddress) : `@${slot.partnerUsername || 'partner'}`}
          </div>
        </div>
      </div>

      {/* Commission Ledger Details */}
      <div className="space-y-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-emerald-400" />
            <span>Direct P2P:</span>
          </span>
          <span
            className={`font-bold font-['Space_Grotesk'] ${
              slot.isRecycle ? 'text-purple-300' : 'text-emerald-400'
            }`}
          >
            {slot.isRecycle ? 'Reinvested to Upline' : `+$${slot.amount.toFixed(2)} USD (100%)`}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Confirmed:</span>
          </span>
          <span className="text-slate-300">
            {new Date(slot.filledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
          <span>Verifiable Tx:</span>
          {bscScanUrl ? (
            <a
              href={bscScanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              <span>{txHash ? formatShortWalletAddress(txHash) : 'BscScan Tx'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="font-mono text-slate-500">100% On-Chain Confirmed</span>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-1 text-[10px] text-slate-400 hover:text-white text-center cursor-pointer transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
};
