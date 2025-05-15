// Export all game logic modules
export * from './growth';
export * from './theft';
export * from './economy';

// Main game constants
export const GAME_CONSTANTS = {
  // Grid constants
  INITIAL_WIDTH: 6,
  INITIAL_HEIGHT: 15,
  MAX_WIDTH: 10, 
  MAX_HEIGHT: 15,
  
  // Growth constants
  WATERING_BOOST_PERCENT: 10,
  FERTILIZER_BOOST_PERCENT: 50,
  WEED_PENALTY_PERCENT: 20,
  PEST_PENALTY_PERCENT: 30,
  
  // Social constants
  FRIENDS_FOR_BONUS: 2,
  BONUS_MULTIPLIER: 2,
  BONUS_DURATION_DAYS: 3,
  FRIENDS_PER_EXPANDED_ROW: 5,
  
  // Theft constants
  MAX_THEFT_PERCENT: 35,
  THEFT_COOLDOWN_HOURS: 3,
  DOG_PROTECTION_PERCENT: 75,
  DOG_DAMAGE_AMOUNT: 50,
  
  // Economy constants
  STAR_USD_RATE: 0.013,
  PLATFORM_FEE_PERCENT: 22,
  
  // XP and levels
  BASE_LEVEL_XP: 100,
  LEVEL_EXPONENT: 1.5
};

// Helper functions
export function calculateTimeLeft(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Ready';
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} h ${minutes} m`;
  } else {
    return `${minutes} m`;
  }
}

export function isWithinTimespan(timestamp: Date, hoursAgo: number): boolean {
  const now = new Date();
  const limitMs = hoursAgo * 60 * 60 * 1000;
  return (now.getTime() - timestamp.getTime()) <= limitMs;
}
