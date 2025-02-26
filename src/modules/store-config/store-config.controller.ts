import {
  Controller,
  Get,
  Body,
  Patch,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { UpdateStoreConfigDto } from './dto/update-store-config.dto';
import { StoreConfigService } from './store-config.service';

import { Roles } from '../../common/decorators';

import { Role } from '../../common/enums';

import { UpdateStatusStoreDto } from './dto';
import { UpdateStatusPipe } from './pipes/updateStatus.pipe';

@Controller('settings')
export class StoreConfigController {
  constructor(private readonly storeConfigService: StoreConfigService) {}

  @Get('')
  @Roles(Role.Supervisor, Role.Admin)
  async getSettings() {
    return await this.storeConfigService.getSettingsByStoreId();
  }

  @Patch('')
  @Roles(Role.Supervisor, Role.Admin)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'logo' }, { name: 'cover' }]))
  async updateStoreSettings(
    @Body()
    updateStoreConfigDto: UpdateStoreConfigDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File; cover?: Express.Multer.File },
  ) {
    const storeSettings = await this.storeConfigService.getSettingsByStoreId();

    if (!storeSettings?.logo && !files?.logo)
      throw new BadRequestException('El logo es requerido');

    return await this.storeConfigService.updateStoreSettings(
      updateStoreConfigDto,
      files,
      storeSettings!,
    );
  }

  @Patch('activate')
  @Roles(Role.Supervisor, Role.Admin)
  async activateStore(
    @Body(UpdateStatusPipe) updateStatusStoreDto: UpdateStatusStoreDto,
  ) {
    return await this.storeConfigService.updateStoreStatus(
      updateStatusStoreDto,
    );
  }

  @Patch('deactivate')
  @Roles(Role.Supervisor, Role.Admin)
  async deactivateStore(
    @Body(UpdateStatusPipe) updateStatusStoreDto: UpdateStatusStoreDto,
  ) {
    return await this.storeConfigService.updateStoreStatus(
      updateStatusStoreDto,
    );
  }
}
