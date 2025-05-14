import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from '../../common/helpers';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/offers',
        filename: fileNamer,
      }),
    }),
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
