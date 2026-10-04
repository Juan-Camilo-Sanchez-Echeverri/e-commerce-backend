import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { Status } from '@common/enums';

import { CouponsService } from '@modules/coupons/coupons.service';
import { CouponDocument } from '@modules/coupons/schemas/coupon.schema';
import {
  COUPON_EXPIRED,
  COUPON_NOT_AVAILABLE,
  COUPON_NOT_FOUND,
} from '@modules/coupons/constants/coupons.constants';

import { CreateOrderDto } from '../dto';

@Injectable()
export class ValidateCouponPipe implements PipeTransform {
  constructor(private readonly couponsService: CouponsService) {}

  async transform(createOrderDto: CreateOrderDto): Promise<CreateOrderDto> {
    if (!createOrderDto.coupon) return createOrderDto;

    const coupon = await this.couponsService.findOneByQuery({
      code: createOrderDto.coupon,
      status: Status.ACTIVE,
    });

    if (!coupon) throw new NotFoundException(COUPON_NOT_FOUND);

    this.validateCouponExpiration(coupon);

    this.validateCouponUsageByEmail(coupon, createOrderDto.email);

    this.validateCouponProductApplication(coupon, createOrderDto);

    return createOrderDto;
  }

  private validateCouponExpiration(coupon: CouponDocument): void {
    const now = new Date();

    if (now > coupon.expirationDate) {
      throw new NotFoundException(COUPON_EXPIRED);
    }

    if (now < coupon.startDate) {
      throw new NotFoundException(`Coupon ${coupon.code} has not started yet`);
    }
  }

  private validateCouponUsageByEmail(
    coupon: CouponDocument,
    email: string,
  ): void {
    if (coupon.usedBy.length === 0) return;

    if (coupon.usedBy.includes(email)) {
      throw new NotFoundException(COUPON_NOT_AVAILABLE);
    }
  }

  private validateCouponProductApplication(
    coupon: CouponDocument,
    createOrderDto: CreateOrderDto,
  ): void {
    if (!coupon.byProduct) return;

    const productObjectId = coupon.byProduct._id.toString();

    const hasApplicableProduct = createOrderDto.items.some(
      (item) => item.productId === productObjectId,
    );

    if (!hasApplicableProduct) {
      throw new NotFoundException(
        `Coupon ${coupon.code} does not apply to any product in this order`,
      );
    }
  }
}
