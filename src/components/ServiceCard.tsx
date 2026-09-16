import React, { useState } from 'react';
import {
  Scissors,
  Image as ImageIcon,
  ExternalLink,
  Star,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Check,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import type { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  navigate?: (path: string) => void;
  onInternalOrder?: (service: Service) => void;
  featured?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  navigate,
  onInternalOrder,
  featured = false,
}) => {
  const [selectedPreviewMode, setSelectedPreviewMode] = useState<'transparent' | 'white' | 'original'>('transparent');
  const [activePackageTab, setActivePackageTab] = useState<'basic' | 'standard' | 'bulk'>('basic');

  const isPhotoEditing =
    service.title.toLowerCase().includes('background removal') ||
    service.title.toLowerCase().includes('photo editing') ||
    service.id === 'srv_photo_001';

  const fiverrUrl = service.fiverrUrl || 'https://www.fiverr.com/mdmijan4';

  const packages = {
    basic: {
      name: 'Basic Starter',
      qty: '10 Images',
      price: service.pricingTier?.basicPrice || 5.0,
      delivery: '24 Hours',
      features: [
        'Transparent PNG & White Background (#FFFFFF)',
        'Hand-drawn pen tool clipping path',
        'Amazon, eBay & Shopify compliance',
        'High-resolution 300 DPI web export',
      ],
    },
    standard: {
      name: 'Standard Catalog',
      qty: '50 Images',
      price: 20.0,
      delivery: '2 Days',
      features: [
        'Everything in Basic',
        'Natural & Drop Shadow creation',
        'Color correction & blemish cleanup',
        'Multi-format delivery (PNG, JPG, PSD)',
      ],
    },
    bulk: {
      name: 'Bulk E-Commerce Pro',
      qty: '100+ Images',
      price: 35.0,
      delivery: '3 Days',
      features: [
        'Volume batch processing',
        'Complex objects (jewelry, cycles, hair masking)',
        'Reflection & 3D shadow effects',
        'Dedicated VIP revision support',
      ],
    },
  };

  return (
    <div
      className={`group relative rounded-3xl bg-slate-900 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
        featured || isPhotoEditing
          ? 'border-emerald-500/40 hover:border-emerald-500/80 ring-1 ring-emerald-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Banner / Header */}
      <div className="p-6 space-y-4">
        {/* Category & Rating Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {service.category}
            </span>
            {isPhotoEditing && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/70">
                E-Commerce Ready
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{service.rating || 5.0}</span>
            <span className="text-slate-500 text-[10px]">({service.reviewsCount || 148} reviews)</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk'] leading-snug group-hover:text-emerald-300 transition-colors">
            {service.title}
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* E-Commerce Core Features Grid */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              Core E-Commerce Features Included:
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">100% Marketplace Compliant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Feature 1: Transparent PNG */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Transparent PNG</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Alpha channel cutouts ready for any website banner, poster or catalog.
              </p>
            </div>

            {/* Feature 2: Pure White Background */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>White Background</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Pure #FFFFFF RGB background mandated by Amazon, eBay, Google & Shopify.
              </p>
            </div>

            {/* Feature 3: Clipping Path */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between space-y-1">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
                <Scissors className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Clipping Path</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                100% hand-drawn vector pen tool path for razor-sharp, natural edges.
              </p>
            </div>
          </div>

          {/* Additional Features Checklist */}
          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Bulk photo editing & volume batching</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Drop, reflection & natural shadow creation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Amazon / Shopify / Etsy dimension formatting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>High-res 300 DPI web-optimized delivery</span>
            </div>
          </div>
        </div>

        {/* Visual Preview / Demonstration Simulator */}
        {isPhotoEditing && (
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                Interactive Output Preview:
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPreviewMode('transparent')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded cursor-pointer transition ${
                    selectedPreviewMode === 'transparent'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Transparent PNG
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewMode('white')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded cursor-pointer transition ${
                    selectedPreviewMode === 'white'
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pure White #FFF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewMode('original')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded cursor-pointer transition ${
                    selectedPreviewMode === 'original'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Original Background
                </button>
              </div>
            </div>

            {/* Visual Canvas Demo Container */}
            <div className="relative h-32 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none">
              {/* Background styling based on mode */}
              {selectedPreviewMode === 'transparent' && (
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #334155 25%, transparent 25%), 
                      linear-gradient(-45deg, #334155 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #334155 75%), 
                      linear-gradient(-45deg, transparent 75%, #334155 75%)
                    `,
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    backgroundColor: '#1e293b',
                  }}
                />
              )}
              {selectedPreviewMode === 'white' && (
                <div className="absolute inset-0 bg-white" />
              )}
              {selectedPreviewMode === 'original' && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-slate-800 to-indigo-950" />
              )}

              {/* Product mock illustration */}
              <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center">
                <div
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    selectedPreviewMode === 'white'
                      ? 'bg-white text-slate-900 shadow-2xl drop-shadow-lg'
                      : 'bg-slate-900/90 text-white shadow-xl backdrop-blur-sm'
                  }`}
                >
                  <ShoppingBag className="w-8 h-8 text-emerald-500 mx-auto" />
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      selectedPreviewMode === 'white'
                        ? 'bg-slate-900 text-emerald-400'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {selectedPreviewMode === 'transparent' && '✓ Transparent Alpha Cutout Isolated'}
                    {selectedPreviewMode === 'white' && '✓ Pure #FFFFFF Amazon/Shopify Standard'}
                    {selectedPreviewMode === 'original' && '⚠ Original Raw Studio Background'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tiers & Packages Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Package Tier:
            </span>
            <div className="flex items-center gap-1">
              {(['basic', 'standard', 'bulk'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setActivePackageTab(tier)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                    activePackageTab === tier
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {packages[tier].name.split(' ')[0]} (${packages[tier].price})
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white text-sm">
                {packages[activePackageTab].name} ({packages[activePackageTab].qty})
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Delivery: {packages[activePackageTab].delivery}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Unlimited Revisions</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Fiverr Gig Price</span>
              <span className="text-xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
                ${packages[activePackageTab].price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {service.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer & Order on Fiverr CTA */}
      <div className="p-6 bg-slate-950/80 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Seller Info */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm shadow-inner">
            MR
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">{service.sellerName || 'Mijanur Rahman (mdmijan4)'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400">
              Verified Fiverr Level 2 Pro Seller • 100% Satisfaction
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Primary Call to Action: Order on Fiverr Button */}
          <a
            id="btn-order-on-fiverr"
            href={fiverrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Order directly on Fiverr with buyer protection"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Order on Fiverr</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Secondary In-App Order / Contact */}
          {onInternalOrder && (
            <button
              type="button"
              onClick={() => onInternalOrder(service)}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              Order with Wallet Escrow
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
