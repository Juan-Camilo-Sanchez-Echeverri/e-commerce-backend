import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';

import { Roles } from '@common/decorators';

import { CreateSubcategoryDto, UpdateSubcategoryDto } from './dto';
import { SubcategoriesService } from './subcategories.service';
import { FilterDto } from '../../common/dto';
import { Subcategory } from './schemas/subcategory.schema';

@Roles('Admin')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Post()
  async create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(createSubcategoryDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterDto<Subcategory>) {
    return this.subcategoriesService.findPaginate(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subcategoriesService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.subcategoriesService.update(id, updateSubcategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subcategoriesService.remove(id);
  }
}
