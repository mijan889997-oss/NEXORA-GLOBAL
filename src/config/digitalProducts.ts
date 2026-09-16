/**
 * Digital Products & Templates Configuration
 * Pre-configured data structure for Envato Elements / ThemeForest / CodeCanyon Affiliate Integration via Impact.com
 */

export type DigitalProductCategory =
  | 'WordPress & Web Themes'
  | 'Code Scripts & Plugins'
  | 'UI Kits & Design Assets'
  | 'Video & Motion Graphics'
  | 'Marketing & SEO SOPs'
  | 'Mobile App Templates';

export interface DigitalProductItem {
  id: string;
  name: string;
  title: string;
  description: string;
  category: DigitalProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  fileSizeMb?: number;
  imageUrl: string;
  badge?: string;
  tags: string[];
  features: string[];
  affiliateTrackingUrl: string;
  livePreviewUrl?: string;
}

export type ConfigDigitalProduct = DigitalProductItem;

// Default placeholder affiliate URL while awaiting exact approval link from Impact
export const DEFAULT_ENVATO_AFFILIATE_URL = 'https://elements.envato.com';

export const DIGITAL_PRODUCTS_CATALOG: DigitalProductItem[] = [
  {
    id: 'prod-saas-starter-kit',
    name: 'SaaSify — Next.js & Tailwind SaaS Boilerplate',
    title: 'SaaSify — Next.js & Tailwind SaaS Boilerplate',
    description: 'Production-ready full-stack SaaS boilerplate with authentication, Stripe subscriptions, user dashboards, and responsive dark theme.',
    category: 'Code Scripts & Plugins',
    price: 49.00,
    originalPrice: 89.00,
    rating: 4.9,
    reviewsCount: 142,
    salesCount: 1250,
    fileSizeMb: 14.5,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    badge: 'BESTSELLER',
    tags: ['Next.js 14', 'Tailwind CSS', 'TypeScript', 'Stripe'],
    features: [
      'Multi-tenant database schema',
      'Pre-built authentication & OAuth',
      'Stripe customer portal & webhooks',
      'Admin analytics dashboard'
    ],
    affiliateTrackingUrl: DEFAULT_ENVATO_AFFILIATE_URL,
    livePreviewUrl: 'https://elements.envato.com'
  },
  {
    id: 'prod-agency-wp-theme',
    name: 'OmniAgency — High-Converting Digital Marketing Theme',
    title: 'OmniAgency — High-Converting Digital Marketing Theme',
    description: 'Ultra-fast, Elementor & Gutenberg compatible WordPress theme crafted specifically for SEO agencies, digital marketers, and freelancers.',
    category: 'WordPress & Web Themes',
    price: 39.00,
    originalPrice: 69.00,
    rating: 4.8,
    reviewsCount: 218,
    salesCount: 2340,
    fileSizeMb: 42.0,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    badge: 'POPULAR',
    tags: ['WordPress', 'Elementor', 'SEO Optimized', 'WooCommerce'],
    features: [
      '30+ Pre-built demo templates',
      '99/100 Google PageSpeed score',
      'One-click demo import',
      'Lifetime automated updates'
    ],
    affiliateTrackingUrl: DEFAULT_ENVATO_AFFILIATE_URL,
    livePreviewUrl: 'https://elements.envato.com'
  },
  {
    id: 'prod-fintech-figma-ui',
    name: 'ApexUI — Fintech & Crypto App UI/UX Kit',
    title: 'ApexUI — Fintech & Crypto App UI/UX Kit',
    description: 'Over 240+ responsive mobile screens and component design system in Figma. Includes charts, crypto wallets, payment flows, and style tokens.',
    category: 'UI Kits & Design Assets',
    price: 29.00,
    originalPrice: 55.00,
    rating: 5.0,
    reviewsCount: 87,
    salesCount: 890,
    fileSizeMb: 128.0,
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    badge: 'TRENDING',
    tags: ['Figma', 'Design System', 'Auto-Layout', 'Dark & Light'],
    features: [
      '240+ Handcrafted mobile screens',
      'Full auto-layout 5.0 support',
      'Comprehensive design token variables',
      'Interactive prototyping animations'
    ],
    affiliateTrackingUrl: DEFAULT_ENVATO_AFFILIATE_URL,
    livePreviewUrl: 'https://elements.envato.com'
  },
  {
    id: 'prod-seo-sops-bundle',
    name: 'SEO Mastery Vault & Technical Audit SOPs',
    title: 'SEO Mastery Vault & Technical Audit SOPs',
    description: 'Complete operating procedures, client audit spreadsheets, schema generators, and backlink prospecting workflows used by top agencies.',
    category: 'Marketing & SEO SOPs',
    price: 19.00,
    originalPrice: 49.00,
    rating: 4.9,
    reviewsCount: 310,
    salesCount: 3420,
    fileSizeMb: 8.2,
    imageUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&auto=format&fit=crop&q=80',
    badge: 'MUST HAVE',
    tags: ['SEO', 'Notion Templates', 'Google Sheets', 'Agency SOPs'],
    features: [
      '75-Point Technical SEO checklist',
      'Competitor backlink gap analyzer',
      'Client onboarding presentation decks',
      'Monthly reporting automated sheet'
    ],
    affiliateTrackingUrl: DEFAULT_ENVATO_AFFILIATE_URL,
    livePreviewUrl: 'https://elements.envato.com'
  },
  {
    id: 'prod-motion-video-pack',
    name: 'CyberFlow — 3D Cyberpunk & Tech Motion Graphics Pack',
    title: 'CyberFlow — 3D Cyberpunk & Tech Motion Graphics Pack',
    description: '120+ 4K motion graphics overlays, glowing HUD elements, sound effects, and transitions for YouTube creators and advertising agencies.',
    category: 'Video & Motion Graphics',
    price: 34.00,
    originalPrice: 75.00,
    rating: 4.8,
    reviewsCount: 95,
    salesCount: 760,
    fileSizeMb: 850.0,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    badge: '4K ASSETS',
    tags: ['After Effects', 'Premiere Pro', '4K Resolution', 'Alpha Channel'],
    features: [
      '120+ Alpha channel tech overlays',
      'Drag-and-drop Premiere .mogrt files',
      'Custom glitch & sci-fi SFX included',
      'Commercial broadcast licensing'
    ],
    affiliateTrackingUrl: DEFAULT_ENVATO_AFFILIATE_URL,
    livePreviewUrl: 'https://elements.envato.com'
  },
  {
    id: 'prod-flutter-ecommerce-app',
    name: 'ShopZen — Flutter Multi-Vendor eCommerce Mobile App',
    title: 'ShopZen — Flutter Multi-Vendor eCommerce Mobile App',
    description: 'Complete cross-platform iOS & Android mobile application with Node.js backend, real-time tracking, push notifications, and payment gateways.',
    category: 'Mobile App Templates',
    price: 59.00,
    originalPrice: 119.00,
    rating: 4.9,
    reviewsCount: 164,
    salesCount: 1410,
    fileSizeMb: 35.0,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80',
    badge: 'CROSS-PLATFORM',
    tags: ['Flutter 3', 'iOS & Android', 'Firebase', 'Payment APIs'],
    features: [
      '100% Single codebase for iOS & Android',
      'Integrated Stripe & PayPal gateways',
      'Live order tracking with maps',
      'Admin control web panel included'
    ],
    affiliateTrackingUrl: DEFAULT_ENVATO_AFFILIATE_URL,
    livePreviewUrl: 'https://elements.envato.com'
  }
];

/**
 * Safely routes the user to the designated affiliate tracking link
 */
export const openProductAffiliate = (product: DigitalProductItem | { affiliateTrackingUrl?: string; targetUrl?: string }) => {
  const targetUrl = product.affiliateTrackingUrl || (product as any).targetUrl || DEFAULT_ENVATO_AFFILIATE_URL;
  try {
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = targetUrl;
    }
  } catch (e) {
    console.warn('Popup blocked, navigating directly:', e);
    window.location.href = targetUrl;
  }
};
