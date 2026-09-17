import React, { useState, useRef } from 'react';
import {
  Download,
  Share2,
  Copy,
  Check,
  Zap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MatrixAccount } from '../../types';
import { playMatrixChime } from '../../utils/web3Effects';

interface PartnerMarketingCardProps {
  matrixAccount: MatrixAccount | null;
}

export const PartnerMarketingCard: React.FC<PartnerMarketingCardProps> = ({ matrixAccount }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const refCode = user?.referralCode || 'NEXVORA';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexvora.global';
  const referralUrl = `${siteUrl}/register?ref=${refCode}`;
  const shortAddress = matrixAccount?.userId
    ? `0x${matrixAccount.userId.substring(4, 8)}...${matrixAccount.userId.substring(matrixAccount.userId.length - 4)}`
    : '0x71...4Eb9';

  const tierLevel = matrixAccount?.currentMaxLevel || 1;
  const tierNames = [
    'Starter',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Crown',
    'Royal',
    'Titan',
    'Ambassador',
    'Presidential',
    'Global Founder',
  ];
  const tierTitle = tierNames[tierLevel - 1] || 'Web3 Matrix Node';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    playMatrixChime('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = `Join Nexvora Web3 12-Level Matrix! $2.00 activation with 100% instant peer-to-peer wallet ledger payouts and auto-recycling. My Matrix ID: ${refCode}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const handleShareWhatsApp = () => {
    const text = `Join Nexvora Web3 12-Level Matrix! $2.00 activation with 100% instant peer-to-peer wallet payouts: ${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // High-Resolution Canvas Rendering & PNG Download
  const handleDownloadCard = async () => {
    try {
      setDownloading(true);
      playMatrixChime('click');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 680;

      // 1. Dark Cyber Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 680);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.5, '#0b1329');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 680);

      // Glowing Neon Ambient Orbs
      const rad1 = ctx.createRadialGradient(250, 200, 20, 250, 200, 450);
      rad1.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
      rad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, 1200, 680);

      const rad2 = ctx.createRadialGradient(950, 450, 20, 950, 450, 450);
      rad2.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
      rad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, 1200, 680);

      // Cyber Grid Accent
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1200; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 680);
        ctx.stroke();
      }
      for (let y = 0; y < 680; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Outer Border Glow
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 1140, 620);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(38, 38, 1124, 604);

      // Brand Header
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText('NEXVORA', 70, 95);

      ctx.fillStyle = '#06B6D4';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText('WEB3 MATRIX', 260, 95);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '18px sans-serif';
      ctx.fillText('DECENTRALIZED 12-LEVEL 1x3 REINVESTMENT PROTOCOL', 70, 130);

      // Tier Badge Pill
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(70, 170, 320, 50, [25]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.fillText(`⚡ LEVEL ${tierLevel}: ${tierTitle.toUpperCase()}`, 90, 202);

      // User Identification Block
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px "Space Grotesk", sans-serif';
      ctx.fillText(user?.fullName || 'Matrix Node Partner', 70, 280);

      ctx.fillStyle = '#06B6D4';
      ctx.font = '22px monospace';
      ctx.fillText(`ID: #${user?.referralCode || '84920'}  •  Wallet: ${shortAddress}`, 70, 320);

      // Metric Stats Box 1: Matrix Commissions
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(70, 370, 260, 110, [16]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '16px sans-serif';
      ctx.fillText('TOTAL COMMISSIONS', 95, 405);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 34px "Space Grotesk", sans-serif';
      ctx.fillText(`$${(matrixAccount?.totalMatrixEarned || 0).toFixed(2)} USD`, 95, 450);

      // Metric Stats Box 2: Total Recycles
      ctx.beginPath();
      ctx.roundRect(360, 370, 260, 110, [16]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '16px sans-serif';
      ctx.fillText('RECYCLES COMPLETED', 385, 405);

      ctx.fillStyle = '#A78BFA';
      ctx.font = 'bold 34px "Space Grotesk", sans-serif';
      ctx.fillText(`x${matrixAccount?.totalRecycles || 0} Cycles`, 385, 450);

      // Referral Link Footer Block
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(70, 520, 680, 75, [16]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '14px sans-serif';
      ctx.fillText('DIRECT INVITATION LINK (100% INSTANT PAYOUTS):', 95, 545);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(referralUrl, 95, 575);

      // Right Side: High-Tech QR Code Container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(830, 140, 290, 420, [24]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.fillText('SCAN TO JOIN', 895, 185);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '13px sans-serif';
      ctx.fillText('Direct 1x3 Matrix Registration', 870, 210);

      // Draw QR Code Pattern directly on canvas
      const qrSize = 200;
      const qrX = 875;
      const qrY = 240;

      // QR White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);

      // Generate geometric QR-like grid deterministically based on referral code
      ctx.fillStyle = '#0F172A';
      const gridSize = 25;
      const cellSize = qrSize / gridSize;

      // Corner finder patterns
      function drawFinder(fx: number, fy: number) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
      }

      drawFinder(qrX, qrY);
      drawFinder(qrX + qrSize - cellSize * 7, qrY);
      drawFinder(qrX, qrY + qrSize - cellSize * 7);

      // Deterministic data cells
      ctx.fillStyle = '#0F172A';
      let seed = 0;
      for (let i = 0; i < refCode.length; i++) seed += refCode.charCodeAt(i);

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          // Avoid corners
          const inCorner1 = r < 8 && c < 8;
          const inCorner2 = r < 8 && c >= gridSize - 8;
          const inCorner3 = r >= gridSize - 8 && c < 8;
          if (inCorner1 || inCorner2 || inCorner3) continue;

          if (((r * 13 + c * 17 + seed) % 3) === 0 || ((r * c + seed) % 5 === 0)) {
            ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize, cellSize);
          }
        }
      }

      // QR Footer Note
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 15px "Space Grotesk", sans-serif';
      ctx.fillText('100% PEER-TO-PEER', 890, 480);

      ctx.fillStyle = '#64748B';
      ctx.font = '12px sans-serif';
      ctx.fillText('$2.00 Activation • 12 Levels', 885, 505);

      // Convert to PNG and trigger download
      const imageUri = canvas.toDataURL('image/png');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = imageUri;
      downloadAnchor.download = `nexvora-partner-${refCode}.png`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      playMatrixChime('upgrade');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div id="partner-marketing-card-container" className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">
              Official Web3 Partner Card (পার্টনার কার্ড)
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Download your customized high-resolution QR marketing flyer or share your direct matrix link across Telegram and WhatsApp to earn $1 activation bonuses + 100% matrix payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating PNG...' : 'Download Partner Card (PNG)'}</span>
          </button>
        </div>
      </div>

      {/* Futuristic Cyber Card Visual Preview */}
      <div className="max-w-3xl mx-auto">
        <div
          ref={cardRef}
          className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden"
        >
          {/* Neon Glow Accents */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left Content */}
            <div className="space-y-5 flex-1 min-w-0">
              {/* Brand & Tier */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-sm">
                    N
                  </div>
                  <span className="text-base font-extrabold tracking-tight text-white font-['Space_Grotesk']">
                    NEXVORA <span className="text-cyan-400">WEB3</span>
                  </span>
                </div>

                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-['Space_Grotesk']">
                  <Zap className="w-3 h-3 text-emerald-400 fill-current" />
                  <span>LEVEL {tierLevel}: {tierTitle.toUpperCase()}</span>
                </span>
              </div>

              {/* User Identity */}
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk']">
                  {user?.fullName || 'Matrix Partner Node'}
                </h4>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mt-1">
                  <span>ID: #{refCode}</span>
                  <span>•</span>
                  <span>{shortAddress}</span>
                </div>
              </div>

              {/* Matrix Stats Pills */}
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Commissions Earned</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
                      ${(matrixAccount?.totalMatrixEarned || 0).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-emerald-500 font-bold">USD</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Recycle Cycles</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg sm:text-xl font-extrabold text-purple-300 font-['Space_Grotesk']">
                      x{matrixAccount?.totalRecycles || 0}
                    </span>
                    <span className="text-[9px] text-purple-400 font-medium">Times</span>
                  </div>
                </div>
              </div>

              {/* Protocol Highlights */}
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>100% Instant Peer-to-Peer Wallet Payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Infinite 1x3 Slot Auto-Reinvestment</span>
                </div>
              </div>
            </div>

            {/* Right Content: QR Code Container */}
            <div className="p-5 rounded-3xl bg-slate-950/90 border border-cyan-500/40 text-center space-y-3 shrink-0 shadow-xl">
              <div className="text-[11px] font-bold text-slate-300 font-['Space_Grotesk'] uppercase tracking-wider">
                Scan to Join Team
              </div>

              {/* Crisp SVG QR Code Canvas Simulation */}
              <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-md">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-slate-950"
                  fill="currentColor"
                >
                  {/* Corners */}
                  <rect x="5" y="5" width="28" height="28" rx="4" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="13" width="12" height="12" rx="2" />

                  <rect x="67" y="5" width="28" height="28" rx="4" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="75" y="13" width="12" height="12" rx="2" />

                  <rect x="5" y="67" width="28" height="28" rx="4" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="75" width="12" height="12" rx="2" />

                  {/* Body data matrix blocks */}
                  <rect x="38" y="10" width="8" height="8" />
                  <rect x="50" y="15" width="10" height="6" />
                  <rect x="38" y="24" width="6" height="10" />
                  <rect x="48" y="30" width="8" height="8" />
                  <rect x="10" y="40" width="12" height="6" />
                  <rect x="26" y="42" width="8" height="12" />
                  <rect x="40" y="44" width="20" height="12" />
                  <rect x="65" y="40" width="14" height="8" />
                  <rect x="82" y="44" width="8" height="14" />
                  <rect x="40" y="62" width="10" height="12" />
                  <rect x="54" y="66" width="16" height="8" />
                  <rect x="74" y="64" width="16" height="10" />
                  <rect x="44" y="80" width="12" height="10" />
                  <rect x="60" y="80" width="14" height="12" />
                  <rect x="80" y="82" width="12" height="8" />
                </svg>
              </div>

              <span className="text-[10px] text-cyan-400 font-mono block">
                Ref: {refCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Actions Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1 min-w-0">
          <span className="text-xs text-slate-400 block mb-1">Your Direct Matrix Link</span>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-200 font-mono truncate flex-1 pl-1">
              {referralUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={handleShareTelegram}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] border border-[#229ED9]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Share to Telegram</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Share to WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
