import { z } from 'zod';
import { MemberRole, PlotStage } from 'db';

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  tgId: z.string(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  level: z.number().int().min(1),
  xp: z.number().int().min(0),
  coins: z.number().int().min(0),
  stars: z.number().int().min(0),
  referrerId: z.string().nullable(),
  createdAt: z.date()
});

export type User = z.infer<typeof userSchema>;

// Garden schemas
export const gardenSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  ownerId: z.string().uuid(),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
  hasDog: z.boolean(),
  dogFedAt: z.date().nullable(),
  createdAt: z.date()
});

export type Garden = z.infer<typeof gardenSchema>;

// GardenMember schemas
export const gardenMemberSchema = z.object({
  userId: z.string().uuid(),
  gardenId: z.string().uuid(),
  role: z.enum([MemberRole.OWNER, MemberRole.MEMBER]),
  joinedAt: z.date()
});

export type GardenMember = z.infer<typeof gardenMemberSchema>;

// Plot schemas
export const plotSchema = z.object({
  id: z.string().uuid(),
  gardenId: z.string().uuid(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  plantId: z.string().nullable(),
  stage: z.enum([
    PlotStage.EMPTY,
    PlotStage.SEED,
    PlotStage.SPROUT,
    PlotStage.MATURE,
    PlotStage.HARVEST
  ]),
  plantedAt: z.date().nullable(),
  lastWateredAt: z.date().nullable(),
  pest: z.boolean(),
  stolePercent: z.number().int().min(0).max(100),
  createdAt: z.date()
});

export type Plot = z.infer<typeof plotSchema>;

// Tree schemas
export const treeSchema = z.object({
  id: z.string().uuid(),
  gardenId: z.string().uuid(),
  treeType: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  plantedAt: z.date(),
  lastHarvestAt: z.date().nullable(),
  expiresAt: z.date(),
});

export type Tree = z.infer<typeof treeSchema>;

// Animal schemas
export const animalSchema = z.object({
  id: z.string().uuid(),
  gardenId: z.string().uuid(),
  animalType: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  fedAt: z.date().nullable(),
  lastCollectAt: z.date().nullable(),
  isPremium: z.boolean(),
  createdAt: z.date()
});

export type Animal = z.infer<typeof animalSchema>;

// Building schemas
export const buildingSchema = z.object({
  id: z.string().uuid(),
  gardenId: z.string().uuid(),
  type: z.string(),
  level: z.number().int().min(1),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  data: z.record(z.any()).nullable(),
  lastUsedAt: z.date().nullable(),
  createdAt: z.date()
});

export type Building = z.infer<typeof buildingSchema>;

// Input schemas for API requests
export const createGardenInput = z.object({
  name: z.string().min(1).max(50)
});

export const joinGardenInput = z.object({
  inviteLink: z.string()
});

export const plantInput = z.object({
  gardenId: z.string().uuid(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  plantId: z.string()
});

export const plotActionInput = z.object({
  plotId: z.string().uuid()
});

export const animalActionInput = z.object({
  animalId: z.string().uuid()
});

export const factoryProduceInput = z.object({
  buildingId: z.string().uuid(),
  recipeId: z.string()
});

export const starPayInput = z.object({
  skuId: z.string(),
  quantity: z.number().int().min(1).default(1)
});

// Response schemas
export const authMeResponse = z.object({
  user: userSchema,
  activeGarden: gardenSchema.nullable(),
  hasInviteBonus: z.boolean(),
  activeBonuses: z.array(z.object({
    id: z.string().uuid(),
    type: z.string(),
    multiplier: z.number(),
    expiresAt: z.date()
  }))
});

export const plotStateResponse = z.object({
  plot: plotSchema,
  timeLeft: z.string().nullable(),
  allowedActions: z.array(z.string())
});

export const invoiceResponse = z.object({
  invoiceUrl: z.string().url(),
  invoiceId: z.string()
});
