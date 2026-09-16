export type DigitalMarketplaceCategory =
  | 'All'
  | 'Web Themes'
  | 'SaaS Tools'
  | 'eBooks'
  | 'Design Assets'
  | 'PLR Bundles';

export interface PartnerMarketplace {
  id: string;
  name: string;
  company: string;
  tagline: string;
  description: string;
  url: string;
  primaryCategory: DigitalMarketplaceCategory;
  categoryTags: string[];
  features: string[];
  stats: {
    catalogSize: string;
    licensing: string;
    updateStatus: string;
  };
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'purple' | 'pink' | 'cyan' | 'indigo';
  themeGradient: string;
  accentBorder: string;
  buttonText: string;
  isFeatured?: boolean;
}

export const DIGITAL_PARTNER_MARKETPLACES: PartnerMarketplace[] = [];
