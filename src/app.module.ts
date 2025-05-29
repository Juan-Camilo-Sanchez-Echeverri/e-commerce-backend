import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { HttpExceptionFilter } from '@common/filters/http-exception.filter';

import { ParseMongoIdPipe } from '@common/pipes';

import { RolesGuard } from '@common/guards/roles.guard';
import { AuthGuard } from '@modules/auth/guards';

import { ResponseInterceptor } from '@common/interceptors';

import { LoggerMiddleware } from '@common/middlewares';

import { AuthModule } from '@modules/auth/auth.module';
import { CitiesModule } from '@modules/cities/cities.module';
import { MongooseConfigService } from '@modules/config';
import { CouponsModule } from '@modules/coupons/coupons.module';

import { EmailMarketingModule } from '@modules/email-marketing/email-marketing.module';

import { FavoritesModule } from '@modules/favorites/favorites.module';
import { LogModule } from '@modules/log/log.module';
import { OffersModule } from '@modules/offers/offers.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { ProductsModule } from '@modules/products/products.module';
import { RegisterModule } from '@modules/register/register.module';

import { StatesModule } from '@modules/states/states.module';
import { StoreCustomerModule } from '@modules/customers/store-customer.module';

import { UsersModule } from '@modules/users/users.module';

import { EncoderModule } from '@modules/encoder/encoder.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailRequestModule } from './modules/email-request/email-request.module';
import { SubcategoriesModule } from './modules/subcategories/subcategories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    CitiesModule,
    CouponsModule,
    EmailMarketingModule,
    EncoderModule,
    FavoritesModule,
    LogModule,
    OffersModule,
    CategoriesModule,
    ProductsModule,
    RegisterModule,
    StatesModule,
    StoreCustomerModule,
    UsersModule,
    NotificationsModule,
    EmailRequestModule,
    SubcategoriesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_PIPE, useClass: ParseMongoIdPipe },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('{*splat}');
  }
}
