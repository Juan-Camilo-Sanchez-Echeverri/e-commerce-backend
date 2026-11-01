import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { CommonModule } from '@common/common.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { RolesGuard } from '@common/guards/roles.guard';
import { ResponseInterceptor } from '@common/interceptors';
import {
  AsyncLocalStorageMiddleware,
  LoggerMiddleware,
} from '@common/middlewares';
import { ParseMongoIdPipe } from '@common/pipes';

import { AuthGuard } from '@modules/auth/guards';
import { AuthModule } from '@modules/auth/auth.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { CitiesModule } from '@modules/cities/cities.module';
import { MongooseConfigService } from '@modules/config';
import { CouponsModule } from '@modules/coupons/coupons.module';
import { EmailMarketingModule } from '@modules/email-marketing/email-marketing.module';
import { EmailRequestModule } from '@modules/email-request/email-request.module';
import { EncoderModule } from '@modules/encoder/encoder.module';
import { FavoritesModule } from '@modules/favorites/favorites.module';
import { LogModule } from '@modules/log/log.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { OffersModule } from '@modules/offers/offers.module';
import { OrdersModule } from '@modules/orders/orders.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { ProductsModule } from '@modules/products/products.module';
import { RegisterModule } from '@modules/register/register.module';
import { StatesModule } from '@modules/states/states.module';
import { StoreCustomerModule } from '@modules/store-customers/store-customer.module';
import { SubcategoriesModule } from '@modules/subcategories/subcategories.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 50,
          ttl: seconds(60),
        },
      ],
      errorMessage: 'Too many requests, please try again later.',
    }),
    EventEmitterModule.forRoot(),
    CommonModule,

    AuthModule,
    CategoriesModule,
    CitiesModule,
    CouponsModule,
    EmailMarketingModule,
    EmailRequestModule,
    EncoderModule,
    FavoritesModule,
    LogModule,
    NotificationsModule,
    OffersModule,
    OrdersModule,
    PaymentsModule,
    ProductsModule,
    RegisterModule,
    StatesModule,
    StoreCustomerModule,
    SubcategoriesModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_PIPE, useClass: ParseMongoIdPipe },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('{*splat}');

    consumer
      .apply(AsyncLocalStorageMiddleware)
      .forRoutes({ path: '{*splat}', method: RequestMethod.GET });
  }
}
