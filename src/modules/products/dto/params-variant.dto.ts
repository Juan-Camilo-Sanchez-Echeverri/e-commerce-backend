import { IsNotBlank } from '@common/decorators';

export class ParamsVariantDto {
  @IsNotBlank({ message: 'productId should not be empty' })
  productId: string;

  @IsNotBlank({ message: 'variantId should not be empty' })
  variantId: string;
}
