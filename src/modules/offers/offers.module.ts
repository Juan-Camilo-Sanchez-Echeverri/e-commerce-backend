import { mkdir } from 'fs/promises';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { OffersController } from './offers.controller';
import { OffersRepository } from './repositories/offers.repository';
import { OffersService } from './offers.service';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { fileNamer } from '../../common/helpers';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const UPLOADS_DIR = './uploads/offers';

          mkdir(UPLOADS_DIR, { recursive: true })
            .then(() => cb(null, UPLOADS_DIR))
            .catch((error: Error) => cb(error, UPLOADS_DIR));
        },
        filename: fileNamer,
      }),
    }),
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
  ],
  controllers: [OffersController],
  providers: [OffersService, OffersRepository],
  exports: [OffersService],
})
export class OffersModule {}
