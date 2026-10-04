import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { Public, Roles } from '@common/decorators';

import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';
import { PaginateResult } from 'mongoose';
import { ValidateSubcategoryPipe } from './pipes/validate-subcategory.pipe';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles('Admin')
  async findAll(): Promise<PaginateResult<Category>> {
    return await this.categoriesService.findPaginate({});
  }

  @Public()
  @Get('public')
  async findPublic(): Promise<PaginateResult<Category>> {
    return this.categoriesService.findPaginate({ data: { status: 'active' } });
  }

  @Get(':categoryId')
  @Roles('Admin')
  async findOne(@Param('categoryId') categoryId: string): Promise<Category> {
    return await this.categoriesService.findById(categoryId);
  }

  @Post()
  @Roles('Admin')
  async create(
    @Body(ValidateSubcategoryPipe)
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Patch(':categoryId')
  @Roles('Admin')
  async update(
    @Param('categoryId') categoryId: string,
    @Body(ValidateSubcategoryPipe) updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(categoryId, updateCategoryDto);
  }

  @Delete(':categoryId')
  @Roles('Admin')
  async remove(@Param('categoryId') categoryId: string) {
    return await this.categoriesService.remove(categoryId);
  }
}
