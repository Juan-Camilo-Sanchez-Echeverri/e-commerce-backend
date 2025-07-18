import { NestFactory } from '@nestjs/core';

import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

import { getClassValidatorErrors } from '@common/helpers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Use global pipes.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors) => {
        const message = 'Validation failed';
        const errors = getClassValidatorErrors(validationErrors);

        return new UnprocessableEntityException({ message, errors });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
