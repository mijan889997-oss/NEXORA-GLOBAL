import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { MatrixLiveActivity } from '../../types';
import { isAudioMuted, toggleAudioMute, playMatrixChime } from '../../utils/web3Effects';

interface LiveActivityTickerProps {
  onSelectLevel?: (level: number) => void;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({ onSelectLevel }) => {
  const [activities, setActivities] = useState<MatrixLiveActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(isAudioMuted());

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/matrix/live-feed');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.activities) && data.activities.length > 0) {
            setActivities(data.activities);
          }
        }
      } catch (err) {
        // Fallback default activities
        setActivities([
          {
            id: 'act_1',
            type: 'payout',
            walletAddress: '0x7a419bf82c332145bc0981e4df21980a34b419ef',
            shortAddress: '0x7a...19ef',
            username: 'crypto_knight',
            level: 2,
            amount: 6,
            message: 'Wallet 0x7a...19ef just earned $6.00 on Level 2 Bronze!',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'act_2',
            type: 'upgrade',
            walletAddress: '0x19f2c830a109284cb91285098124098fe190184b',
            shortAddress: '0x19...184b',
            username: 'blockchain_sam',
            level: 5,
            amount: 50,
            message: 'Node 0x19...184b upgraded to Level 5 Platinum ($50)!',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'act_3',
            type: 'recycle',
            walletAddress: '0x8be4713da471209384bc19283746190283746192',
            shortAddress: '0x8b...6192',
            username: 'elena_eth',
            level: 1,
            amount: 3,
            message: 'Wallet 0x8b...6192 completed Recycle #3 on Level 1 (+$3.00)!',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cycle current active ticker every 5 seconds
  useEffect(() => {
    if (activities.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activities.length]);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = toggleAudioMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      playMatrixChime('click');
    }
  };

  const current = activities[currentIndex] || activities[0];
  if (!current) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)]">
      {/* Expanded full feed view */}
      {expanded && (
        <div className="mb-2 p-4 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white font-['Space_Grotesk']">
                Global Live Protocol Ledger (লাইভ ফিড)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      act.type === 'payout'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : act.type === 'recycle'
                        ? 'bg-purple-500/20 text-purple-300'
                        : act.type === 'upgrade'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {act.type === 'recycle' ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-[11px] truncate">{act.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                      {act.txHash && (
                        <a
                          href={`https://bscscan.com/tx/${act.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-0.5"
                          title="View on BscScan"
                        >
                          <span>Tx</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {act.level && onSelectLevel && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLevel(act.level!);
                      setExpanded(false);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold shrink-0 cursor-pointer font-['Space_Grotesk']"
                  >
                    View L{act.level}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Compact Ticker Capsule */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="group flex items-center justify-between gap-3 p-2 sm:p-2.5 pl-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_4px_25px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.35)] transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 font-['Space_Grotesk']">
                Live Web3 Event
              </span>
              <span className="text-[9px] text-slate-500">•</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {current.shortAddress}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs font-['Space_Grotesk']">
              {current.message}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleToggleSound}
            title={muted ? 'Unmute Matrix Synth Effects' : 'Mute Sound Effects'}
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 group-hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
