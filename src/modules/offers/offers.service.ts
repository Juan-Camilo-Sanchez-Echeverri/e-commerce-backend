import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { QueryFilter, Types } from 'mongoose';

import { FilterDto } from '@common/dto';
import { Status } from '@common/enums';
import {
  EXPIRATION_DATE_INVALID,
  START_DATE_AFTER_EXPIRATION,
  START_DATE_INVALID,
} from '@common/constants';

import { CreateOfferDto, UpdateOfferDto } from './dto';
import { OffersRepository } from './repositories/offers.repository';
import { Offer, OfferDocument } from './schemas/offer.schema';
import {
  DISCOUNT_IS_REQUIRED,
  OFFER_LABEL_EXIST,
  OFFER_NOT_FOUND,
} from './constants/offers.constants';

const logger = new Logger('OffersService');
@Injectable()
export class OffersService {
  constructor(private readonly offersRepository: OffersRepository) {}

  async findOneById(id: string): Promise<OfferDocument> {
    const offer = await this.offersRepository.findOneById(id);

    if (!offer) throw new NotFoundException(OFFER_NOT_FOUND);

    return offer;
  }

  async findOneByQuery(
    query: QueryFilter<Offer>,
  ): Promise<OfferDocument | null> {
    return await this.offersRepository.findOne(query);
  }

  async findPaginate(filterDto: FilterDto<Offer>) {
    return await this.offersRepository.findPaginate(filterDto);
  }

  async findByQuery(query: QueryFilter<Offer>): Promise<OfferDocument[]> {
    return await this.offersRepository.find(query);
  }

  async create(createOfferDto: CreateOfferDto): Promise<OfferDocument> {
    const { expirationDate, startDate, label } = createOfferDto;
    this.validateRulesOffer(createOfferDto);

    await this.validateUniqueLabel(label, null);

    this.validateDates(expirationDate, startDate);

    return await this.offersRepository.create(createOfferDto);
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

    return await this.offersRepository.findByIdAndUpdate(offer._id, {
      $set: updateOfferDto,
    });
  }

  async remove(offerId: string): Promise<OfferDocument> {
    await this.findOneById(offerId);
    const offerDelete = await this.offersRepository.findByIdAndDelete(offerId);

    if (!offerDelete) throw new NotFoundException(OFFER_NOT_FOUND);

    return offerDelete;
  }

  private async validateUniqueLabel(
    label: string,
    offerId: Types.ObjectId | null,
  ): Promise<void> {
    const offer = await this.offersRepository.findOne({
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

    const filter = {
      startDate: { $lte: dateCurrent },
      expirationDate: { $gte: dateCurrent },
      status: Status.INACTIVE,
    };

    const offers = await this.offersRepository.find(filter);

    const offersToUpdate: OfferDocument[] = [];
    const offersNotUpdated: { offer: OfferDocument; reason: string }[] = [];

    for (const offer of offers) {
      try {
        await this.validateUniqueLabel(offer.label, offer._id);
        offer.status = Status.ACTIVE;
        await offer.save();
        offersToUpdate.push(offer);
      } catch (error) {
        offersNotUpdated.push({ offer, reason: String(error) });
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async deactivateOffers(): Promise<void> {
    logger.log('Deactivate offers');

    const dateCurrent = new Date();

    const deactivate = await this.offersRepository.updateMany(
      {
        expirationDate: { $lte: dateCurrent },
        status: Status.ACTIVE,
      },
      { status: Status.INACTIVE },
    );

    logger.log(`Offers deactivated: ${deactivate.modifiedCount}`);
  }
}
