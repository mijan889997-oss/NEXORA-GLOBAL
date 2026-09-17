import React, { useState } from 'react';
import {
  X,
  Camera,
  User as UserIcon,
  Phone,
  MessageSquare,
  Send,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onProfileUpdated?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=NexvoraPro',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberMatrix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoLeader',
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onProfileUpdated,
}) => {
  const { user, profile, wallet, apiFetch, refreshMe } = useAuth();

  const [displayName, setDisplayName] = useState<string>(
    user?.fullName || (profile as any)?.fullName || ''
  );
  const [phone, setPhone] = useState<string>(
    user?.phone || profile?.phone || ''
  );
  const [whatsapp, setWhatsapp] = useState<string>(
    (user as any)?.whatsapp || (profile as any)?.whatsapp || user?.phone || ''
  );
  const [telegramUsername, setTelegramUsername] = useState<string>(
    (user as any)?.telegramUsername || (profile as any)?.telegramUsername || ''
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatarUrl || profile?.avatarUrl || PRESET_AVATARS[0]
  );

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAvatarUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaving(true);

    try {
      // Clean telegram format
      let formattedTelegram = telegramUsername.trim();
      if (formattedTelegram.startsWith('@')) {
        formattedTelegram = formattedTelegram.substring(1);
      } else if (formattedTelegram.startsWith('https://t.me/')) {
        formattedTelegram = formattedTelegram.replace('https://t.me/', '');
      }

      const payload = {
        fullName: displayName.trim() || user?.fullName || 'Nexvora Leader',
        displayName: displayName.trim() || user?.fullName || 'Nexvora Leader',
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        telegramUsername: formattedTelegram,
        avatarUrl: avatarUrl.trim(),
      };

      const res = await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res && res.success !== false) {
        setSuccessToast('Profile settings saved successfully!');
        if (refreshMe) {
          await refreshMe();
        }
        if (onSuccess) {
          onSuccess();
        }
        if (onProfileUpdated) {
          onProfileUpdated();
        }
        setTimeout(() => {
          setSuccessToast(null);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res?.message || 'Failed to update profile settings.');
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setErrorMessage(err.message || 'Network error while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const copyWalletAddress = () => {
    const addr = (wallet as any)?.walletAddress || (user as any)?.walletAddress || '';
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const boundWallet = (wallet as any)?.walletAddress || (user as any)?.walletAddress || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="profile-settings-modal"
        className="relative w-full max-w-lg rounded-3xl bg-[#0B1120] border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-md">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                Profile & Contact Settings
              </h2>
              <p className="text-xs text-slate-400">
                Update your avatar, team contact info & Web3 identity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Success Banner */}
          {successToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Avatar Section */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-['Space_Grotesk']">
              Avatar & Visual Identity
            </label>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-4 ring-cyan-500/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                  }}
                />
                <label className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-cyan-300" />
                  <span className="text-[9px] font-bold mt-0.5">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-xs text-slate-300 font-semibold">
                  Choose a preset or upload a custom image
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_AVATARS.slice(0, 5).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-7 h-7 rounded-full overflow-hidden border transition-transform hover:scale-110 cursor-pointer ${
                        avatarUrl === preset ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 font-['Space_Grotesk']">
                Display Name (নাম)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Alex Vance"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder:text-slate-500 font-medium outline-none transition-all"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Telegram Username */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 font-['Space_Grotesk']">
                  Telegram Username (টেলিগ্রাম আইডি)
                </label>
                <span className="text-[10px] text-cyan-400">For direct upline/downline P2P chat</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="e.g., cryptoleader or @username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder:text-slate-500 font-medium outline-none transition-all"
                />
                <Send className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* WhatsApp / Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 font-['Space_Grotesk']">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+8801700000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder:text-slate-500 font-medium outline-none transition-all"
                  />
                  <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 font-['Space_Grotesk']">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-xs placeholder:text-slate-500 font-medium outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Bound BEP-20 Wallet Address (Read-only status) */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 font-['Space_Grotesk']">
                  <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bound BEP-20 Matrix Wallet</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  {boundWallet ? 'Connected & Verified' : 'Awaiting Binding'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-mono text-cyan-300 truncate select-all">
                  {boundWallet || '0x03d7682C2840612F2040353876628b9784428ACF'}
                </span>
                <button
                  type="button"
                  onClick={copyWalletAddress}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2"
                  title="Copy Wallet Address"
                >
                  {copiedWallet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
