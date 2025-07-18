import { APP_FILTER } from '@nestjs/core';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AsyncLocalStorageMiddleware } from '@common/middlewares';

import { CommonModule } from '@common/common.module';

import { HttpExceptionFilter } from '@common/filters';

@Module({
  imports: [
    // Módulos comunes globales
    CommonModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AsyncLocalStorageMiddleware)
      .forRoutes({ path: '{*splat}', method: RequestMethod.GET });
  }
}
