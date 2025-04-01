import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { FilterDto } from '@common/dto';
import { Status } from '@common/enums';
import {
  EXPIRATION_DATE_INVALID,
  START_DATE_AFTER_EXPIRATION,
  START_DATE_INVALID,
} from '@common/constants';

import { CreateOfferDto, UpdateOfferDto } from './dto';
import { Offer, OfferDocument } from './schemas/offer.schema';
import {
  DISCOUNT_IS_REQUIRED,
  OFFER_LABEL_EXIST,
  OFFER_NOT_FOUND,
} from './constants/offers.constants';

const logger = new Logger('OffersService');
@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: PaginateModel<Offer>,
  ) {}

  async findOneById(id: string): Promise<OfferDocument> {
    const offer = await this.offerModel.findById(id);

    if (!offer) throw new NotFoundException(OFFER_NOT_FOUND);

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
    const { expirationDate, startDate, label } = createOfferDto;
    this.validateRulesOffer(createOfferDto);

    await this.validateUniqueLabel(label, null);

    this.validateDates(expirationDate, startDate);

    return await this.offerModel.create(createOfferDto);
  }

  async update(
    offer: OfferDocument,
    updateOfferDto: UpdateOfferDto,
  ): Promise<OfferDocument | null> {
    const { label } = updateOfferDto;

    if (label && label !== offer.label) {
      await this.validateUniqueLabel(label, offer._id);
    }

    this.updateDates(offer, updateOfferDto);

    return await this.offerModel.findByIdAndUpdate(
      offer._id,
      { $set: updateOfferDto },
      { new: true },
    );
  }

  async remove(offerId: string): Promise<OfferDocument> {
    await this.findOneById(offerId);
    const offerDelete = await this.offerModel.findByIdAndDelete(offerId);

    return offerDelete!;
  }

  private async validateUniqueLabel(
    label: string,
    offerId: Types.ObjectId | null,
  ): Promise<void> {
    const offer = await this.offerModel.findOne({
      label,
      _id: { $ne: offerId },
      status: Status.ACTIVE,
    });

    if (offer) {
      throw new BadRequestException(OFFER_LABEL_EXIST);
    }
  }

  private validateRulesOffer(dto: CreateOfferDto): void {
    const { discountAmount, discountPercentage } = dto;

    if (!discountAmount && !discountPercentage) {
      throw new BadRequestException(DISCOUNT_IS_REQUIRED);
    }
  }

  private updateDates(offer: OfferDocument, updateOfferDto: UpdateOfferDto) {
    const { expirationDate, startDate } = updateOfferDto;

    if (expirationDate && startDate) {
      this.validateDates(expirationDate, startDate);
      return;
    }

    if (expirationDate) {
      this.validateDates(expirationDate, offer.startDate);
      return;
    }

    if (startDate) {
      this.validateDates(offer.expirationDate, startDate);
      return;
    }
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

  @Cron(CronExpression.EVERY_MINUTE)
  async activeOffers(): Promise<void> {
    logger.log('Active offers');

    const dateCurrent = new Date();

    const offers = await this.offerModel.find({
      startDate: { $lte: dateCurrent },
      expirationDate: { $gte: dateCurrent },
      status: Status.ACTIVE,
    });

    const offersToUpdate: OfferDocument[] = [];
    const offersNotUpdated: OfferDocument[] = [];

    for (const offer of offers) {
      try {
        await this.validateUniqueLabel(offer.label, offer._id);
        offersToUpdate.push(offer);
      } catch (error) {
        logger.error(error);
        offersNotUpdated.push(offer);
      }
    }

    if (offersToUpdate.length > 0) {
      await this.offerModel.updateMany(
        {
          startDate: { $lte: dateCurrent },
          expirationDate: { $gte: dateCurrent },
          status: Status.ACTIVE,
        },
        { status: Status.ACTIVE },
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async deactivateOffers(): Promise<void> {
    logger.log('Deactivate offers');

    const dateCurrent = new Date();

    await this.offerModel.updateMany(
      {
        expirationDate: { $lte: dateCurrent },
        status: Status.ACTIVE,
      },
      { status: Status.INACTIVE },
    );
  }
}
