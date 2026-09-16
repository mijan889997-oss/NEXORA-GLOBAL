import React from 'react';
import { PackageOpen, Sparkles, ArrowRight } from 'lucide-react';
import {
  DIGITAL_PARTNER_MARKETPLACES,
  PartnerMarketplace,
} from '../config/partnerMarketplaces';
import { openExternalLinkSafely } from '../config/affiliateLinks';

export interface DigitalProductsSectionProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

export const DigitalProductsSection: React.FC<DigitalProductsSectionProps> = ({
  className = '',
  onNavigate,
}) => {
  const marketplaces: PartnerMarketplace[] = DIGITAL_PARTNER_MARKETPLACES;

  return (
    <div className={`space-y-6 ${className}`}>
      {marketplaces.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
            <PackageOpen className="w-8 h-8 text-slate-400" />
          </div>

          <div className="max-w-md space-y-1.5">
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              No Products Available
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              There are currently no digital products or marketplace partner listings active in this catalog. Please check back later for upcoming updates.
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/dashboard/earn')}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-indigo-950/40 cursor-pointer"
            >
              <span>Explore Paid Tasks & Offers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {marketplaces.map((partner) => (
            <div
              key={partner.id}
              className={`rounded-3xl bg-gradient-to-b ${partner.themeGradient} border ${partner.accentBorder} p-6 flex flex-col justify-between`}
            >
              <div>
                <h3 className="text-lg font-bold text-white">{partner.name}</h3>
                <p className="text-xs text-slate-300 mt-2">{partner.description}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800">
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openExternalLinkSafely(partner.url);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center"
                >
                  {partner.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DigitalProductsSection;
