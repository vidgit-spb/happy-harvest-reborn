/**
 * Economy calculations module for Happy Harvest Reborn
 * Handles Stars <-> USD conversion, prices, rewards, and bonuses
 */

// Telegram Stars to USD conversion rate
export const STAR_USD_RATE = 0.013; // 1 Star ≈ $0.013

export interface PurchaseParams {
  skuId: string;
  skuPrice: number; // in Stars
  userId: string;
  quantity: number;
}

export interface StarConversion {
  stars: number;
  usd: number;
}

/**
 * Convert Stars to USD
 */
export function starsToUsd(stars: number): number {
  return parseFloat((stars * STAR_USD_RATE).toFixed(2));
}

/**
 * Convert USD to Stars (rounded up to the nearest integer)
 */
export function usdToStars(usd: number): number {
  return Math.ceil(usd / STAR_USD_RATE);
}

/**
 * Calculate the total price for a purchase
 */
export function calculatePurchaseTotal(params: PurchaseParams): StarConversion {
  const totalStars = params.skuPrice * params.quantity;
  const totalUsd = starsToUsd(totalStars);
  
  return {
    stars: totalStars,
    usd: totalUsd
  };
}

/**
 * Calculate level requirements based on XP
 */
export function calculateLevel(xp: number): { level: number; nextLevelXp: number } {
  // Formula: Each level requires 100 * level^1.5 XP
  let level = 1;
  let xpRequired = 100;
  let totalXpForNextLevel = xpRequired;
  
  while (xp >= totalXpForNextLevel) {
    level++;
    xpRequired = Math.floor(100 * Math.pow(level, 1.5));
    totalXpForNextLevel += xpRequired;
  }
  
  const nextLevelXp = totalXpForNextLevel - xp;
  
  return {
    level,
    nextLevelXp
  };
}

/**
 * Calculate daily revenue payout from Stars
 */
export function calculateDailyPayout(transactions: StarConversion[]): StarConversion {
  let totalStars = 0;
  let totalUsd = 0;
  
  transactions.forEach(tx => {
    totalStars += tx.stars;
    totalUsd += tx.usd;
  });
  
  // Apply platform fee (usually 30%, but Telegram takes a smaller cut)
  const platformFeePercent = 0.22; // 22% fee
  const netUsd = totalUsd * (1 - platformFeePercent);
  
  return {
    stars: totalStars,
    usd: parseFloat(netUsd.toFixed(2))
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: 'stars' | 'usd' | 'coins'): string {
  if (currency === 'usd') {
    return `$${amount.toFixed(2)}`;
  } else if (currency === 'stars') {
    return `⭐ ${amount}`;
  } else {
    return `🪙 ${amount}`;
  }
}
