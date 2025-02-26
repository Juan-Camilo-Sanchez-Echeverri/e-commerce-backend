import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import {
  StoreConfig,
  StoreConfigDocument,
} from './schemas/store-config.schema';

import { PaymentSettingsePayco, PaymentSettingsPayU } from '../payments/dto';
import { UpdateStatusStoreDto, UpdateStoreConfigDto } from './dto';
import { PhoneAuthenticationDto } from '../auth/dto/auth.dto';

import { generateFileNameAndPath } from '../../common/helpers/path-files-upload.helper';

import { Role } from '../../common/enums';
import { GatewayName } from '../payments/enums';

import { S3Service } from '../s3/s3.service';
import { ProductsService } from '../products/products.service';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class StoreConfigService {
  constructor(
    @InjectModel(StoreConfig.name)
    private readonly storeConfigModel: Model<StoreConfigDocument>,
    private readonly s3Service: S3Service,
    private readonly productsService: ProductsService,
    private readonly productCategoriesService: ProductCategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async getSettingsByStoreId() {
    return await this.storeConfigModel.findOne({});
  }

  async updateStoreSettings(
    updateStoreConfigDto: UpdateStoreConfigDto,
    files: { logo?: Express.Multer.File; cover?: Express.Multer.File },
    storeSettings: StoreConfigDocument,
  ) {
    if (updateStoreConfigDto.gatewayName)
      await this.validatePaymentConfig(updateStoreConfigDto);

    await this.handleFileUploads(files, storeSettings, updateStoreConfigDto);

    const filter = {};
    const options = { new: true, upsert: true };
    const updateQuery = this.buildUpdateQuery(updateStoreConfigDto);
    const updatedSettings = await this.storeConfigModel.findOneAndUpdate(
      filter,
      updateQuery,
      options,
    );

    return updatedSettings;
  }
  async handleFileUploads(
    files: { logo?: Express.Multer.File; cover?: Express.Multer.File },
    storeSettings: StoreConfigDocument,
    updateStoreConfigDto: UpdateStoreConfigDto,
  ) {
    if (files?.logo) {
      await this.handleFileUpload(
        'logo',
        files.logo[0],
        storeSettings?.logo,
        updateStoreConfigDto,
      );
    }

    if (files?.cover) {
      await this.handleFileUpload(
        'cover',
        files.cover[0],
        storeSettings?.cover,
        updateStoreConfigDto,
      );
    }
  }

  async updateStoreConfig(updateStoreConfigDto: UpdateStoreConfigDto) {
    const filter = {};
    const options = { new: true, upsert: true };
    const updateQuery = this.buildUpdateQuery(updateStoreConfigDto);
    return await this.storeConfigModel.findOneAndUpdate(
      filter,
      updateQuery,
      options,
    );
  }
  async getPaymentSettings(gatewayName: GatewayName) {
    const storeSettings = await this.storeConfigModel
      .findOne({ gatewayName })
      .select(`settings${gatewayName} -_id`);

    if (storeSettings && storeSettings[`settings${gatewayName}`])
      return storeSettings[`settings${gatewayName}`];
  }

  async updateStoreStatus(updateStatusStoreDto: UpdateStatusStoreDto) {
    await this.validateRequiredTasks('storeId');
  }

  private async validateRequiredTasks(storeId: string) {
    const missingTasks: Record<string, boolean> = {};

    const [existCategories, existProducts] = await Promise.all([
      this.productCategoriesService.findByQuery({}),
      this.productsService.findAll(),
    ]);

    const existLogo = await this.storeConfigModel.findOne({
      store: storeId,
      logo: { $exists: true },
    });

    if (!existLogo) missingTasks.logo = true;
    if (existCategories.length <= 0) missingTasks.category = true;
    if (existProducts.length <= 0) missingTasks.product = true;

    if (Object.keys(missingTasks).length > 0) {
      throw new BadRequestException({ message: missingTasks });
    }
  }

  private async validatePaymentSettings(storeId: string) {
    const settingsPayment = await this.storeConfigModel.findOne({
      store: storeId,
      gatewayName: { $exists: true },
      $or: [
        { settingsePayco: { $exists: true } },
        { settingsPayU: { $exists: true } },
      ],
    });
    return !!settingsPayment;
  }

  private async handleFileUpload(
    fieldName: string,
    file: Express.Multer.File,
    existingFile: string,
    updateStoreConfigDto: UpdateStoreConfigDto,
  ): Promise<void> {
    if (existingFile) await this.s3Service.deleteFile(existingFile);
    const { path } = generateFileNameAndPath(file, 'settings');
    const uploadedFile = await this.s3Service.uploadFile(file, path);
    updateStoreConfigDto[fieldName] = uploadedFile;
  }

  private validatePaymentConfig(updateStoreConfigDto: UpdateStoreConfigDto) {
    const { gatewayName, settingsePayco, settingsPayU } = updateStoreConfigDto;

    const hasEPaycoConfig = !!settingsePayco;
    const hasPayUConfig = !!settingsPayU;

    const isInvalidPaymentConfig =
      hasEPaycoConfig || hasPayUConfig || gatewayName;

    const hasPaymentConfig = hasEPaycoConfig || hasPayUConfig;

    this.validateExistPayConfigs(hasPaymentConfig);

    this.thereAreTwoSettings(hasEPaycoConfig, hasPayUConfig);

    if (hasEPaycoConfig)
      this.validateEPaycoConfig(settingsePayco, gatewayName!);

    if (hasPayUConfig) this.validatePayUConfig(settingsPayU, gatewayName!);
  }

  private thereAreTwoSettings(
    hasEPaycoConfig: boolean,
    hasPayUConfig: boolean,
  ) {
    if (hasEPaycoConfig && hasPayUConfig) {
      throw new BadRequestException(
        'La tienda no puede tener configuraciones para ambas pasarelas a la vez.',
      );
    }
  }

  private validateExistPayConfigs(hasPaymentConfig: boolean) {
    if (!hasPaymentConfig)
      throw new BadRequestException(
        'Se requiere al menos una configuración de pago para la tienda.',
      );
  }

  private validateEPaycoConfig(
    settingsEPayco: PaymentSettingsePayco,
    gatewayName: GatewayName,
  ): void {
    if (gatewayName !== GatewayName.ePayco)
      throw new BadRequestException(
        'Agrega las configuraciones correctas para PayU.',
      );
    if (!settingsEPayco.publicKey)
      throw new BadRequestException(
        'La configuración de EPayco debe contener publicKey',
      );
  }

  private validatePayUConfig(
    settingsPayU: PaymentSettingsPayU,
    gatewayName: GatewayName,
  ): void {
    if (gatewayName !== GatewayName.PayU)
      throw new BadRequestException(
        'Agrega las configuraciones correctas para ePayco.',
      );
    const { accountId, apiKey, merchantId, apiLogin } = settingsPayU;
    const hasAllRequiredFields = accountId && apiKey && merchantId && apiLogin;
    if (!hasAllRequiredFields) {
      throw new BadRequestException(
        'La configuración de PayU debe contener accountId, apiKey, merchantId y apiLogin.',
      );
    }
  }

  private buildUpdateQuery(
    updateStoreConfigDto: UpdateStoreConfigDto,
  ): UpdateQuery<StoreConfigDocument> {
    let set = {};

    if (updateStoreConfigDto.settingsePayco) {
      set = { settingsePayco: { ...updateStoreConfigDto.settingsePayco } };
    }

    if (updateStoreConfigDto.settingsPayU) {
      set = { settingsPayU: { ...updateStoreConfigDto.settingsPayU } };
    }

    const update: UpdateQuery<StoreConfigDocument> = {
      $set: set,
      ...updateStoreConfigDto,
    };

    return update;
  }
}
