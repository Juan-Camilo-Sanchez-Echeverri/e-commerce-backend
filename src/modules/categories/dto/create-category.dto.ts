import { IsArray, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { IsNotBlank } from '@common/decorators';
import { Status } from '@common/enums';

export class CreateCategoryDto {
  @IsNotBlank({ message: 'name should not be empty' })
  name: string;

  @IsNotBlank({ message: 'description should not be empty' })
  description: string;

  @IsNotBlank({ message: 'icon should not be empty' })
  icon: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subcategories?: string[];
}
