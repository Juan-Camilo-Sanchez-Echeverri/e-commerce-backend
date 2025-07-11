import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { AsyncLocalStorageMiddleware } from '@common/middlewares';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    // Módulos comunes globales
    CommonModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AsyncLocalStorageMiddleware)
      .forRoutes({ path: '{*splat}', method: RequestMethod.GET });
  }
}
