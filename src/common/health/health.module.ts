import { Module } from '@nestjs/common';

import { CacheModule } from '@modules/cache/cache.module';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [CacheModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
