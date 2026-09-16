import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Globe,
  Palette,
  Megaphone,
  Code,
  FileText,
  Video,
  Mic,
  Bot,
  Layers,
  ArrowUpRight,
  Star,
  Users,
  Award,
} from 'lucide-react';
import { KWORK_AFFILIATE_URL, openKworkAffiliate } from '../config/affiliateLinks';

interface FreelanceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
  badge: string;
  popularServices: string[];
  description: string;
  startingPrice: string;
  kworkSearchQuery: string;
}

const FREELANCE_CATEGORIES: FreelanceCategory[] = [
  {
    id: 'graphic-design',
    name: 'Graphic & Design',
    icon: Palette,
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30',
    badge: 'High Demand',
    popularServices: ['Logo Design & Branding', 'Website & App UI/UX', 'Social Media Posts & Banners', 'Photoshop & Image Retouching', 'Flyers & Brochures'],
    description: 'Connect with top creative designers for logos, illustrations, brand identity, and complete digital design assets.',
    startingPrice: '$10',
    kworkSearchQuery: 'Graphic Design',
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing & Traffic',
    icon: Megaphone,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30',
    badge: 'Top Converting',
    popularServices: ['SEO Ranking & Backlinks', 'Social Media Management', 'Targeted Web Traffic', 'Google & Meta Ads', 'Influencer Outreach'],
    description: 'Grow your business, rank on Google first page, and scale social media traffic with vetted marketing experts.',
    startingPrice: '$10',
    kworkSearchQuery: 'Digital Marketing',
  },
  {
    id: 'web-development',
    name: 'Web & App Development',
    icon: Code,
    gradient: 'from-indigo-500/20 via-violet-500/10 to-transparent border-indigo-500/30',
    badge: 'Popular',
    popularServices: ['Full Stack Web Apps', 'WordPress & Elementor', 'Shopify E-Commerce', 'React & Next.js Frontend', 'Bug Fixing & Scripts'],
    description: 'Custom programming, full-stack web development, API integrations, and mobile applications crafted by senior developers.',
    startingPrice: '$15',
    kworkSearchQuery: 'Web Development',
  },
  {
    id: 'writing-translation',
    name: 'Writing & Translation',
    icon: FileText,
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30',
    badge: 'Essential',
    popularServices: ['SEO Blog & Article Writing', 'Sales Copywriting', 'Multilingual Translation', 'Website Content & Landing Pages', 'Proofreading & Editing'],
    description: 'High-converting copywriters and verified native translators ready to craft compelling copy in 40+ languages.',
    startingPrice: '$10',
    kworkSearchQuery: 'Writing Translation',
  },
  {
    id: 'video-animation',
    name: 'Video & Animation',
    icon: Video,
    gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent border-purple-500/30',
    badge: 'Trending',
    popularServices: ['YouTube & TikTok Video Editing', 'Animated Explainer Videos', 'Logo Intros & Outros', 'Subtitles & Captions', '2D / 3D Animation'],
    description: 'Engaging video editors and motion graphics artists to create viral short-form clips and broadcast-ready productions.',
    startingPrice: '$15',
    kworkSearchQuery: 'Video Editing',
  },
  {
    id: 'audio-voiceover',
    name: 'Audio & Voiceover',
    icon: Mic,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30',
    badge: 'Verified Talent',
    popularServices: ['Professional Voiceovers', 'Audio Mixing & Mastering', 'Podcast Production', 'Sound Effects & Jingles', 'Voice Clean-up & Noise Removal'],
    description: 'Crystal-clear studio voiceover artists and audio engineers across accents, languages, and commercial styles.',
    startingPrice: '$10',
    kworkSearchQuery: 'Voice Over',
  },
  {
    id: 'ai-automation',
    name: 'AI Services & Automation',
    icon: Bot,
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30',
    badge: 'AI Powered',
    popularServices: ['AI Chatbots & Agents', 'Custom GPT & Prompt Tuning', 'Workflow & Zapier Automation', 'AI Image & Midjourney Art', 'Python Web Scraping'],
    description: 'Supercharge your workflows with custom AI bots, automated data scrapers, and smart business integrations.',
    startingPrice: '$20',
    kworkSearchQuery: 'AI Automation',
  },
  {
    id: 'business-va',
    name: 'Business & Virtual Assistance',
    icon: Layers,
    gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent border-sky-500/30',
    badge: 'Productivity',
    popularServices: ['Dedicated Virtual Assistants', 'Data Entry & Excel Analysis', 'Lead Generation & Prospecting', 'Market & Competitor Research', 'Customer Support Staff'],
    description: 'Reliable virtual assistants and data research specialists to handle administrative tasks and save you hours daily.',
    startingPrice: '$10',
    kworkSearchQuery: 'Virtual Assistant',
  },
];

interface FreelanceMarketplaceViewProps {
  className?: string;
  onNavigate?: (path: string) => void;
  onSelectLocalJob?: (job: any) => void;
  isLoggedIn?: boolean;
}

export const FreelanceMarketplaceView: React.FC<FreelanceMarketplaceViewProps> = ({
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  const filteredCategories = FREELANCE_CATEGORIES.filter((cat) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.popularServices.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      activeCategoryFilter === 'All' || cat.name.toLowerCase().includes(activeCategoryFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const handleOpenKwork = (query?: string) => {
    openKworkAffiliate(query ? `${KWORK_AFFILIATE_URL}` : KWORK_AFFILIATE_URL);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Kwork Official Partner Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Kwork Freelance Marketplace Partner</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
              Hire Top Freelance Talent or Launch Your Gigs
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Access thousands of verified freelancers and fixed-price gigs starting at $10. Enjoy 100% money-back escrow protection, fast 24h turnarounds, and instant order delivery.
            </p>
          </div>

          {/* Quick value trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">100% Escrow Protection</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Verified Freelancers</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Affordable from $10</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Global 24/7 Delivery</span>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="kwork-hero-browse-btn"
              onClick={() => handleOpenKwork()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-indigo-900/40 hover:shadow-indigo-900/60 transition-all transform active:scale-95 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Marketplace on Kwork</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <a
              id="kwork-hero-sell-link"
              href={KWORK_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <span>Become a Seller on Kwork</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search freelance categories or services..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Design', 'Marketing', 'Development', 'Writing', 'Video', 'AI'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategoryFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeCategoryFilter === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Category Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className={`group relative rounded-2xl bg-slate-900/90 border p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${category.gradient}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-['Space_Grotesk'] group-hover:text-indigo-300 transition-colors">
                        {category.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">Starting from {category.startingPrice}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    {category.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {category.description}
                </p>

                {/* Popular Services Tags */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Popular Services:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.popularServices.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Verified Freelancers on Kwork
                </span>
                <a
                  href={KWORK_AFFILIATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/60 transition group-hover:translate-x-0.5"
                >
                  <span>Browse on Kwork</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk']">
            Need Custom Work or Want to Sell Your Services?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Join the Kwork global community. Post a customized buyer request to receive instant competitive proposals, or create your first Kwork gig to start earning.
          </p>
        </div>
        <a
          href={KWORK_AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 shrink-0 transition"
        >
          <span>Open Kwork Marketplace</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
