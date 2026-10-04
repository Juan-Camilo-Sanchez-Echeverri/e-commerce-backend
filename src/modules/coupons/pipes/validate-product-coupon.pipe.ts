import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { Status } from '@common/enums';

import { ProductsService } from '@modules/products/products.service';

import { CreateCouponDto } from '../dto';

@Injectable()
export class ValidateProductCouponPipe implements PipeTransform {
  constructor(private readonly productsService: ProductsService) {}
  async transform(value: CreateCouponDto) {
    if (value.byProduct) {
      const product = await this.productsService.findOneByQuery({
        _id: value.byProduct,
        status: Status.ACTIVE,
      });

      if (!product) throw new BadRequestException('Product not found.');
    }

    return value;
  }
}
