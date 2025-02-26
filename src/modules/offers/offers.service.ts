import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { CreateOfferDto, UpdateOfferDto } from './dto';
import { Offer, OfferDocument } from './schemas/offer.schema';

import { setDateWithEndTime } from '../../common/helpers';
import { FilterDto } from '../../common/dto';

const logger = new Logger('OffersService');
@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: PaginateModel<Offer>,
  ) {}

  async findOneById(id: string): Promise<OfferDocument> {
    const offer = await this.offerModel.findById(id);

    if (!offer) throw new NotFoundException('La oferta no existe');

    return offer;
  }

  async findOneByQuery(
    query: FilterQuery<Offer>,
  ): Promise<OfferDocument | null> {
    return await this.offerModel.findOne(query);
  }

  async findPaginate(filterDto: FilterDto<Offer>) {
    const { page, limit, data } = filterDto;

    return await this.offerModel.paginate(data, { limit, page });
  }

  async findByQuery(query: FilterQuery<Offer>): Promise<OfferDocument[]> {
    return await this.offerModel.find(query);
  }

  async create(createOfferDto: CreateOfferDto): Promise<OfferDocument> {
    this.validateRulesOffer(createOfferDto);
    await this.validateUniqueOfferLabel(createOfferDto.label, null);

    const { expirationDate } = this.validateDates(
      createOfferDto.expirationDate,
      createOfferDto.startDate,
    );

    createOfferDto.expirationDate = expirationDate;

    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);

    if (createOfferDto.startDate.getTime() !== dateCurrentLocal.getTime()) {
      return await this.offerModel.create({
        ...createOfferDto,
        isActive: false,
      });
    }

    return await this.offerModel.create({ ...createOfferDto });
  }

  async update(
    offer: OfferDocument,
    updateOfferDto: UpdateOfferDto,
  ): Promise<OfferDocument | null> {
    await this.validateOfferUpdate(updateOfferDto, offer);

    updateOfferDto = this.updateDates(offer, updateOfferDto);
    const status = this.isStartDateToday(updateOfferDto.startDate!);

    return await this.offerModel.findByIdAndUpdate(
      offer._id,
      { ...updateOfferDto, isActive: status },
      { new: true },
    );
  }

  private isStartDateToday(startDate: Date): boolean {
    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);
    return startDate.getTime() === dateCurrentLocal.getTime();
  }

  private updateDates(
    offer: OfferDocument,
    updateOfferDto: UpdateOfferDto,
  ): UpdateOfferDto {
    if (updateOfferDto.expirationDate) {
      const { expirationDate } = this.validateDates(
        updateOfferDto.expirationDate,
        offer.startDate,
      );

      updateOfferDto.expirationDate = expirationDate;
    }

    if (updateOfferDto.startDate) {
      const { startDate } = this.validateDates(
        updateOfferDto.startDate,
        offer.startDate,
      );
      updateOfferDto.startDate = startDate;
    }

    if (updateOfferDto.expirationDate && updateOfferDto.startDate) {
      updateOfferDto = this.validateBothDates(updateOfferDto);
    }

    return updateOfferDto;
  }

  private async validateOfferUpdate(
    updateOfferDto: UpdateOfferDto,
    offer: OfferDocument,
  ) {
    const { byCategory, byProduct } = updateOfferDto;
    if (byCategory || byProduct) {
      throw new BadRequestException(
        'No se puede modificar la regla de la oferta. cree una nueva en su lugar.',
      );
    }

    if (updateOfferDto.isActive !== undefined || updateOfferDto.label) {
      await this.validateUniqueOfferLabel(offer.label, offer._id);
    }
  }

  private validateBothDates(updateOfferDto: UpdateOfferDto): UpdateOfferDto {
    const { expirationDate, startDate } = this.validateDates(
      updateOfferDto.expirationDate!,
      updateOfferDto.startDate!,
    );
    updateOfferDto.expirationDate = expirationDate;
    updateOfferDto.startDate = startDate;
    return updateOfferDto;
  }

  async remove(offerId: string): Promise<OfferDocument | null> {
    return this.offerModel.findByIdAndDelete(offerId);
  }

  private async validateUniqueOfferLabel(
    label: string,
    offerId: Types.ObjectId | null,
  ): Promise<void> {
    const offer = await this.offerModel.findOne({
      label,
      _id: { $ne: offerId },
      isActive: true,
    });

    if (offer) {
      throw new BadRequestException('Ya existe una oferta con esa etiqueta');
    }
  }

  private validateRulesOffer(dto: CreateOfferDto): void {
    const { byProduct, byCategory, discountAmount, discountPercentage } = dto;

    const ruleCount = [byProduct, byCategory].filter(
      (rule) => rule !== undefined,
    ).length;

    const ruleDiscountCount = [discountAmount, discountPercentage].filter(
      (rule) => rule !== undefined,
    ).length;

    if (ruleDiscountCount !== 1) {
      throw new BadRequestException(
        'Debe proporcionar un descuento por monto o por porcentaje',
      );
    }

    if (ruleCount !== 1) {
      throw new BadRequestException('Debe proporcionar una regla de oferta');
    }
  }

  private validateDates(
    expirationDate: Date,
    startDate: Date,
  ): { startDate: Date; expirationDate: Date } {
    const dateCurrentLocal = new Date();

    dateCurrentLocal.setUTCHours(0, 0, 0, 0);
    expirationDate = setDateWithEndTime(expirationDate);

    if (expirationDate < dateCurrentLocal) {
      throw new BadRequestException(
        'La fecha de expiración no puede ser menor a la fecha actual',
      );
    }

    if (startDate < dateCurrentLocal) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser menor a la fecha actual',
      );
    }

    if (startDate > expirationDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de expiración',
      );
    }

    return { startDate, expirationDate };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async activeOffers(): Promise<void> {
    logger.log('Active offers');

    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);

    const offers = await this.offerModel.find({
      startDate: dateCurrentLocal,
      isActive: false,
    });

    const offersToUpdate: OfferDocument[] = [];
    const offersNotUpdated: OfferDocument[] = [];

    for (const offer of offers) {
      try {
        await this.validateUniqueOfferLabel(offer.label, offer._id);
        offersToUpdate.push(offer);
      } catch (error) {
        logger.error(error);
        offersNotUpdated.push(offer);
      }
    }

    if (offersToUpdate.length > 0) {
      await this.offerModel.updateMany(
        { startDate: dateCurrentLocal, isActive: false },
        { isActive: true },
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deactivateOffers(): Promise<void> {
    logger.log('Deactivate offers');

    const dateCurrentLocal = new Date();
    dateCurrentLocal.setUTCHours(0, 0, 0, 0);

    const offers = await this.offerModel.find({
      expirationDate: { $lte: dateCurrentLocal },
      isActive: true,
    });

    if (offers.length > 0) {
      await this.offerModel.updateMany(
        { expirationDate: { $lte: dateCurrentLocal }, isActive: true },
        { isActive: false },
      );
    }
  }
}
