import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';

import { FilterDto } from '@common/dto';

import { CreateSubcategoryDto, UpdateSubcategoryDto } from './dto';

import { Subcategory } from './schemas/subcategory.schema';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectModel(Subcategory.name)
    private subCategoryModel: PaginateModel<Subcategory>,
  ) {}

  async create(
    createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<Subcategory> {
    const createdSubCategory = new this.subCategoryModel(createSubcategoryDto);
    return createdSubCategory.save();
  }

  async findAll(): Promise<Subcategory[]> {
    return this.subCategoryModel.find();
  }

  async findPaginate(
    filterDto: FilterDto<Subcategory>,
  ): Promise<PaginateResult<Subcategory>> {
    const { page, limit, data } = filterDto;

    return this.subCategoryModel.paginate(data, { page, limit });
  }

  async findOne(query: FilterQuery<Subcategory>): Promise<Subcategory | null> {
    return await this.subCategoryModel.findOne(query);
  }

  async findById(id: string): Promise<Subcategory> {
    const subcategory = await this.subCategoryModel.findById(id);

    if (!subcategory) throw new NotFoundException('Subcategory not found');

    return subcategory;
  }

  async update(
    id: string,
    updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<Subcategory> {
    await this.findById(id);

    const updatedSubcategory = await this.subCategoryModel.findByIdAndUpdate(
      id,
      updateSubcategoryDto,
      { new: true },
    );

    return updatedSubcategory!;
  }

  async remove(id: string): Promise<Subcategory> {
    await this.findById(id);

    const category = await this.subCategoryModel.findByIdAndDelete(id);

    return category!;
  }
}
