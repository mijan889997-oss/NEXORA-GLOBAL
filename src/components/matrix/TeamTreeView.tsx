import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Award,
  ChevronDown,
  Sparkles,
  Share2,
} from 'lucide-react';
import { MatrixTeamTreeData, MatrixTeamNode } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TeamTreeViewProps {
  onOpenPartnerCard?: () => void;
}

export const TeamTreeView: React.FC<TeamTreeViewProps> = ({ onOpenPartnerCard }) => {
  const { apiFetch } = useAuth();
  const [treeData, setTreeData] = useState<MatrixTeamTreeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'direct' | 'spillover'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<MatrixTeamNode | null>(null);

  const fetchTeamTree = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/matrix/team');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setTreeData(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load matrix team tree:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamTree();
  }, []);

  if (loading && !treeData) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
        <p className="text-sm font-['Space_Grotesk']">Loading Web3 Matrix Downline Tree...</p>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400">
        <p className="text-sm">Unable to load team network.</p>
        <button
          type="button"
          onClick={fetchTeamTree}
          className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const upline = treeData.upline || null;
  const currentUser: MatrixTeamNode = treeData.currentUser || {
    id: 'user_master',
    name: 'Master Node',
    username: 'masternode',
    walletAddress: '0x00...0000',
    avatarUrl: '',
    level: 1,
    totalEarned: 0,
    recycles: 0,
    isDirect: true,
    isSpillover: false,
    joinedAt: new Date().toISOString(),
  };
  const directPartners = Array.isArray(treeData.directPartners) ? treeData.directPartners : [];
  const spillovers = Array.isArray(treeData.spillovers) ? treeData.spillovers : [];
  const totalTeamCount = treeData.totalTeamCount || 0;
  const directCount = treeData.directCount || 0;
  const totalTeamVolume = treeData.totalTeamVolume || 0;

  const filteredDirects = directPartners.filter((p) => {
    if (filterMode === 'spillover') return p?.isSpillover;
    if (filterMode === 'direct') return !p?.isSpillover;
    return true;
  }).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p?.name || '').toLowerCase().includes(q) ||
      (p?.username || '').toLowerCase().includes(q) ||
      (p?.walletAddress || '').toLowerCase().includes(q)
    );
  });

  const filteredSpillovers = spillovers.filter((s) => {
    if (filterMode === 'direct') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s?.name || '').toLowerCase().includes(q) ||
      (s?.username || '').toLowerCase().includes(q) ||
      (s?.walletAddress || '').toLowerCase().includes(q)
    );
  });

  return (
    <div id="matrix-team-tree-view" className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Total Team Network</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
              {totalTeamCount}
            </span>
            <span className="text-xs text-slate-400">Nodes</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold block mt-1">Multi-tier Structure</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Direct 1x3 Partners</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
              {directCount}
            </span>
            <span className="text-xs text-slate-400">Partners</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Direct Referrals</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Total Matrix Volume</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-cyan-300 font-['Space_Grotesk']">
              ${totalTeamVolume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">USD</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Global Team Turnover</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Partner Card Marketing</span>
            <span className="text-xs text-slate-300 mt-1 block">Downloadable QR Flyer</span>
          </div>
          {onOpenPartnerCard && (
            <button
              type="button"
              onClick={onOpenPartnerCard}
              className="mt-2 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Open Partner Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Nodes ({directPartners.length + spillovers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'direct'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct Partners ({directCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('spillover')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'spillover'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Spillovers ({spillovers.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by wallet / username..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Hierarchical Interactive Visual Tree Canvas */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Futuristic Grid Canvas Lines Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 flex flex-col items-center space-y-8 max-w-4xl mx-auto">
          {/* LEVEL 0: UPLINE SPONSOR NODE */}
          {upline && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 font-['Space_Grotesk']">
                ▲ Direct Upline Sponsor Node
              </span>

              <div
                onClick={() => setSelectedNode(upline)}
                className="group relative p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-3 w-64 select-none"
              >
                <img
                  src={upline.avatarUrl}
                  alt={upline.name}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate font-['Space_Grotesk']">
                      {upline.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                      L{upline.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    {upline.walletAddress ? `${upline.walletAddress.substring(0, 6)}...${upline.walletAddress.substring(36)}` : '@sponsor'}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold block">
                    Earned: ${(upline.totalEarned || 0).toFixed(0)} USD
                  </span>
                </div>
              </div>

              {/* Connecting Vertical Trunk */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-400 my-1 shadow-[0_0_10px_#06b6d4]" />
            </div>
          )}

          {/* LEVEL 1: CURRENT USER NODE (Center Spotlight) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-2 font-['Space_Grotesk'] flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400 fill-current" />
              <span>YOUR MASTER MATRIX NODE</span>
            </span>

            <div
              onClick={() => setSelectedNode(currentUser)}
              className="relative p-4 rounded-3xl bg-slate-900/95 border-2 border-emerald-400/80 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center gap-4 w-72 sm:w-80 cursor-pointer select-none transition-transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 ring-4 ring-emerald-500/20"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center font-['Space_Grotesk']">
                  L{currentUser.level}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white font-['Space_Grotesk'] truncate">
                    {currentUser.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono block truncate">
                  {currentUser.walletAddress ? `${currentUser.walletAddress.substring(0, 6)}...${currentUser.walletAddress.substring(36)}` : '0x7a...User'}
                </span>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-300">
                  <span className="text-emerald-300 font-bold font-['Space_Grotesk']">
                    ${(currentUser.totalEarned || 0).toFixed(2)} USD
                  </span>
                  <span>•</span>
                  <span className="text-purple-300 font-bold font-['Space_Grotesk']">
                    x{currentUser.recycles || 0} Recycles
                  </span>
                </div>
              </div>
            </div>

            {/* Connecting Fork Stem to Direct Partners */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-400 to-cyan-500 my-1" />
            <div className="w-3/4 max-w-lg h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_#06b6d4]" />
            <div className="w-0.5 h-4 bg-cyan-500" />
          </div>

          {/* LEVEL 2: DIRECT 1x3 PARTNERS ROW */}
          <div className="w-full space-y-3">
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-['Space_Grotesk']">
                ▼ Direct 1x3 Slot Partners (Generation 1)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDirects.map((partner, idx) => (
                <div
                  key={partner.id}
                  onClick={() => setSelectedNode(partner)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none hover:scale-[1.02] shadow-lg ${
                    partner.isSpillover
                      ? 'bg-purple-950/20 border-purple-500/40 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-['Space_Grotesk'] text-slate-400 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-300 flex items-center justify-center text-[9px]">
                        {idx + 1}
                      </span>
                      <span>Slot #{idx + 1}</span>
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        partner.isSpillover
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {partner.isSpillover ? 'Spillover' : 'Direct 100%'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        partner.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={partner.name}
                      className="w-9 h-9 rounded-full object-cover border border-cyan-500/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate font-['Space_Grotesk']">
                          {partner.name}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-400">
                          L{partner.level}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono truncate block">
                        {partner.walletAddress ? `${partner.walletAddress.substring(0, 6)}...${partner.walletAddress.substring(36)}` : `@${partner.username}`}
                      </span>
                      <div className="flex items-center justify-between text-[9px] mt-1 text-slate-300">
                        <span className="text-emerald-400 font-bold">
                          +${(partner.totalEarned || 0).toFixed(0)} USD
                        </span>
                        <span className="text-purple-300 font-medium">
                          x{partner.recycles || 0} Cycles
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEVEL 3: SECONDARY SPILLOVERS & TEAM DEPTH */}
          {filteredSpillovers.length > 0 && (
            <div className="w-full space-y-3 pt-4 border-t border-slate-800/80">
              <div className="text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 font-['Space_Grotesk']">
                  ▼ Secondary Spillovers & Downline Depth (Generation 2)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredSpillovers.map((spill) => (
                  <div
                    key={spill.id}
                    onClick={() => setSelectedNode(spill)}
                    className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  >
                    <div className="flex items-center justify-between text-[9px] mb-1.5">
                      <span className="text-purple-300 font-bold">Spillover Node</span>
                      <span className="text-cyan-400 font-mono font-bold">L{spill.level}</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate font-['Space_Grotesk']">
                      {spill.name}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {spill.walletAddress ? `${spill.walletAddress.substring(0, 6)}...${spill.walletAddress.substring(36)}` : `@${spill.username}`}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                      Volume: ${(spill.totalEarned || 0).toFixed(0)} USD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Node Details Modal */}
      {selectedNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 font-['Space_Grotesk'] uppercase tracking-wider">
                Matrix Node Telemetry
              </span>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white cursor-pointer px-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={
                  selectedNode.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                }
                alt={selectedNode.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/40"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white font-['Space_Grotesk'] truncate">
                  {selectedNode.name}
                </h4>
                <p className="text-xs text-cyan-400 font-mono">@{selectedNode.username}</p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedNode.walletAddress}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Matrix Level</span>
                <span className="text-sm font-bold text-cyan-300 font-['Space_Grotesk']">
                  Level {selectedNode.level} Node
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Commissions</span>
                <span className="text-sm font-bold text-emerald-400 font-['Space_Grotesk']">
                  ${(selectedNode.totalEarned || 0).toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recycle Cycles</span>
                <span className="text-sm font-bold text-purple-300 font-['Space_Grotesk']">
                  x{selectedNode.recycles || 0} Cycles
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Placement</span>
                <span className="text-sm font-bold text-white font-['Space_Grotesk']">
                  {selectedNode.isSpillover ? 'Spillover' : 'Direct 1x3'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
