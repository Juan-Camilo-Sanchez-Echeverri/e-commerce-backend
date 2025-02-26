import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

import * as compression from 'compression';

import { AppModule } from './app.module';
import { envs } from '@modules/config/envs';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    abortOnError: false,
    cors: true,
  });

  const logger = new Logger('APP');

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(envs.port);
  logger.log(`Server running on http://localhost:${envs.port}`);
}

bootstrap();
