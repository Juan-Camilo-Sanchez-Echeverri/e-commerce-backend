import { join } from 'path';

import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { envs } from '@modules/config/envs';

const logger = new Logger('App');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    abortOnError: true,
    cors: true,
  });

  app.set('trust proxy', true);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/resources',
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  app.use(compression());
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(envs.port);
  logger.log(`Server running on ${await app.getUrl()} 🚀 in ${envs.nodeEnv}`);
}

bootstrap().catch((error) => {
  console.error('Error server:', error);
});
