import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  Award,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Info,
} from 'lucide-react';
import { generateReferralLink, REFERRAL_SHARE_MESSAGE } from '../utils/referral';

export interface InviteAndEarnCardProps {
  referralCode?: string;
  serverProvidedAppUrl?: string;
  serverProvidedReferralLink?: string;
  totalReferrals?: number;
  qualifiedCount?: number;
  rewardsEarned?: number;
  compact?: boolean;
}

export const InviteAndEarnCard: React.FC<InviteAndEarnCardProps> = ({
  referralCode = '',
  serverProvidedAppUrl,
  serverProvidedReferralLink,
  totalReferrals = 0,
  qualifiedCount = 0,
  rewardsEarned = 0,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute dynamic referral URL using the production domain
  const referralLink =
    serverProvidedReferralLink && !serverProvidedReferralLink.includes('localhost')
      ? serverProvidedReferralLink
      : generateReferralLink(referralCode, serverProvidedAppUrl);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        // Fallback for non-secure contexts or iframe restrictions
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      showToast('Referral link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Clipboard write error, trying execCommand fallback:', err);
      try {
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        showToast('Referral link copied!');
        setTimeout(() => setCopied(false), 3000);
      } catch {
        showToast('Please manually select and copy the referral link above.');
      }
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;

    const shareData = {
      title: 'NEXVORA GLOBAL Invitation',
      text: REFERRAL_SHARE_MESSAGE,
      url: referralLink,
    };

    // Check for native Web Share API
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        if (typeof navigator.canShare === 'function') {
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            showToast('Invitation shared successfully!');
            return;
          }
          // Fallback to sharing URL without text if canShare was strict
          await navigator.share({ url: referralLink, title: shareData.title });
          showToast('Invitation shared successfully!');
          return;
        }

        await navigator.share(shareData);
        showToast('Invitation shared successfully!');
        return;
      } catch (err: any) {
        // User closed or dismissed the native share dialog
        if (err && (err.name === 'AbortError' || err.name === 'Abort')) {
          return;
        }
        // If native share encountered permission or browser errors, fallback seamlessly to Copy Link
        await handleCopyLink();
        showToast('Referral link copied! (Native share dialog dismissed)');
        return;
      }
    }

    // Web Share API is unavailable on this browser/environment: seamlessly copy link
    await handleCopyLink();
    showToast('Referral link copied!');
  };

  return (
    <div
      id="invite-earn-card"
      className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950 border border-cyan-900/40 shadow-2xl relative overflow-hidden backdrop-blur-xl"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              Invite & Earn
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              Verified Program
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Invite colleagues, marketers, and freelancers to join NEXVORA GLOBAL. Receive credited bonuses
            in your financial balance as referred members complete qualified milestones.
          </p>
        </div>

        {/* User's Referral Code Badge */}
        <div className="shrink-0 flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium">Your Code:</span>
          <span
            id="user-referral-code-badge"
            className="font-mono text-sm font-bold text-cyan-300 tracking-wider"
          >
            {referralCode || 'NEXVORA'}
          </span>
        </div>
      </div>

      {/* Referral Link & Action Buttons */}
      <div className="relative z-10 mt-5 space-y-3">
        <label htmlFor="referral-link-input" className="block text-xs font-semibold text-slate-200">
          Your Dynamic Referral Link
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              id="referral-link-input"
              type="text"
              readOnly
              value={referralLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              placeholder="Generating unique referral link..."
              className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-mono text-cyan-300 select-all focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Link Button */}
            <button
              id="btn-copy-referral-link"
              type="button"
              onClick={handleCopyLink}
              disabled={!referralLink}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50 hover:shadow-cyan-900/40'
              } disabled:opacity-50`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Referral link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <button
              id="btn-share-referral-link"
              type="button"
              onClick={handleShare}
              disabled={!referralLink}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-slate-900/50 disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Feedback Message Banner */}
        {toastMessage && (
          <div
            id="referral-confirmation-toast"
            className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/70 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Real Statistics Grid (from authenticated database) */}
      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Referrals */}
        <div
          id="stat-total-referrals"
          className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Referrals</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {totalReferrals}
            </p>
            <span className="text-[10px] text-slate-500">Real registered members</span>
          </div>
        </div>

        {/* Qualified Referrals */}
        <div
          id="stat-qualified-referrals"
          className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Qualified Referrals</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-cyan-400 font-['Space_Grotesk']">
              {qualifiedCount}
            </p>
            <span className="text-[10px] text-slate-500">Completed verified work</span>
          </div>
        </div>

        {/* Referral Earnings */}
        <div
          id="stat-referral-earnings"
          className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Referral Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">
              ${rewardsEarned.toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500">Disbursed to ledger wallet</span>
          </div>
        </div>
      </div>

      {/* Program Terms & Qualification Note */}
      {!compact && (
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-start sm:items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Referral bonuses are automatically credited to your wallet balance once your invitee
              completes their first approved task or marketplace milestone.
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Server-Verified Attribution</span>
          </div>
        </div>
      )}
    </div>
  );
};
