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

import { Roles, Public } from '../../common/decorators';

import { FilterDto } from '../../common/dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @Roles('Admin')
  async findAll(@Query() query: FilterDto<OfferDocument>) {
    return await this.offersService.findPaginate(query);
  }

  @Public()
  @Get('public')
  async findPublic(@Query() query: FilterDto<OfferDocument>) {
    return await this.offersService.findPaginate(query);
  }

  @Get(':offerId')
  @Roles('Admin')
  async findOne(@Param('offerId') offerId: string): Promise<OfferDocument> {
    return await this.offersService.findOneById(offerId);
  }

  @Post()
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<OfferDocument> {
    if (!image) throw new BadRequestException('Imagen no proporcionada');

    return await this.offersService.create(createOfferDto);
  }

  @Patch(':offerId')
  @Roles('Admin')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('offerId') offerId: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ): Promise<OfferDocument | null> {
    const offer = await this.offersService.findOneById(offerId);

    return await this.offersService.update(offer, updateOfferDto);
  }

  @Delete(':offerId')
  @Roles('Admin')
  async remove(
    @Param('offerId') offerId: string,
  ): Promise<OfferDocument | null> {
    return await this.offersService.remove(offerId);
  }
}
