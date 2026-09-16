/**
 * Official Affiliate & Partner Tracking Links
 * Verified Impact.com / Udemy Integration, Kwork Partner Integration & Freecash Tasks
 */

export const UDEMY_AFFILIATE_URL = 'https://trk.udemy.com/c/7762933/3193860/39854';
export const KWORK_AFFILIATE_URL = 'https://kwork.com/ref/25226052';
export const FREECASH_AFFILIATE_URL = 'https://freecash.com/r/7GHGR';

/**
 * Helper to safely open external links in a new tab without navigating away from the current SPA frame
 */
export const openExternalLinkSafely = (url: string) => {
  if (!url) return;
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Safely opens the official approved Udemy affiliate tracking link in a new tab
 */
export const openUdemyAffiliate = (customUrl?: string) => {
  openExternalLinkSafely(customUrl || UDEMY_AFFILIATE_URL);
};

/**
 * Safely opens the official Kwork affiliate partner link in a new tab
 */
export const openKworkAffiliate = (customUrl?: string) => {
  openExternalLinkSafely(customUrl || KWORK_AFFILIATE_URL);
};

/**
 * Safely opens the official Freecash partner link for verified paid tasks in a new tab
 */
export const openFreecashAffiliate = (customUrl?: string) => {
  openExternalLinkSafely(customUrl || FREECASH_AFFILIATE_URL);
};
