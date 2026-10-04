import { join } from 'path';

import { NestFactory } from '@nestjs/core';

import {
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

import { NestExpressApplication } from '@nestjs/platform-express';

import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

import { corsConfig, envs, setupSwagger } from '@modules/config';

import { getClassValidatorErrors } from '@common/helpers';

const logger = new Logger('App');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  /**
   * Use helmet and compression for security and performance.
   */
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  /**
   * Enable CORS with the specified configuration.
   */
  app.enableCors(corsConfig);

  /**
   * Set various application settings.
   */
  app.set('trust proxy', true);
  app.set('query parser', 'extended');

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/resources',
  });

  /**
   * Use global pipes.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors): UnprocessableEntityException => {
        const message = 'Validation failed';
        const errors = getClassValidatorErrors(validationErrors);

        return new UnprocessableEntityException({ message, errors });
      },
    }),
  );

  /**
   * Set the global prefix.
   */
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  setupSwagger(app);

  await app.listen(envs.port);
  logger.log(`Server running on ${await app.getUrl()} 🚀 in ${envs.nodeEnv}`);
}

bootstrap().catch((error) => {
  logger.error('Error during app bootstrap', error);
  process.exit(1);
});
