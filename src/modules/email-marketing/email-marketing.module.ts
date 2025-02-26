import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailMarketingService } from './email-marketing.service';
import { EmailMarketingController } from './email-marketing.controller';

import {
  EmailMarketing,
  EmailMarketingSchema,
} from './schemas/email-marketing.schema';

import { SettingsEmailMarketingModule } from '../settings-email-marketing/settings-email-marketing.module';
import { StoreCustomerModule } from '../customers/store-customer.module';
import { EmailSenderService } from './providers/email-sender.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailMarketing.name, schema: EmailMarketingSchema },
    ]),
    SettingsEmailMarketingModule,
    StoreCustomerModule,
  ],
  controllers: [EmailMarketingController],
  providers: [EmailMarketingService, EmailSenderService],
})
export class EmailMarketingModule {}
