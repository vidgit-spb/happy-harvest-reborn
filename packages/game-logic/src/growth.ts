/**
 * Growth calculation module for Happy Harvest Reborn
 * Handles plant growth timing, stage transitions and bonuses
 */

import { PlotStage } from 'db';

export interface GrowthParams {
  plantId: string;
  plantedAt: Date;
  lastWateredAt: Date | null;
  growthTime: number; // base growth time in seconds
  multipliers: GrowthMultipliers;
  currentStage?: PlotStage;
}

export interface GrowthMultipliers {
  inviteBonus?: number;     // e.g. 2.0 for 2x speed
  fertilizerBonus?: number; // e.g. 1.5 for 50% faster
  weatherBonus?: number;    // e.g. 1.2 for good weather
  neighborHelp?: number;    // e.g. 1.1 per neighbor help
}

export interface GrowthResult {
  stage: PlotStage;
  progressPercent: number;
  remainingSeconds: number;
  readyAt: Date;
  needsWater: boolean;
}

/**
 * Calculate the current growth stage of a plant
 */
export function calculateGrowthStage(params: GrowthParams): GrowthResult {
  const now = new Date();
  const plantedAt = params.plantedAt;
  const lastWatered = params.lastWateredAt || plantedAt;
  
  // Calculate effective multiplier
  let effectiveMultiplier = 1;
  const { multipliers } = params;
  
  if (multipliers.inviteBonus && multipliers.inviteBonus > 1) {
    effectiveMultiplier *= multipliers.inviteBonus;
  }
  
  if (multipliers.fertilizerBonus && multipliers.fertilizerBonus > 1) {
    effectiveMultiplier *= multipliers.fertilizerBonus;
  }
  
  if (multipliers.weatherBonus && multipliers.weatherBonus > 1) {
    effectiveMultiplier *= multipliers.weatherBonus;
  }
  
  if (multipliers.neighborHelp && multipliers.neighborHelp > 1) {
    effectiveMultiplier *= multipliers.neighborHelp;
  }
  
  // Apply the multiplier to the growth time (faster growth = shorter time)
  const effectiveGrowthTime = params.growthTime / effectiveMultiplier;
  
  // Calculate elapsed time since planting
  const elapsedMs = now.getTime() - plantedAt.getTime();
  const elapsedSeconds = elapsedMs / 1000;
  
  // Calculate remaining time
  const remainingSeconds = Math.max(0, effectiveGrowthTime - elapsedSeconds);
  
  // Calculate when the plant will be ready for harvest
  const readyAt = new Date(plantedAt.getTime() + effectiveGrowthTime * 1000);
  
  // Calculate progress percentage
  const progressPercent = Math.min(100, (elapsedSeconds / effectiveGrowthTime) * 100);
  
  // Check if plant needs water (if it's been more than 8 hours since last watering)
  const needsWater = (now.getTime() - lastWatered.getTime()) > 8 * 60 * 60 * 1000;
  
  // Determine stage based on progress
  let stage: PlotStage;
  
  if (progressPercent >= 100) {
    stage = PlotStage.HARVEST;
  } else if (progressPercent >= 75) {
    stage = PlotStage.MATURE;
  } else if (progressPercent >= 25) {
    stage = PlotStage.SPROUT;
  } else {
    stage = PlotStage.SEED;
  }
  
  return {
    stage,
    progressPercent,
    remainingSeconds,
    readyAt,
    needsWater
  };
}

/**
 * Apply watering effect to a plant
 * Reduces the remaining growth time by a percentage
 */
export function applyWatering(params: GrowthParams): GrowthParams {
  // Watering reduces remaining grow time by 10%
  const waterBoost = 0.1;
  
  // Create a new "plantedAt" that effectively skips ahead in time
  const now = new Date();
  const elapsedMs = now.getTime() - params.plantedAt.getTime();
  const elapsedSeconds = elapsedMs / 1000;
  
  // Calculate how much time to "skip" (10% of remaining time)
  const remainingTime = params.growthTime - elapsedSeconds;
  const timeSkip = remainingTime * waterBoost;
  
  // Create a new plantedAt time that's effectively earlier
  const newPlantedAt = new Date(params.plantedAt.getTime() - (timeSkip * 1000));
  
  return {
    ...params,
    plantedAt: newPlantedAt,
    lastWateredAt: now
  };
}
