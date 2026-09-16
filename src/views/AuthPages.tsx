import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthPagesProps {
  mode: 'login' | 'register';
  navigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode, navigate }) => {
  const { login, register } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isRefFromUrl, setIsRefFromUrl] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Preserve and lock referral code from APP_URL/register?ref={code}
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryRef = searchParams.get('ref');
      if (queryRef && queryRef.trim()) {
        const cleanRef = queryRef.trim().toUpperCase();
        setReferralCode(cleanRef);
        setIsRefFromUrl(true);
        try {
          sessionStorage.setItem('nexvora_ref_code', cleanRef);
        } catch {}
      } else {
        try {
          const storedRef = sessionStorage.getItem('nexvora_ref_code');
          if (storedRef && storedRef.trim()) {
            setReferralCode(storedRef.trim().toUpperCase());
            setIsRefFromUrl(true);
          }
        } catch {}
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard/earn');
      } else {
        if (!disclaimerAccepted) {
          setError('You must accept the Earnings Disclaimer and Terms to register.');
          setLoading(false);
          return;
        }
        await register({
          email,
          password,
          fullName,
          username,
          phone,
          referralCode: referralCode.trim() || undefined,
        });
        navigate('/dashboard/earn');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/40 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            {mode === 'login' ? 'Sign In to Nexvora' : 'Create Your Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Access your authenticated wallet, tasks, and project dashboard.'
              : 'Join the global network of digital marketers, developers, and learners.'}
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="register-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mijanur Rahman"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                  <div className="relative">
                    <span className="text-slate-500 absolute left-3.5 top-2 text-sm font-semibold">@</span>
                    <input
                      id="register-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="username"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              {mode === 'register' && (
                <p className="text-[10px] text-slate-400 mt-1">Minimum 8 characters with alphanumeric security.</p>
              )}
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="register-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+8801700000000"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="register-referral" className="block text-xs font-medium text-slate-300">
                      Referral Code {isRefFromUrl ? '(Verified Invite Link)' : '(Optional)'}
                    </label>
                    {isRefFromUrl && (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Attributed via Invite
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="register-referral"
                      type="text"
                      readOnly={isRefFromUrl}
                      disabled={isRefFromUrl}
                      value={referralCode}
                      onChange={(e) => !isRefFromUrl && setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                      placeholder="e.g. NEXVORA_FOUNDER"
                      className={`w-full px-3 py-2 text-sm bg-slate-950 border rounded-xl font-mono uppercase transition-colors ${
                        isRefFromUrl
                          ? 'border-emerald-700/60 text-emerald-300 cursor-not-allowed bg-emerald-950/25'
                          : 'border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500'
                      }`}
                    />
                  </div>
                  {isRefFromUrl ? (
                    <p className="text-[10px] text-emerald-400/90 mt-1">
                      ✓ Your account is linked to your inviter ({referralCode}). Attribution locked.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Optional: Enter your referrer&apos;s unique invitation code.
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={disclaimerAccepted}
                      onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>
                      I agree to the <button type="button" onClick={() => navigate('/terms')} className="text-cyan-400 underline">Terms</button> and acknowledge the <button type="button" onClick={() => navigate('/earnings-disclaimer')} className="text-cyan-400 underline">Earnings Disclaimer</button> that income is not guaranteed.
                    </span>
                  </label>
                </div>
              </>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Validating credentials...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick link to toggle login/register */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  id="toggle-to-register"
                  onClick={() => navigate('/register')}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Register now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  id="toggle-to-login"
                  onClick={() => navigate('/login')}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
