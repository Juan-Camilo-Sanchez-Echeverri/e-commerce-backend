import { Global, Module } from '@nestjs/common';

import { CacheModule } from '@modules/cache/cache.module';
import { LogModule } from '@modules/log/log.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

import { HealthModule } from './health/health.module';

@Global()
@Module({
  imports: [LogModule, NotificationsModule, CacheModule, HealthModule],
  exports: [LogModule, NotificationsModule, CacheModule, HealthModule],
})
export class CommonModule {}
