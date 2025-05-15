import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { TrpcService } from './trpc.service';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

@Controller('trpc')
export class TrpcController {
  constructor(private readonly trpcService: TrpcService) {}

  @All('*')
  async handleTrpc(@Req() req: Request, @Res() res: Response) {
    const router = this.trpcService.getRouter();
    const createContext = this.trpcService.getCreateContext();

    return createExpressMiddleware({
      router,
      createContext,
      onError({ error }) {
        console.error('tRPC error:', error);
        
        if (error.code === 'UNAUTHORIZED') {
          res.status(401);
          return;
        }
        
        if (error.code === 'NOT_FOUND') {
          res.status(404);
          return;
        }
      },
    })(req, res);
  }
}
