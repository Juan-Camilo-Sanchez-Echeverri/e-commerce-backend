import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

import * as compression from 'compression';
import * as express from 'express';

import { AppModule } from './app.module';
import { envs } from '@modules/config/envs';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    abortOnError: true,
    cors: true,
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

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
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(envs.port);
  logger.log(`Server running on http://localhost:${envs.port}`);
}

bootstrap().catch((error) => {
  console.error('Error server:', error);
});
