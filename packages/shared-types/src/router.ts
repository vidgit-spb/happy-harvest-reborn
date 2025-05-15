import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import {
  userSchema,
  gardenSchema,
  plotSchema,
  animalSchema,
  treeSchema,
  buildingSchema,
  createGardenInput,
  joinGardenInput,
  plantInput,
  plotActionInput,
  animalActionInput,
  factoryProduceInput,
  starPayInput,
  authMeResponse,
  plotStateResponse,
  invoiceResponse,
} from './schemas';

// Define context type that will be passed to all procedures
export interface Context {
  user: {
    id: string;
    tgId: string;
  } | null;
}

// Create a new tRPC instance
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('UNAUTHORIZED');
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Auth router
export const authRouter = router({
  me: protectedProcedure
    .output(authMeResponse)
    .query(({ ctx }) => {
      // Implementation in API layer
      return { user: {} as any, activeGarden: null, hasInviteBonus: false, activeBonuses: [] };
    }),
});

// Garden router
export const gardenRouter = router({
  create: protectedProcedure
    .input(createGardenInput)
    .output(z.object({ gardenId: z.string() }))
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { gardenId: '' };
    }),
    
  join: protectedProcedure
    .input(joinGardenInput)
    .output(z.object({ success: z.boolean(), gardenId: z.string() }))
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { success: true, gardenId: '' };
    }),
    
  getById: protectedProcedure
    .input(z.object({ gardenId: z.string() }))
    .output(z.object({ 
      garden: gardenSchema,
      plots: z.array(plotSchema),
      trees: z.array(treeSchema),
      animals: z.array(animalSchema),
      buildings: z.array(buildingSchema)
    }))
    .query(({ ctx, input }) => {
      // Implementation in API layer
      return { garden: {} as any, plots: [], trees: [], animals: [], buildings: [] };
    }),
});

// Plot router
export const plotRouter = router({
  plant: protectedProcedure
    .input(plantInput)
    .output(plotStateResponse)
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { plot: {} as any, timeLeft: null, allowedActions: [] };
    }),
    
  water: protectedProcedure
    .input(plotActionInput)
    .output(plotStateResponse)
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { plot: {} as any, timeLeft: null, allowedActions: [] };
    }),
    
  steal: protectedProcedure
    .input(plotActionInput)
    .output(z.object({ 
      success: z.boolean(), 
      stolenValue: z.number(),
      damage: z.number(),
      message: z.string()
    }))
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { success: false, stolenValue: 0, damage: 0, message: '' };
    }),

  harvest: protectedProcedure
    .input(plotActionInput)
    .output(z.object({
      success: z.boolean(),
      reward: z.object({
        coins: z.number(),
        xp: z.number()
      })
    }))
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { success: false, reward: { coins: 0, xp: 0 } };
    }),
    
  removeWeed: protectedProcedure
    .input(plotActionInput)
    .output(plotStateResponse)
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { plot: {} as any, timeLeft: null, allowedActions: [] };
    }),
});

// Animal router
export const animalRouter = router({
  feed: protectedProcedure
    .input(animalActionInput)
    .output(z.object({
      success: z.boolean(),
      fedUntil: z.date()
    }))
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { success: false, fedUntil: new Date() };
    }),
    
  collect: protectedProcedure
    .input(animalActionInput)
    .output(z.object({
      success: z.boolean(),
      reward: z.object({
        productId: z.string(),
        quantity: z.number(),
        coins: z.number(),
        xp: z.number()
      })
    }))
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { success: false, reward: { productId: '', quantity: 0, coins: 0, xp: 0 } };
    }),
});

// Factory router
export const factoryRouter = router({
  produce: protectedProcedure
    .input(factoryProduceInput)
    .output(z.object({
      success: z.boolean(),
      reward: z.object({
        productId: z.string(),
        quantity: z.number(),
        coins: z.number(),
        xp: z.number()
      })
    }))
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { success: false, reward: { productId: '', quantity: 0, coins: 0, xp: 0 } };
    }),
});

// Stars API router
export const starRouter = router({
  pay: protectedProcedure
    .input(starPayInput)
    .output(invoiceResponse)
    .mutation(({ ctx, input }) => {
      // Implementation in API layer
      return { invoiceUrl: 'https://t.me', invoiceId: '' };
    }),
    
  getBalance: protectedProcedure
    .output(z.object({
      stars: z.number(),
      usdEquivalent: z.number()
    }))
    .query(({ ctx }) => {
      // Implementation in API layer
      return { stars: 0, usdEquivalent: 0 };
    }),
});

// Admin router (protected by admin check in API implementation)
export const adminRouter = router({
  withdrawStars: protectedProcedure
    .output(z.object({
      success: z.boolean(),
      amount: z.number(),
      message: z.string()
    }))
    .mutation(({ ctx }) => {
      // Implementation in API layer
      return { success: false, amount: 0, message: 'Only admins can withdraw funds' };
    }),
});

// Main app router
export const appRouter = router({
  auth: authRouter,
  garden: gardenRouter,
  plot: plotRouter,
  animal: animalRouter,
  factory: factoryRouter,
  star: starRouter,
  admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
