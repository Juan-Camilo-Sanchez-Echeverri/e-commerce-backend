import { Global, Module } from '@nestjs/common';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Global()
@Module({
  imports: [NotificationsModule],
  exports: [NotificationsModule],
})
export class CommonModule {}
