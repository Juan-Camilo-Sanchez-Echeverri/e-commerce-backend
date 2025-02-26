import { PartialType } from '@nestjs/mapped-types';
import { CreateSettingsEmailMarketingDto } from './create-settings-email-marketing.dto';

export class UpdateSettingsEmailMarketingDto extends PartialType(
  CreateSettingsEmailMarketingDto,
) {}
