import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';

import { FilterDto } from '@common/dto';
import { Status } from '@common/enums';
import {
  EXPIRATION_DATE_INVALID,
  START_DATE_AFTER_EXPIRATION,
  START_DATE_INVALID,
} from '@common/constants';

import { CreateCouponDto, UpdateCouponDto } from './dto';

import {
  COUPON_CHARACTERS_INVALID,
  COUPON_CODE_LENGTH,
  COUPON_EQUAL,
  COUPON_EXPIRED,
  COUPON_FORMAT_INVALID,
  COUPON_LABEL_EXIST,
  COUPON_NOT_AVAILABLE,
  COUPON_NOT_FOUND,
  DISCOUNT_IS_REQUIRED,
  COUPON_RULE_CHANGE_NOT_ALLOWED,
  COUPON_ONE_RULE_PERMITTED,
} from './constants/coupons.constants';

import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { StoreCustomerDocument } from '../customers/schemas/customer.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: PaginateModel<Coupon>,
  ) {}

  async findOneById(couponId: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findById(couponId);
    if (!coupon) throw new NotFoundException(COUPON_NOT_FOUND);
    return coupon;
  }

  async findOneByQuery(
    query: FilterQuery<Coupon>,
  ): Promise<CouponDocument | null> {
    return await this.couponModel.findOne(query);
  }

  async findByQuery(query: FilterQuery<Coupon>): Promise<CouponDocument[]> {
    return await this.couponModel.find(query);
  }

  async findPaginate(
    filterDto: FilterDto<Coupon>,
  ): Promise<PaginateResult<CouponDocument>> {
    const { limit, page, data } = filterDto;

    return await this.couponModel.paginate(data, { limit, page });
  }

  async findAll() {
    return await this.couponModel.find();
  }

  async create(createCouponDto: CreateCouponDto): Promise<CouponDocument> {
    if (!createCouponDto.code) {
      createCouponDto.code = this.generateCouponCode();
    } else {
      createCouponDto.code = this.formatCouponCode(createCouponDto.code);
    }

    await this.validateCouponCreation(createCouponDto);

    return await this.couponModel.create(createCouponDto);
  }

  async update(
    couponId: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<CouponDocument> {
    const existingCoupon = await this.findOneById(couponId);
    await this.validateUpdateCoupon(couponId, updateCouponDto);

    updateCouponDto = this.updateDates(existingCoupon, updateCouponDto);

    const updateCoupon = await this.couponModel.findByIdAndUpdate(
      couponId,
      { $set: updateCouponDto },
      { new: true },
    );

    return updateCoupon!;
  }

  async remove(couponId: string): Promise<CouponDocument> {
    await this.findOneById(couponId);
    const couponDelete = await this.couponModel.findByIdAndDelete(couponId);

    return couponDelete!;
  }

  async updateUsedCoupon(id: string, user: StoreCustomerDocument) {
    const coupon = await this.findOneById(id);
    const dateCurrentLocal = new Date();

    if (coupon.expirationDate < dateCurrentLocal) {
      throw new BadRequestException(COUPON_EXPIRED);
    }

    if (!coupon.usedBy.includes(user._id)) {
      await this.couponModel.findByIdAndUpdate(id, {
        $push: { usedBy: user._id },
      });
    }

    if (coupon.usedBy.includes(user._id)) {
      throw new BadRequestException(COUPON_NOT_AVAILABLE);
    }
  }

  /**
   * * Private methods
   */

  private async validateUniqueLabel(
    label: string,
    couponId: string | null,
  ): Promise<void> {
    const offer = await this.couponModel.findOne({
      label,
      _id: { $ne: couponId },
      status: Status.ACTIVE,
    });

    if (offer) throw new BadRequestException(COUPON_LABEL_EXIST);
  }

  private validateCouponRules(dto: CreateCouponDto): boolean {
    const { byProduct, byMinAmount } = dto;

    const ruleCount = [byProduct, byMinAmount].filter(
      (rule) => rule !== undefined,
    );

    return ruleCount.length === 1;
  }

  private async validateCouponCreation(
    createCouponDto: CreateCouponDto,
  ): Promise<void> {
    const { label, discountAmount, discountPercentage, code } = createCouponDto;

    if (!this.validateCouponRules(createCouponDto)) {
      throw new BadRequestException(COUPON_ONE_RULE_PERMITTED);
    }

    if (!discountAmount && !discountPercentage) {
      throw new BadRequestException(DISCOUNT_IS_REQUIRED);
    }

    await this.validateUniqueLabel(label, null);

    const { expirationDate, startDate } = createCouponDto;

    this.validateDates(expirationDate, startDate);

    await this.validCodeCoupon(code!);
  }

  private updateDates(
    existingCoupon: CouponDocument,
    updateCouponDto: UpdateCouponDto,
  ): UpdateCouponDto {
    const { expirationDate, startDate } = updateCouponDto;

    if (expirationDate && startDate) {
      this.validateDates(expirationDate, startDate);

      return updateCouponDto;
    }

    if (expirationDate) {
      this.validateDates(expirationDate, existingCoupon.startDate);

      return updateCouponDto;
    }

    if (startDate) {
      this.validateDates(existingCoupon.expirationDate, startDate);

      return updateCouponDto;
    }

    return updateCouponDto;
  }

  private validateDates(expirationDate: Date, startDate: Date) {
    const dateCurrentLocal = new Date();

    if (startDate < dateCurrentLocal) {
      throw new BadRequestException(START_DATE_INVALID);
    }

    if (expirationDate < dateCurrentLocal) {
      throw new BadRequestException(EXPIRATION_DATE_INVALID);
    }

    if (startDate > expirationDate) {
      throw new BadRequestException(START_DATE_AFTER_EXPIRATION);
    }
  }

  private async validateUpdateCoupon(
    couponId: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<void> {
    const { code, label, byMinAmount, byProduct } = updateCouponDto;

    const ruleCount = [byMinAmount, byProduct].filter(
      (rule) => rule !== undefined,
    );

    if (ruleCount.length === 1) {
      throw new BadRequestException(COUPON_RULE_CHANGE_NOT_ALLOWED);
    }

    if (label) await this.validateUniqueLabel(label, couponId);

    if (code) await this.validCodeCoupon(code);
  }

  private formatCouponCode(code: string): string {
    const trimmedCode = code.trim().toUpperCase();

    if (trimmedCode.length > 6) {
      throw new BadRequestException(COUPON_CODE_LENGTH);
    }

    const hasLetters = /[A-Z]/.test(trimmedCode);
    const hasNumbers = /[0-9]/.test(trimmedCode);

    if (!hasLetters || !hasNumbers) {
      throw new BadRequestException(COUPON_FORMAT_INVALID);
    }

    const hasInvalidCharacters = /[0oOlLiI]/.test(trimmedCode);

    if (hasInvalidCharacters) {
      throw new BadRequestException(COUPON_CHARACTERS_INVALID);
    }

    return trimmedCode;
  }
  private generateCouponCode(length = 6): string {
    const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const numbers = '123456789';
    const characters = letters + numbers;
    let couponCode = '';
    couponCode += letters[Math.floor(Math.random() * letters.length)];
    couponCode += numbers[Math.floor(Math.random() * numbers.length)];

    for (let i = 2; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      couponCode += characters[randomIndex];
    }

    return this.formatCouponCode(couponCode);
  }

  private async validCodeCoupon(code: string): Promise<void> {
    const codeExist = await this.couponModel.findOne({
      code: code.toUpperCase(),
      status: Status.ACTIVE,
    });

    if (codeExist) throw new BadRequestException(COUPON_EQUAL);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async activeCoupons(): Promise<void> {
    const dateCurrent = new Date();

    const query = {
      startDate: { $lte: dateCurrent },
      expirationDate: { $gte: dateCurrent },
      status: Status.INACTIVE,
    };

    const activeCoupons = await this.findByQuery(query);

    await Promise.all(
      activeCoupons.map(async (coupon) => {
        await this.couponModel.findByIdAndUpdate(coupon._id, {
          status: Status.ACTIVE,
        });
      }),
    );

    await this.couponModel.updateMany(query, { status: Status.ACTIVE });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async deactivateCoupons(): Promise<void> {
    const dateCurrent = new Date();

    const coupons = await this.couponModel.find({
      expirationDate: { $lt: dateCurrent },
      status: Status.ACTIVE,
    });

    await Promise.all(
      coupons.map(async (coupon) => {
        await this.couponModel.findByIdAndUpdate(coupon._id, {
          status: Status.INACTIVE,
        });
      }),
    );
  }
}
