import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';

import { CreateCouponDto, UpdateCouponDto } from './dto';
import { Coupon, CouponDocument } from './schemas/coupon.schema';

import {
  COUPON_CHARACTERS_INVALID,
  COUPON_CODE_LENGTH,
  COUPON_EQUAL,
  COUPON_EXPIRATION_DATE,
  COUPON_EXPIRED,
  COUPON_FORMAT_INVALID,
  COUPON_LABEL_EXIST,
  COUPON_NOT_AVAILABLE,
  COUPON_NOT_FOUND,
  DISCOUNT_IS_REQUIRED,
} from '../../common/constants';
import { setDateWithEndTime } from '../../common/helpers';
import { FilterDto } from '../../common/dto';

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

  async findPaginate(
    filterDto: FilterDto<Coupon>,
  ): Promise<PaginateResult<CouponDocument>> {
    const { limit, page, data } = filterDto;

    return await this.couponModel.paginate(data, { limit, page });
  }

  async findAll() {
    return await this.couponModel.find();
  }

  async findByCode(code: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findOne({ code });
    if (!coupon) throw new NotFoundException(COUPON_NOT_FOUND);
    return coupon;
  }

  async create(createCouponDto: CreateCouponDto): Promise<CouponDocument> {
    if (!createCouponDto.code) {
      createCouponDto.code = this.generateCouponCode();
    }

    if (createCouponDto.code.length < 6) {
      createCouponDto.code = this.finishCouponCode(createCouponDto.code);
    }

    if (createCouponDto.code.length === 6) {
      createCouponDto.code = this.formatCouponCode(createCouponDto.code);
    }

    await this.validateCouponCreation(createCouponDto);
    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);
    if (createCouponDto.startDate.getTime() !== dateCurrentLocal.getTime()) {
      return await this.couponModel.create({
        ...createCouponDto,
        isActive: false,
      });
    }
    return await this.couponModel.create(createCouponDto);
  }

  async update(
    couponId: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<CouponDocument | null> {
    const existingCoupon = await this.findOneById(couponId);
    await this.validateUpdateCoupon(existingCoupon, couponId, updateCouponDto);

    updateCouponDto = this.updateDates(existingCoupon, updateCouponDto);
    const status = this.isStartDateToday(updateCouponDto.startDate!);
    return await this.couponModel.findByIdAndUpdate(
      couponId,
      { ...updateCouponDto, isActive: status },
      { new: true },
    );
  }

  async remove(couponId: string): Promise<CouponDocument | null> {
    return this.couponModel.findByIdAndDelete(couponId);
  }

  async updateUsedCoupon(id: string) {
    const coupon = await this.findOneById(id);
    const dateCurrentLocal = new Date();
    const dateCouponExpiration = setDateWithEndTime(coupon.expirationDate);

    if (dateCouponExpiration < dateCurrentLocal) {
      throw new BadRequestException(COUPON_EXPIRED);
    }

    coupon.expirationDate = dateCouponExpiration;

    if (coupon.limit > 0)
      return await this.couponModel.findByIdAndUpdate(id, {
        $set: { limit: coupon.limit - 1, isUsed: true },
      });

    if (coupon.limit === 0) {
      await this.couponModel.findByIdAndUpdate(id, {
        $set: { isActive: false },
      });

      throw new BadRequestException(COUPON_NOT_AVAILABLE);
    }
  }

  /**
   * * Private methods
   */

  private async validateUniqueCouponLabel(
    label: string,
    couponId: string | null,
  ): Promise<void> {
    const offer = await this.couponModel.findOne({
      label,
      _id: { $ne: couponId },
      isActive: true,
    });

    if (offer) throw new BadRequestException(COUPON_LABEL_EXIST);
  }

  private validateCouponRules(dto: CreateCouponDto | UpdateCouponDto): boolean {
    const {
      byCategories,
      byProduct,
      byCategoryPair,
      byMinAmount,
      byMinProductQuantity,
    } = dto;
    const ruleCount = [
      byCategories,
      byProduct,
      byCategoryPair,
      byMinAmount,
      byMinProductQuantity,
    ].filter((rule) => rule !== undefined).length;

    return ruleCount === 1;
  }

  private async validateCouponCreation(
    createCouponDto: CreateCouponDto,
  ): Promise<void> {
    const { label, discount, code } = createCouponDto;

    if (!this.validateCouponRules(createCouponDto))
      throw new Error('Cada cupón debe tener exactamente una regla.');

    if (!discount) throw new BadRequestException(DISCOUNT_IS_REQUIRED);

    await this.validateUniqueCouponLabel(label, null);

    const { expirationDate } = this.validateDates(
      createCouponDto.expirationDate,
      createCouponDto.startDate,
    );
    createCouponDto.expirationDate = expirationDate;

    await this.validCodeCoupon(code!);
  }

  private validateBothDates(updateCouponDto: UpdateCouponDto): UpdateCouponDto {
    const { expirationDate, startDate } = this.validateDates(
      updateCouponDto.expirationDate!,
      updateCouponDto.startDate!,
    );
    updateCouponDto.expirationDate = expirationDate;
    updateCouponDto.startDate = startDate;
    return updateCouponDto;
  }

  private isStartDateToday(startDate: Date): boolean {
    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);
    return startDate.getTime() === dateCurrentLocal.getTime();
  }

  private updateDates(
    existingCoupon: CouponDocument,
    updateCouponDto: UpdateCouponDto,
  ): UpdateCouponDto {
    if (updateCouponDto.expirationDate) {
      const { expirationDate } = this.validateDates(
        updateCouponDto.expirationDate,
        existingCoupon.startDate,
      );
      updateCouponDto.expirationDate = expirationDate;
    }

    if (updateCouponDto.expirationDate && updateCouponDto.startDate) {
      updateCouponDto = this.validateBothDates(updateCouponDto);
    }

    if (updateCouponDto.startDate) {
      const { startDate } = this.validateDates(
        existingCoupon.expirationDate,
        updateCouponDto.startDate,
      );
      updateCouponDto.startDate = startDate;
    }

    return updateCouponDto;
  }

  private validateDates(
    expirationDate: Date,
    startDate: Date,
  ): { startDate: Date; expirationDate: Date } {
    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);
    const dateExpirationCoupon = setDateWithEndTime(expirationDate);

    if (dateExpirationCoupon < dateCurrentLocal) {
      throw new BadRequestException(COUPON_EXPIRATION_DATE);
    }

    if (startDate < dateCurrentLocal) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser menor a la fecha actual',
      );
    }

    if (startDate > dateExpirationCoupon) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de expiración',
      );
    }

    return { startDate, expirationDate: dateExpirationCoupon };
  }

  private async validateUpdateCoupon(
    existingCoupon: CouponDocument,
    couponId: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<void> {
    const {
      code,
      label,
      byCategories,
      byCategoryPair,
      byMinAmount,
      byMinProductQuantity,
      byProduct,
    } = updateCouponDto;

    const ruleCount = [
      byCategories,
      byCategoryPair,
      byMinAmount,
      byMinProductQuantity,
      byProduct,
    ].filter((rule) => rule !== undefined).length;

    if (ruleCount === 1) {
      throw new BadRequestException(
        'No se puede cambiar la regla de un cupón existente. Cree uno nuevo en su lugar.',
      );
    }

    if (label) await this.validateUniqueCouponLabel(label, couponId);

    if (code) await this.validCodeCoupon(code);
  }

  private formatCouponCode(code: string): string {
    const trimmedCode = code.trim().toUpperCase();

    if (trimmedCode.length > 6)
      throw new BadRequestException(COUPON_CODE_LENGTH);

    const hasLetters = /[A-Z]/.test(trimmedCode);
    const hasNumbers = /[0-9]/.test(trimmedCode);

    if (!hasLetters || !hasNumbers)
      throw new BadRequestException(COUPON_FORMAT_INVALID);

    const hasInvalidCharacters = /[0oOlLiI]/.test(trimmedCode);

    if (hasInvalidCharacters)
      throw new BadRequestException(COUPON_CHARACTERS_INVALID);

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

  private finishCouponCode(partialCode: string, additionalLength = 6): string {
    const characters = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
    let couponCode = partialCode;

    for (let i = 0; i < additionalLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      couponCode += characters[randomIndex];
    }

    return couponCode.trim().toUpperCase();
  }

  private async validCodeCoupon(code: string): Promise<void> {
    const codeExist = await this.couponModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
    if (codeExist) throw new BadRequestException(COUPON_EQUAL);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async activeCoupons(): Promise<void> {
    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);
    const coupons = await this.couponModel.find({
      startDate: dateCurrentLocal,
      isActive: false,
    });
    if (coupons.length > 0) {
      await this.couponModel.updateMany(
        { startDate: dateCurrentLocal, isActive: false },
        { isActive: true },
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deactivateCoupons(): Promise<void> {
    const dateCurrentLocal = new Date();
    const coupons = await this.couponModel.find({
      expirationDate: { $lt: dateCurrentLocal },
      isActive: true,
    });
    if (coupons.length > 0) {
      await this.couponModel.updateMany(
        { expirationDate: { $lt: dateCurrentLocal }, isActive: true },
        { isActive: false },
      );
    }
  }
}
