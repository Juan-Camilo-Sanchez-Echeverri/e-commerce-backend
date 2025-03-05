import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';

import { SettingsEmailMarketingService } from './settings-email-marketing.service';
import { UpdateSettingsEmailMarketingDto } from './dto';
import { Roles } from '../../common/decorators';

import { SettingsEmailMarketingDocument } from './schema/settings-email-marketing.schema';

@Controller('email-marketing/settings')
export class SettingsEmailMarketingController {
  constructor(
    private readonly settingsEmailMarketingService: SettingsEmailMarketingService,
  ) {}

  @Get()
  @Roles()
  async findAll(): Promise<SettingsEmailMarketingDocument[]> {
    return await this.settingsEmailMarketingService.findAll();
  }

  @Get(':id')
  @Roles('Admin')
  async findOne(
    @Param('id') id: string,
  ): Promise<SettingsEmailMarketingDocument> {
    return await this.settingsEmailMarketingService.findOne(id);
  }

  @Patch()
  @Roles('Admin')
  async update(
    @Body()
    updateSettingsEmailMarketingDto: UpdateSettingsEmailMarketingDto,
  ): Promise<SettingsEmailMarketingDocument> {
    return await this.settingsEmailMarketingService.update(
      updateSettingsEmailMarketingDto,
    );
  }

  @Delete(':id')
  @Roles('Admin')
  async remove(@Param('id') id: string) {
    return await this.settingsEmailMarketingService.remove(id);
  }
}
