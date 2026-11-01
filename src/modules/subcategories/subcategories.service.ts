import { Injectable, NotFoundException } from '@nestjs/common';

import { QueryFilter } from 'mongoose';

import { PaginateResult } from '@common/database';
import { FilterDto } from '@common/dto';

import { CreateSubcategoryDto, UpdateSubcategoryDto } from './dto';

import { SubcategoriesRepository } from './repositories/subcategories.repository';
import { Subcategory } from './schemas/subcategory.schema';

@Injectable()
export class SubcategoriesService {
  constructor(
    private readonly subcategoriesRepository: SubcategoriesRepository,
  ) {}

  async create(
    createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<Subcategory> {
    return await this.subcategoriesRepository.create(createSubcategoryDto);
  }

  async findAll(): Promise<Subcategory[]> {
    return await this.subcategoriesRepository.find({});
  }

  async findPaginate(
    filterDto: FilterDto<Subcategory>,
  ): Promise<PaginateResult<Subcategory>> {
    return await this.subcategoriesRepository.findPaginate(filterDto);
  }

  async findOne(query: QueryFilter<Subcategory>): Promise<Subcategory | null> {
    return await this.subcategoriesRepository.findOne(query);
  }

  async findById(id: string): Promise<Subcategory> {
    const subcategory = await this.subcategoriesRepository.findOneById(id);

    if (!subcategory) throw new NotFoundException('Subcategory not found');

    return subcategory;
  }

  async update(
    id: string,
    updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<Subcategory> {
    await this.findById(id);

    const updatedSubcategory =
      await this.subcategoriesRepository.findByIdAndUpdate(
        id,
        updateSubcategoryDto,
      );

    if (!updatedSubcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    return updatedSubcategory;
  }

  async remove(id: string): Promise<Subcategory> {
    await this.findById(id);

    const subcategory =
      await this.subcategoriesRepository.findByIdAndDelete(id);

    if (!subcategory) throw new NotFoundException('Subcategory not found');

    return subcategory;
  }
}
