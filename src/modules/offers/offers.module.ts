import { mkdir } from 'fs/promises';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { fileNamer } from '../../common/helpers';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          const UPLOADS_DIR = './uploads/offers';
          await mkdir(UPLOADS_DIR, { recursive: true });
          cb(null, UPLOADS_DIR);
        },
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
