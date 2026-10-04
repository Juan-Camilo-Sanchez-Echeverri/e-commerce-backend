import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsNotBlank } from '../../../common/decorators';

export class CreateEmailMarketingDto {
  @IsNotBlank({ message: 'subject is required' })
  subject: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  usersSent: string[];

  @IsNotBlank({ message: 'content is required' })
  content: string;

  @IsOptional()
  @IsBoolean()
  isSent?: boolean;

  @IsOptional()
  @IsDate()
  sendDate?: Date;
}
