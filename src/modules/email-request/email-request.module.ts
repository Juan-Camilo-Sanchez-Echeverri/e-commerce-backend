import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  EmailRequest,
  EmailRequestSchema,
} from './schemas/email-request.schema';
import { EmailRequestService } from './email-request.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: EmailRequest.name, schema: EmailRequestSchema },
    ]),
  ],
  providers: [EmailRequestService],
  exports: [EmailRequestService],
})
export class EmailRequestModule {}
