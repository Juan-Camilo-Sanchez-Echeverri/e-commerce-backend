import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { IsNotBlank } from '../../../common/decorators/is-not-blank.decorator';

export class CreateProductAttributeDto {
  @IsNotBlank({ message: 'name is required' })
  name: string;

  @IsNotBlank({ message: 'dataType is required' })
  dataType: string;

  @IsArray()
  optionValues: Array<any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
