import { IsString } from 'class-validator';

export class CreateSettingsEmailMarketingDto {
  @IsString()
  apiKey: string;

  @IsString()
  senderEmail: string;
}
