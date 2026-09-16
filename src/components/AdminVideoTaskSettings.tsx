import React, { useState, useEffect } from 'react';
import { Play, Clock, Coins, ShieldCheck, CheckCircle2, RefreshCw, Sparkles, AlertCircle, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface VideoTaskSettingsData {
  videoTaskLimit: number;
  videoTaskCooldown: number;
  videoTaskRewardCoins: number;
  videoRewardUsd?: number;
}

export const DEFAULT_VIDEO_SETTINGS: VideoTaskSettingsData = {
  videoTaskLimit: 10,
  videoTaskCooldown: 30,
  videoTaskRewardCoins: 5,
};

export const AdminVideoTaskSettings: React.FC = () => {
  const { apiFetch } = useAuth();
  const [settings, setSettings] = useState<VideoTaskSettingsData>(DEFAULT_VIDEO_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch current video task settings from database
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/tasks/video-settings');
      if (res?.settings) {
        setSettings({
          videoTaskLimit: Number(res.settings.videoTaskLimit ?? DEFAULT_VIDEO_SETTINGS.videoTaskLimit),
          videoTaskCooldown: Number(res.settings.videoTaskCooldown ?? DEFAULT_VIDEO_SETTINGS.videoTaskCooldown),
          videoTaskRewardCoins: Number(res.settings.videoTaskRewardCoins ?? DEFAULT_VIDEO_SETTINGS.videoTaskRewardCoins),
        });
      }
    } catch (err: any) {
      console.error('Failed to load video task settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save settings to database via PUT /api/admin/video-settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        videoTaskLimit: Math.max(1, Number(settings.videoTaskLimit) || 10),
        videoTaskCooldown: Math.max(0, Number(settings.videoTaskCooldown) || 0),
        videoTaskRewardCoins: Math.max(1, Number(settings.videoTaskRewardCoins) || 5),
      };

      const res = await apiFetch('/api/admin/video-settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res?.success) {
        setFeedback({
          type: 'success',
          message: 'Video task settings saved successfully to the database!',
        });
        // Dispatch custom event to sync active client tabs
        window.dispatchEvent(new CustomEvent('videoSettingsUpdated', { detail: payload }));
        window.dispatchEvent(new Event('storage'));
      } else {
        throw new Error(res?.error || 'Failed to save settings to database.');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error saving video task settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset Video Task Settings to recommended defaults (Limit: 10, Cooldown: 30s, Reward: 5 Coins)?')) {
      setSettings(DEFAULT_VIDEO_SETTINGS);
    }
  };

  const usdValue = ((settings.videoTaskRewardCoins || 5) / 1000).toFixed(4);
  const dailyPotentialCoins = (settings.videoTaskLimit || 10) * (settings.videoTaskRewardCoins || 5);
  const dailyPotentialUsd = (dailyPotentialCoins / 1000).toFixed(3);

  const inputClass =
    'w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 font-medium placeholder-slate-400 focus:text-slate-900 focus:bg-white dark:text-white dark:bg-slate-800 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors';

  const inputStyle: React.CSSProperties = {
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Video Task Settings</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Database Linked
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure daily video watch limits, cooldown intervals between views, and coin reward amounts for user video tasks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
            title="Reload from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Input 1: Daily Video Limit */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Daily Video Limit
              </label>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Default: 10
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="500"
              required
              value={settings.videoTaskLimit}
              onChange={(e) =>
                setSettings({ ...settings, videoTaskLimit: Math.max(1, Number(e.target.value)) })
              }
              className={inputClass}
              style={inputStyle}
              placeholder="10"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Maximum number of video tasks a user can watch & claim rewards for per day.
            </p>
          </div>

          {/* Input 2: Cooldown Timer in seconds */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Cooldown Timer (Seconds)
              </label>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Default: 30s
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="3600"
                required
                value={settings.videoTaskCooldown}
                onChange={(e) =>
                  setSettings({ ...settings, videoTaskCooldown: Math.max(0, Number(e.target.value)) })
                }
                className={inputClass}
                style={inputStyle}
                placeholder="30"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                sec
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Mandatory waiting period on the watch button between consecutive video views.
            </p>
          </div>

          {/* Input 3: Reward Coins per video */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Reward Coins per Video
              </label>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Default: 5
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10000"
                required
                value={settings.videoTaskRewardCoins}
                onChange={(e) =>
                  setSettings({ ...settings, videoTaskRewardCoins: Math.max(1, Number(e.target.value)) })
                }
                className={inputClass}
                style={inputStyle}
                placeholder="5"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-500 text-xs font-semibold">
                Coins
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              = ${usdValue} USD per video (1,000 Coins = $1.00)
            </p>
          </div>
        </div>

        {/* Live Calculation & Economics Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-rose-50/30 to-slate-50 dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
              User Daily Earning Ceiling
            </span>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Up to {dailyPotentialCoins} Coins / day</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-normal">
                (${dailyPotentialUsd} USD)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Cooldown: <strong>{settings.videoTaskCooldown}s</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Anti-Cheat Active</span>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
