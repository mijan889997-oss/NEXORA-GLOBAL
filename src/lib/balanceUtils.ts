/**
 * Pure balance & point conversion utilities with ZERO circular dependencies.
 * Ratio: 1,000 Points = $1.00 USD (e.g. 1,001,767 Points = $1,001.77 USD)
 */

export const getStoredUserPoints = (user?: any, wallet?: any): number => {
  try {
    if (typeof window === 'undefined') return 0;

    let highestPoints = 0;

    const p1 = localStorage.getItem('nexvora_user_points');
    if (p1 !== null && !isNaN(parseInt(p1, 10))) {
      highestPoints = Math.max(highestPoints, parseInt(p1, 10));
    }

    const p2 = localStorage.getItem('points');
    if (p2 !== null && !isNaN(parseInt(p2, 10))) {
      highestPoints = Math.max(highestPoints, parseInt(p2, 10));
    }

    const p3 = localStorage.getItem('user_points');
    if (p3 !== null && !isNaN(parseInt(p3, 10))) {
      highestPoints = Math.max(highestPoints, parseInt(p3, 10));
    }

    if (user?.id) {
      const uPoints = localStorage.getItem(`points_${user.id}`);
      if (uPoints !== null && !isNaN(parseInt(uPoints, 10))) {
        highestPoints = Math.max(highestPoints, parseInt(uPoints, 10));
      }
    }

    const b1 = localStorage.getItem('nexvora_wallet_balance') || localStorage.getItem('nexvora_user_balance');
    if (b1 !== null && !isNaN(parseFloat(b1))) {
      highestPoints = Math.max(highestPoints, Math.round(parseFloat(b1) * 1000));
    }

    if (wallet && typeof wallet.availableBalance === 'number' && !isNaN(wallet.availableBalance)) {
      highestPoints = Math.max(highestPoints, Math.round(wallet.availableBalance * 1000));
    }

    if (user && user.points !== undefined && user.points !== null && !isNaN(Number(user.points))) {
      highestPoints = Math.max(highestPoints, Number(user.points));
    }

    const userObj = localStorage.getItem('nexvora_user') || localStorage.getItem('user');
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj);
        if (parsed.points !== undefined && parsed.points !== null && !isNaN(Number(parsed.points))) {
          highestPoints = Math.max(highestPoints, Number(parsed.points));
        }
        if (parsed.balance !== undefined && parsed.balance !== null && !isNaN(Number(parsed.balance))) {
          highestPoints = Math.max(highestPoints, Math.round(Number(parsed.balance) * 1000));
        }
      } catch {
        // ignore parse error
      }
    }

    return highestPoints;
  } catch {
    return 0;
  }
};

export const pointsToUsd = (points: number = 0): number => {
  const safePts = isNaN(points) || points < 0 ? 0 : points;
  return Number((safePts / 1000).toFixed(2));
};

export const usdToPoints = (usd: number = 0): number => {
  const safeUsd = isNaN(usd) || usd < 0 ? 0 : usd;
  return Math.round(safeUsd * 1000);
};

export const formatPoints = (points: number = 0): string => {
  const safePts = isNaN(points) || points < 0 ? 0 : points;
  return safePts.toLocaleString('en-US');
};

export const formatUsd = (usd: number = 0): string => {
  const safeUsd = isNaN(usd) || usd < 0 ? 0 : usd;
  return safeUsd.toFixed(2);
};

export const setGlobalUserBalance = (pointsOrUsd: { points?: number; usd?: number }) => {
  if (typeof window === 'undefined') return;
  try {
    let finalPts = 0;
    if (pointsOrUsd.points !== undefined && !isNaN(pointsOrUsd.points)) {
      finalPts = Math.max(0, Math.round(pointsOrUsd.points));
    } else if (pointsOrUsd.usd !== undefined && !isNaN(pointsOrUsd.usd)) {
      finalPts = Math.max(0, Math.round(pointsOrUsd.usd * 1000));
    }
    const finalUsd = (finalPts / 1000).toFixed(2);
    localStorage.setItem('nexvora_user_points', finalPts.toString());
    localStorage.setItem('points', finalPts.toString());
    localStorage.setItem('user_points', finalPts.toString());
    localStorage.setItem('nexvora_wallet_balance', finalUsd);
    localStorage.setItem('nexvora_user_balance', finalUsd);

    window.dispatchEvent(
      new CustomEvent('pointsUpdated', { detail: { points: finalPts, newBalance: finalUsd } })
    );
    window.dispatchEvent(
      new CustomEvent('balanceUpdated', { detail: { points: finalPts, newBalance: finalUsd } })
    );
  } catch {
    // ignore
  }
};
