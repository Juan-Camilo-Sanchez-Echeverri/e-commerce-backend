import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  EmailRequest,
  EmailRequestSchema,
} from './schemas/email-request.schema';
import { EmailRequestService } from './email-request.service';
import { EmailRequestRepository } from './repositories/email-request.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: EmailRequest.name, schema: EmailRequestSchema },
    ]),
  ],
  providers: [EmailRequestService, EmailRequestRepository],
  exports: [EmailRequestService],
})
export class EmailRequestModule {}
