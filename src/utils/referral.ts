/**
 * NEXVORA GLOBAL - Referral Link & Production URL Resolution Utilities
 * 
 * Generates dynamic referral links adhering to platform security and production routing rules.
 * Automatically resolves the current production domain and avoids development localhost URLs.
 */

/**
 * Resolves the legitimate production domain / APP_URL dynamically.
 * Priority:
 * 1. Server-provided production URL from verified request context
 * 2. Current production origin in browser (excluding localhost / 127.0.0.1)
 * 3. Configured environment variable VITE_APP_URL
 * 4. Production domain fallback: 'https://nexvora.global'
 */
export function getProductionAppUrl(serverProvidedUrl?: string): string {
  if (serverProvidedUrl && typeof serverProvidedUrl === 'string') {
    const trimmed = serverProvidedUrl.trim().replace(/\/$/, '');
    if (trimmed.startsWith('http') && !trimmed.includes('localhost') && !trimmed.includes('127.0.0.1')) {
      return trimmed;
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.trim().replace(/\/$/, '');
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    if (!isLocalhost && origin.startsWith('http')) {
      return origin;
    }
  }

  const envAppUrl = (import.meta as any).env?.VITE_APP_URL;
  if (typeof envAppUrl === 'string' && envAppUrl.trim()) {
    const cleanEnv = envAppUrl.trim().replace(/\/$/, '');
    if (!cleanEnv.includes('localhost') && !cleanEnv.includes('127.0.0.1')) {
      return cleanEnv;
    }
  }

  return 'https://nexvora.global';
}

/**
 * Dynamically generates a production referral URL for an authenticated user's code.
 * Format: APP_URL/register?ref={userReferralCode}
 */
export function generateReferralLink(referralCode?: string, serverProvidedUrl?: string): string {
  if (!referralCode || !referralCode.trim()) {
    return '';
  }
  const baseUrl = getProductionAppUrl(serverProvidedUrl);
  return `${baseUrl}/register?ref=${encodeURIComponent(referralCode.trim().toUpperCase())}`;
}

/**
 * Standard professional invitation message for native sharing and social media.
 */
export const REFERRAL_SHARE_MESSAGE = 'Join NEXVORA GLOBAL and explore opportunities to Learn • Work • Grow • Earn.';
