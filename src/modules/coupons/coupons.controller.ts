import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { Roles } from '@common/decorators';
import { FilterDto } from '@common/dto';

import { CreateCouponDto, UpdateCouponDto } from './dto';
import { CouponDocument } from './schemas/coupon.schema';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @Roles('Admin')
  async findAll(@Query() query: FilterDto<CouponDocument>) {
    return await this.couponsService.findPaginate(query);
  }

  @Get(':couponId')
  @Roles('Admin')
  async findOne(@Param('couponId') couponId: string): Promise<CouponDocument> {
    return await this.couponsService.findOneById(couponId);
  }

  @Post()
  @Roles('Admin')
  async create(
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<CouponDocument> {
    return await this.couponsService.create(createCouponDto);
  }

  @Patch(':couponId')
  @Roles('Admin')
  async update(
    @Param('couponId') couponId: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<CouponDocument | null> {
    return await this.couponsService.update(couponId, updateCouponDto);
  }

  @Delete(':couponId')
  @Roles('Admin')
  async remove(
    @Param('couponId') couponId: string,
  ): Promise<CouponDocument | null> {
    return await this.couponsService.remove(couponId);
  }
}
