import { IsMongoId, IsNumber } from 'class-validator';
import { IsNotBlank } from '@common/decorators';

export class OrderItemDto {
  @IsMongoId({ message: 'Invalid productId format' })
  productId: string;

  @IsMongoId({ message: 'Invalid variantId format' })
  variantId: string;

  @IsNumber()
  quantity: number;

  @IsNotBlank()
  color: string;

  @IsNotBlank()
  size: string;
}
