import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SettingsEmailMarketingService } from './settings-email-marketing.service';
import { SettingsEmailMarketingController } from './settings-email-marketing.controller';
import {
  SettingsEmailMarketing,
  SettingsEmailMarketingSchema,
} from './schema/settings-email-marketing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SettingsEmailMarketing.name,
        schema: SettingsEmailMarketingSchema,
      },
    ]),
  ],
  controllers: [SettingsEmailMarketingController],
  providers: [SettingsEmailMarketingService],
  exports: [SettingsEmailMarketingService],
})
export class SettingsEmailMarketingModule {}
