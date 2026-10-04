import { Controller, Get, Post, Body, Patch, Req } from '@nestjs/common';

import { CreateFavoriteDto, UpdateFavoriteDto } from './dto';

import { FavoritesService } from './favorites.service';

import { Roles } from '../../common/decorators';

import { Role } from '../../common/enums';

import { TransformDtoPipe } from './pipes/transform-dto.pipe';
import { UserDocument } from '../users/schemas/user.schema';
import { Request } from 'express';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Roles(Role.Customer)
  @Post()
  async create(@Body(TransformDtoPipe) createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Get('me')
  @Roles(Role.Customer)
  async findMe(@Req() req: Request) {
    const { _id } = req.user as UserDocument;
    return await this.favoritesService.findMe(String(_id));
  }

  @Patch()
  @Roles(Role.Customer)
  remove(@Body() removeFavoriteDto: UpdateFavoriteDto, @Req() req: Request) {
    const { _id } = req.user as UserDocument;
    return this.favoritesService.removeProduct(String(_id), removeFavoriteDto);
  }
}
