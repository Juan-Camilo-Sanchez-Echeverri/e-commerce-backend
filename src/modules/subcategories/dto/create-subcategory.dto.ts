import { IsNotBlank } from '@common/decorators';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '@common/enums';

export class CreateSubcategoryDto {
  @IsNotBlank({ message: 'name should not be empty' })
  name: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsNotBlank({ message: 'description should not be empty' })
  description: string;
}
