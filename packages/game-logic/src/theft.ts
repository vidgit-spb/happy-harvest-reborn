/**
 * Theft mechanics module for Happy Harvest Reborn
 * Handles stealing calculations, dog protection, and related mechanics
 */

export interface TheftParams {
  plotStage: string;
  hasDog: boolean;
  dogFedWithinDay: boolean; // Dog must be fed within 24 hours
  maxTheftPercent: number; // Default: 35%
  plotValue: number; // Value of the plot's produce
  theftProtectionItems: TheftProtectionItem[]; // Additional protection items
}

export interface TheftProtectionItem {
  id: string;
  protectionPercent: number; // 0-100
  damageToThief: number; // Coins to subtract
}

export interface TheftResult {
  success: boolean;
  stolenPercent: number;
  stolenValue: number;
  thiefDamage: number; // Damage applied to thief
  message: string;
}

/**
 * Calculate the results of a theft attempt
 */
export function calculateTheft(params: TheftParams): TheftResult {
  // Cannot steal if not in mature stage
  if (params.plotStage !== 'mature') {
    return {
      success: false,
      stolenPercent: 0,
      stolenValue: 0,
      thiefDamage: 0,
      message: 'cannot_steal_immature'
    };
  }

  // Calculate base theft percent
  let maxTheftPercent = params.maxTheftPercent || 35;
  let thiefDamage = 0;
  
  // Apply dog protection if present and fed
  if (params.hasDog && params.dogFedWithinDay) {
    // Dog reduces max theft by 50% and causes damage
    maxTheftPercent *= 0.5;
    thiefDamage += 50; // Dog bites for 50 coins damage
  }
  
  // Apply additional protection items
  params.theftProtectionItems.forEach(item => {
    maxTheftPercent *= (1 - item.protectionPercent / 100);
    thiefDamage += item.damageToThief;
  });
  
  // Random actual theft percent between 10% and the calculated max
  const actualTheftPercent = Math.min(
    Math.max(10, Math.floor(Math.random() * maxTheftPercent)),
    maxTheftPercent
  );
  
  // Calculate stolen value
  const stolenValue = Math.floor(params.plotValue * (actualTheftPercent / 100));
  
  return {
    success: true,
    stolenPercent: actualTheftPercent,
    stolenValue,
    thiefDamage,
    message: thiefDamage > 0 ? 'theft_with_damage' : 'theft_success'
  };
}

/**
 * Check if a player can attempt theft on a garden
 */
export function canAttemptTheft(lastTheftTimestamp: Date | null): boolean {
  // Limit theft attempts to once every 3 hours per garden
  if (!lastTheftTimestamp) {
    return true;
  }
  
  const now = new Date();
  const hoursSinceLastTheft = (now.getTime() - lastTheftTimestamp.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceLastTheft >= 3;
}
