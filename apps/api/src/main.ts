import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  
  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Apply security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "telegram.org", "t.me"],
        connectSrc: ["'self'", "telegram.org", "t.me"],
        imgSrc: ["'self'", "data:", "telegram.org", "t.me"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));
  
  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  
  // Start the server
  await app.listen(port);
  console.log(`API server running on port ${port}`);
}

bootstrap();
