import { IsBoolean, IsOptional } from 'class-validator';
import { IsNotBlank } from '../../../common/decorators';

export class CreateProductCategoryDto {
  @IsNotBlank({ message: 'name is required' })
  name: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
