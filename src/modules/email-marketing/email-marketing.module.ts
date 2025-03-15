import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailMarketingService } from './email-marketing.service';
import { EmailMarketingController } from './email-marketing.controller';

import {
  EmailMarketing,
  EmailMarketingSchema,
} from './schemas/email-marketing.schema';

import { StoreCustomerModule } from '../customers/store-customer.module';
import { EmailSenderService } from './providers/email-sender.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: EmailMarketing.name, schema: EmailMarketingSchema },
    ]),
    StoreCustomerModule,
  ],
  controllers: [EmailMarketingController],
  providers: [EmailMarketingService, EmailSenderService],
})
export class EmailMarketingModule {}
