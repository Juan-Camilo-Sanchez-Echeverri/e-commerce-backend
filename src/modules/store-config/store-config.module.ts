import { Module } from '@nestjs/common';
import { StoreConfigService } from './store-config.service';
import { StoreConfigController } from './store-config.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreConfig, StoreConfigSchema } from './schemas/store-config.schema';
import { ProductsModule } from '../products/products.module';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';

import { S3Module } from '../s3/s3.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreConfig.name, schema: StoreConfigSchema },
    ]),
    UsersModule,
    ProductsModule,
    ProductCategoriesModule,

    S3Module,
  ],
  controllers: [StoreConfigController],
  providers: [StoreConfigService],
  exports: [StoreConfigService],
})
export class StoreConfigModule {}
