import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { OfferDocument } from './schemas/offer.schema';
import { CreateOfferDto, UpdateOfferDto } from './dto';
import { OffersService } from './offers.service';

import { S3Service } from '../s3/s3.service';

import { Roles, Public } from '../../common/decorators';

import { FilterDto } from '../../common/dto';

import { Role } from '../../common/enums';

import { generateFileNameAndPath } from '../../common/helpers/path-files-upload.helper';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @Roles(Role.Admin, Role.Manager, Role.Agent)
  async findAll(@Query() query: FilterDto<OfferDocument>) {
    return await this.offersService.findPaginate(query);
  }

  @Public()
  @Get('public')
  async findPublic(@Query() query: FilterDto<OfferDocument>) {
    return await this.offersService.findPaginate(query);
  }

  @Get(':offerId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async findOne(@Param('offerId') offerId: string): Promise<OfferDocument> {
    return await this.offersService.findOneById(offerId);
  }

  @Post()
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<OfferDocument> {
    try {
      if (!image) throw new BadRequestException('Imagen no proporcionada');

      const { path } = generateFileNameAndPath(image, 'offers');
      const imageUrl = await this.s3Service.uploadFile(image, path);

      createOfferDto.image = imageUrl;

      return await this.offersService.create(createOfferDto);
    } catch (error) {
      if (image) await this.s3Service.deleteFile(createOfferDto.image);
      throw error;
    }
  }

  @Patch(':offerId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('offerId') offerId: string,
    @Body() updateOfferDto: UpdateOfferDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<OfferDocument | null> {
    try {
      const offer = await this.offersService.findOneById(offerId);

      if (image) {
        const { path } = generateFileNameAndPath(image, 'offers');
        if (offer.image) await this.s3Service.deleteFile(offer.image);

        const imageUrl = await this.s3Service.uploadFile(image, path);
        updateOfferDto.image = imageUrl;
      }

      return await this.offersService.update(offer, updateOfferDto);
    } catch (error) {
      if (image) await this.s3Service.deleteFile(updateOfferDto.image!);
      throw error;
    }
  }

  @Delete(':offerId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async remove(
    @Param('offerId') offerId: string,
  ): Promise<OfferDocument | null> {
    const { image } = await this.offersService.findOneById(offerId);
    if (image) await this.s3Service.deleteFile(image);
    return await this.offersService.remove(offerId);
  }
}
