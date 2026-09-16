import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Download,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Coins,
  ShieldCheck,
  Globe,
  Copy,
  Check,
  Info,
  CheckCircle2,
  TrendingUp,
  Tag,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  X,
  ArrowUpRight,
} from 'lucide-react';
import type { CpagripOffer, CpagripFeedResponse, Transaction } from '../types';

interface CpagripOffersSectionProps {
  transactions?: Transaction[];
  onRefreshData?: () => void;
}

export const CpagripOffersSection: React.FC<CpagripOffersSectionProps> = ({
  transactions = [],
  onRefreshData,
}) => {
  const { user, apiFetch } = useAuth();
  const effectiveUserId = user?.id || 'guest_user';

  const [offers, setOffers] = useState<CpagripOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('AUTO');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'payout_desc' | 'payout_asc' | 'title' | 'epc'>('payout_desc');
  const [detectedCountry, setDetectedCountry] = useState<string>('US');
  const [selectedOfferForModal, setSelectedOfferForModal] = useState<CpagripOffer | null>(null);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'frame'>('cards');
  const [iframeBlocked, setIframeBlocked] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedFeedUrl, setCopiedFeedUrl] = useState<boolean>(false);

  const directFeedUrl = `https://www.cpagrip.com/common/offer_feed_json.php?user_id=2555615&pubkey=d5478a408fc034ebc27293f21255c924&tracking_id=${encodeURIComponent(effectiveUserId)}`;

  // Fetch live CPAGrip offers using verified credentials & JSON feed
  const fetchOffers = async (countryCode = selectedCountry) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `/api/offers/cpagrip/feed?tracking_id=${encodeURIComponent(effectiveUserId)}${
        countryCode !== 'AUTO' ? `&country=${encodeURIComponent(countryCode)}` : ''
      }`;
      const data: CpagripFeedResponse = await apiFetch(endpoint);

      if (data && data.success && Array.isArray(data.offers)) {
        setOffers(data.offers);
        if (data.detectedCountry) {
          setDetectedCountry(data.detectedCountry);
        }
        setLastUpdated(new Date());
      } else {
        throw new Error(data?.error || 'Failed to parse live offers from CPAGrip feed');
      }
    } catch (err: any) {
      console.error('[CPAGrip Offers] Fetch error:', err);
      setError(err?.message || 'Unable to connect to CPAGrip live offer feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(selectedCountry);
  }, [selectedCountry, effectiveUserId]);

  // Extract unique categories from loaded offers
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    offers.forEach((o) => {
      if (o.category) cats.add(o.category);
    });
    return Array.from(cats);
  }, [offers]);

  // Filter and sort offers
  const filteredOffers = useMemo(() => {
    return offers
      .filter((offer) => {
        const matchesSearch =
          searchQuery === '' ||
          offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (offer.category && offer.category.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat =
          selectedCategory === 'ALL' ||
          (offer.category && offer.category.toLowerCase() === selectedCategory.toLowerCase());

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        const payoutA = parseFloat(a.payout || '0');
        const payoutB = parseFloat(b.payout || '0');
        const epcA = parseFloat(a.netepc || '0');
        const epcB = parseFloat(b.netepc || '0');

        switch (sortBy) {
          case 'payout_desc':
            return payoutB - payoutA;
          case 'payout_asc':
            return payoutA - payoutB;
          case 'epc':
            return epcB - epcA;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [offers, searchQuery, selectedCategory, sortBy]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedOfferId(id);
    setTimeout(() => setCopiedOfferId(null), 2500);
  };

  const handleCopyFeedUrl = () => {
    navigator.clipboard.writeText(directFeedUrl);
    setCopiedFeedUrl(true);
    setTimeout(() => setCopiedFeedUrl(false), 2500);
  };

  // Filter CPAGrip specific ledger credits
  const cpagripLedgerTransactions = transactions.filter(
    (t) => t.referenceType === 'cpagrip_lead' || t.description.toLowerCase().includes('cpagrip')
  );

  return (
    <div className="space-y-6" id="cpagrip-live-offerwall">
      {/* Top Credentials & Attribution Status Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-900/40 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Download className="w-3.5 h-3.5" />
                CPAGrip Live Integration
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800/80 border border-slate-700 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Pub ID: 2555615
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800/80 border border-slate-700 text-amber-300">
                Tracking ID: #{effectiveUserId.substring(0, 10)}
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
              CPAGrip High-Converting Task & Download Feed
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Real-time offer feed synchronized with your verified CPAGrip publisher credentials. All completed tasks are tracked via <code className="text-rose-300 bg-rose-950/60 px-1 py-0.5 rounded text-[11px]">&tracking_id={effectiveUserId}</code> with automated balance credit through our postback webhook.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle: Cards vs Iframe Frame */}
            <div className="bg-slate-950/80 border border-slate-800 p-1 rounded-2xl flex items-center shadow-inner">
              <button
                id="cpagrip-view-cards-btn"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Interactive Cards</span>
              </button>
              <button
                id="cpagrip-view-frame-btn"
                onClick={() => setViewMode('frame')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'frame'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Direct Feed View</span>
              </button>
            </div>

            {/* Quick Refresh */}
            <button
              onClick={() => fetchOffers(selectedCountry)}
              disabled={loading}
              title="Refresh CPAGrip live feed"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            </button>

            {/* Direct JSON Feed Link Button */}
            <a
              href={directFeedUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View Raw JSON Offer Feed in new tab"
              className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="hidden sm:inline">Raw Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <>
          {/* Controls Bar: Search, Country Pills, Category, Sorting */}
          <div className="p-4 md:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search offers by title, keyword, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category & Sorting Controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="ALL">All Categories</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="payout_desc">Highest Payout ($$$)</option>
                    <option value="payout_asc">Lowest Payout ($)</option>
                    <option value="epc">Highest Net EPC</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Country Filter Pills */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-rose-400" />
                  Geo Filter:
                </span>
                {[
                  { code: 'AUTO', label: `🌐 Auto-Detect (${detectedCountry})` },
                  { code: 'BD', label: '🇧🇩 Bangladesh' },
                  { code: 'US', label: '🇺🇸 United States' },
                  { code: 'GB', label: '🇬🇧 United Kingdom' },
                  { code: 'CA', label: '🇨🇦 Canada' },
                  { code: 'AU', label: '🇦🇺 Australia' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setSelectedCountry(item.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCountry === item.code
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-[11px] text-emerald-400 font-medium shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Safe Filter Active (No PIN Submits / Traps)</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Showing <span className="text-white font-bold">{filteredOffers.length}</span> of{' '}
                  <span className="text-white font-bold">{offers.length}</span> live campaigns
                </div>
              </div>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-800/40 rounded-xl" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-slate-800 rounded w-20" />
                    <div className="h-8 bg-slate-800 rounded-xl w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-8 rounded-3xl bg-slate-900 border border-rose-900/50 text-center space-y-4 max-w-lg mx-auto shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Failed to Load CPAGrip Offers
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => fetchOffers(selectedCountry)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Feed Connection</span>
                </button>
                <a
                  href={directFeedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Open JSON Direct
                </a>
              </div>
            </div>
          ) : filteredOffers.length === 0 ? (
            /* Empty State */
            <div className="p-10 rounded-3xl bg-slate-900 border border-dashed border-slate-800 text-center space-y-3">
              <Download className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Live Campaigns Available</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No live campaigns available for this region currently. Check back soon or switch country.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedCountry('US');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Switch to United States (US)
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedCountry('GB');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Switch to United Kingdom (GB)
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedCountry('DE');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Switch to Germany (DE)
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Live Offers Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => {
                const payoutNum = parseFloat(offer.payout || '0');
                const pointsEquiv = Math.round(payoutNum * 100);

                return (
                  <div
                    key={offer.offer_id}
                    id={`cpagrip-card-${offer.offer_id}`}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/90 transition-all duration-200 flex flex-col justify-between group shadow-lg hover:shadow-rose-950/20"
                  >
                    <div>
                      {/* Card Header: Icon, Category & Country Tag */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                          {offer.offerphoto ? (
                            <img
                              src={offer.offerphoto}
                              alt={offer.title}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Fallback icon on image load error
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <Download className="w-5 h-5 text-rose-400 absolute" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 border border-rose-800/60 text-rose-400 truncate max-w-[130px]">
                              {offer.category || 'Direct Task'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                              {offer.accepted_countries || 'Global'}
                            </span>
                          </div>
                          <h4
                            title={offer.title}
                            className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug"
                          >
                            {offer.title}
                          </h4>
                        </div>
                      </div>

                      {/* Conversion Instructions */}
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Conversion Action:
                        </p>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {offer.description || 'Enter your required information to complete the conversion.'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {/* Payout & EPC Details */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mb-3.5">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Instant Reward
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-bold text-emerald-400 font-mono">
                              +${payoutNum.toFixed(2)}
                            </span>
                            <span className="text-[11px] font-mono text-amber-400">
                              ({pointsEquiv} pts)
                            </span>
                          </div>
                        </div>

                        {offer.netepc && parseFloat(offer.netepc) > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-cyan-400" />
                              EPC
                            </p>
                            <span className="text-xs font-mono font-semibold text-slate-300">
                              ${parseFloat(offer.netepc).toFixed(3)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <a
                          id={`start-cpagrip-btn-${offer.offer_id}`}
                          href={offer.offerlink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-rose-600/25 active:scale-95"
                        >
                          <span>Start Offer</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleCopyLink(offer.offerlink, offer.offer_id)}
                          title="Copy tracking URL"
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        >
                          {copiedOfferId === offer.offer_id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedOfferForModal(offer)}
                          title="View offer specifications and step-by-step instructions"
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Direct Feed / Locker Frame View */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-white font-mono truncate">
                Direct Feed URL: {directFeedUrl}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFeedUrl}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {copiedFeedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFeedUrl ? 'Copied' : 'Copy Feed Link'}</span>
              </button>
              <a
                href={directFeedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>Launch New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="relative h-[650px] bg-slate-950">
            {iframeBlocked ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-950/95 text-center">
                <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <Download className="w-12 h-12 text-rose-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Browser Security Notice</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    CPAGrip's raw JSON feed may block cross-origin iframe embedding in sandboxed browsers. Please use the interactive offer cards view or open the feed directly in a new tab.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setViewMode('cards')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                    >
                      Switch to Interactive Cards
                    </button>
                    <a
                      href={directFeedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                key={`cpagrip-raw-frame-${iframeKey}`}
                src={directFeedUrl}
                title="CPAGrip Raw Feed Frame"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                onError={() => setIframeBlocked(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* CPAGrip Postback & Verification Documentation Accordion */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            CPAGrip Automated Postback & Attribution Engine
          </h4>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            HTTP 200 OK • Active
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Our backend endpoint <code className="text-rose-300 bg-rose-950/60 px-1 py-0.5 rounded font-mono text-[11px]">/api/postback/cpagrip</code> listens for completion pings from CPAGrip's conversion servers. When a user finishes an offer, CPAGrip delivers <code className="text-slate-300">tracking_id</code>, <code className="text-slate-300">payout</code>, and <code className="text-slate-300">points</code>, instantaneously crediting your ledger balance and notifying you in real-time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Postback URL</span>
            <span className="text-slate-300 truncate block">/api/postback/cpagrip</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Attribution Parameter</span>
            <span className="text-amber-400 font-bold block">&tracking_id={effectiveUserId}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Reward Conversion</span>
            <span className="text-emerald-400 font-bold block">100 Pts = $1.00 USD</span>
          </div>
        </div>
      </div>

      {/* Offer Details Modal */}
      {selectedOfferForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedOfferForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                {selectedOfferForModal.offerphoto ? (
                  <img
                    src={selectedOfferForModal.offerphoto}
                    alt={selectedOfferForModal.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Download className="w-6 h-6 text-rose-400" />
                )}
              </div>

              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950 border border-rose-800 text-rose-400">
                    {selectedOfferForModal.category || 'Direct Task'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    ID #{selectedOfferForModal.offer_id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    Geo: {selectedOfferForModal.accepted_countries || 'Global'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk'] leading-snug">
                  {selectedOfferForModal.title}
                </h3>
              </div>
            </div>

            {/* Reward Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Attributed Reward
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    +${parseFloat(selectedOfferForModal.payout || '0').toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    ({Math.round(parseFloat(selectedOfferForModal.payout || '0') * 100)} points)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Ledger Destination
                </p>
                <span className="text-xs font-bold text-white">Available Balance</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completion Checklist
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <p>
                    Click <strong className="text-white">"Launch Campaign Now"</strong> to visit the sponsor link with your tracking token attached.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <p>
                    Requirement: <span className="text-white font-medium">{selectedOfferForModal.description}</span>
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <p>
                    Keep the confirmation tab open for 30–60 seconds while CPAGrip's webhook dispatches verification to your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Link Preview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Attribution Tracking Link
              </p>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {selectedOfferForModal.offerlink}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={selectedOfferForModal.offerlink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedOfferForModal(null)}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-600/25"
              >
                <span>Launch Campaign Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setSelectedOfferForModal(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CpagripOffersSection;
