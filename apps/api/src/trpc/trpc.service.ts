import { Injectable } from '@nestjs/common';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { AuthService } from '../auth/auth.service';
import { GardenService } from '../garden/garden.service';
import { PlotService } from '../plot/plot.service';
import { AnimalService } from '../animal/animal.service';
import { FactoryService } from '../factory/factory.service';
import { StarService } from '../star/star.service';
import { AdminService } from '../admin/admin.service';

// Define context type for tRPC
export interface Context {
  user: {
    id: string;
    tgId: string;
  } | null;
}

@Injectable()
export class TrpcService {
  router: any;
  createContext: any;

  constructor(
    private readonly authService: AuthService,
    private readonly gardenService: GardenService,
    private readonly plotService: PlotService,
    private readonly animalService: AnimalService,
    private readonly factoryService: FactoryService,
    private readonly starService: StarService,
    private readonly adminService: AdminService,
  ) {
    this.initialize();
  }

  private initialize() {
    // Create a tRPC instance
    const t = initTRPC.context<Context>().create({
      transformer: superjson,
    });

    // Define middleware for protected routes
    const isAuthed = t.middleware(({ ctx, next }) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    });

    // Define procedures
    const publicProcedure = t.procedure;
    const protectedProcedure = t.procedure.use(isAuthed);

    // Define router
    this.router = t.router;

    // Auth router
    const authRouter = this.router({
      me: protectedProcedure.query(({ ctx }) => {
        return this.authService.getCurrentUser(ctx.user.id);
      }),
    });

    // Garden router
    const gardenRouter = this.router({
      create: protectedProcedure
        .input((val: unknown) => {
          // Validation would be performed by zod in shared-types
          return val as any;
        })
        .mutation(({ ctx, input }) => {
          return this.gardenService.createGarden(ctx.user.id, input);
        }),

      join: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.gardenService.joinGarden(ctx.user.id, input);
        }),

      getById: protectedProcedure
        .input((val: unknown) => val as any)
        .query(({ ctx, input }) => {
          return this.gardenService.getGardenById(ctx.user.id, input.gardenId);
        }),
    });

    // Plot router
    const plotRouter = this.router({
      plant: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.plotService.plant(ctx.user.id, input);
        }),

      water: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.plotService.water(ctx.user.id, input);
        }),

      steal: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.plotService.steal(ctx.user.id, input);
        }),

      harvest: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.plotService.harvest(ctx.user.id, input);
        }),

      removeWeed: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.plotService.removeWeed(ctx.user.id, input);
        }),
    });

    // Animal router
    const animalRouter = this.router({
      feed: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.animalService.feed(ctx.user.id, input);
        }),

      collect: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.animalService.collect(ctx.user.id, input);
        }),
    });

    // Factory router
    const factoryRouter = this.router({
      produce: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.factoryService.produce(ctx.user.id, input);
        }),
    });

    // Star router
    const starRouter = this.router({
      pay: protectedProcedure
        .input((val: unknown) => val as any)
        .mutation(({ ctx, input }) => {
          return this.starService.pay(ctx.user.id, input);
        }),

      getBalance: protectedProcedure.query(({ ctx }) => {
        return this.starService.getBalance(ctx.user.id);
      }),
    });

    // Admin router
    const adminRouter = this.router({
      withdrawStars: protectedProcedure.mutation(({ ctx }) => {
        return this.adminService.withdrawStars(ctx.user.id);
      }),
    });

    // App router
    this.router = t.router({
      auth: authRouter,
      garden: gardenRouter,
      plot: plotRouter,
      animal: animalRouter,
      factory: factoryRouter,
      star: starRouter,
      admin: adminRouter,
    });

    // Context factory
    this.createContext = async (opts: { req: any; res: any }) => {
      const user = await this.authService.validateTelegramUser(
        opts.req.headers['x-telegram-app-id']
      );

      return {
        user,
      };
    };
  }

  // Return the tRPC router
  getRouter() {
    return this.router;
  }

  // Return the context factory
  getCreateContext() {
    return this.createContext;
  }
}
