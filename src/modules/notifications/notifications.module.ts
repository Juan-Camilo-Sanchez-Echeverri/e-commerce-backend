import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailEvent } from './events/email.events';
import { EmailProvider } from './providers/email.provider';

@Module({
  providers: [NotificationsService, EmailEvent, EmailProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
