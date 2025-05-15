// Export all schemas and router types
export * from './schemas';
export * from './router';

// Export socket.io event types for real-time updates
export enum SocketEvents {
  GARDEN_UPDATE = 'garden:update',
  PLOT_UPDATE = 'plot:update',
  ANIMAL_UPDATE = 'animal:update',
  TREE_UPDATE = 'tree:update',
  BUILDING_UPDATE = 'building:update',
  THEFT_ATTEMPT = 'theft:attempt',
  FRIEND_ACTIVITY = 'friend:activity',
  LEVEL_UP = 'level:up',
  STAR_TRANSACTION = 'star:transaction',
  QUEST_UPDATE = 'quest:update',
}

export interface GardenUpdatePayload {
  gardenId: string;
  updateType: 'full' | 'partial';
  data: Record<string, any>;
}

export interface PlotUpdatePayload {
  plotId: string;
  changes: {
    stage?: string;
    lastWateredAt?: Date;
    pest?: boolean;
    stolePercent?: number;
  };
  timeLeft?: string | null;
}

export interface AnimalUpdatePayload {
  animalId: string;
  changes: {
    fedAt?: Date;
    lastCollectAt?: Date;
  };
}

export interface TheftAttemptPayload {
  plotId: string;
  thiefId: string;
  thiefName: string;
  stolenPercent: number;
  damage?: number;
}

export interface FriendActivityPayload {
  userId: string;
  username: string;
  activityType: 'water' | 'removeWeed' | 'steal' | 'visit';
  gardenId: string;
  plotId?: string;
}

export interface LevelUpPayload {
  userId: string;
  newLevel: number;
  rewards?: {
    coins?: number;
    unlocks?: string[];
  };
}

export interface StarTransactionPayload {
  transactionId: string;
  stars: number;
  type: 'purchase' | 'refund' | 'payout' | 'gift';
  success: boolean;
}

export interface QuestUpdatePayload {
  questId: string;
  progress: number;
  completed: boolean;
  rewards?: {
    coins: number;
    xp: number;
    items?: Array<{
      id: string;
      quantity: number;
    }>;
  };
}
