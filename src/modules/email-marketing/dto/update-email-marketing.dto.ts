import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailMarketingDto } from './create-email-marketing.dto';

export class UpdateEmailMarketingDto extends PartialType(
  CreateEmailMarketingDto,
) {}
