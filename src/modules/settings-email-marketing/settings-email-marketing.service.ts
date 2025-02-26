import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import {
  CreateSettingsEmailMarketingDto,
  UpdateSettingsEmailMarketingDto,
} from './dto';

import {
  SettingsEmailMarketing,
  SettingsEmailMarketingDocument,
} from './schema/settings-email-marketing.schema';

@Injectable()
export class SettingsEmailMarketingService {
  constructor(
    @InjectModel(SettingsEmailMarketing.name)
    private settingsEmailMarketingModel: Model<SettingsEmailMarketing>,
  ) {}

  async create(
    createSettingsEmailMarketingDto: CreateSettingsEmailMarketingDto,
  ) {
    return await this.settingsEmailMarketingModel.create(
      createSettingsEmailMarketingDto,
    );
  }

  async findAll(): Promise<SettingsEmailMarketingDocument[]> {
    return await this.settingsEmailMarketingModel.find();
  }

  async finOneByQuery(query: FilterQuery<SettingsEmailMarketing> = {}) {
    return await this.settingsEmailMarketingModel.findOne(query);
  }

  async findOne(id: string) {
    const settings = await this.settingsEmailMarketingModel.findById(id);
    if (!settings) throw new NotFoundException('La configuración no existe');
    return settings;
  }

  async update(
    updateSettingsEmailMarketingDto: UpdateSettingsEmailMarketingDto,
  ) {
    return await this.settingsEmailMarketingModel.findOneAndUpdate(
      {},
      updateSettingsEmailMarketingDto,
      { new: true, upsert: true },
    );
  }

  async remove(id: string) {
    return await this.settingsEmailMarketingModel.findByIdAndDelete(id);
  }
}
