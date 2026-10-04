import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFilter } from 'mongoose';

import { PaginateResult, toEntity } from '@common/database';
import { FilterDto } from '@common/dto';
import { Status } from '@common/enums';

import {
  CATEGORY_NAME_EXIST,
  CATEGORY_NOT_FOUND,
} from './constants/categories.constants';

import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { CategoriesRepository } from './repositories/categories.repository';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find({});
  }

  async findPaginate(
    query: FilterDto<Category>,
  ): Promise<PaginateResult<Category>> {
    return await this.categoriesRepository.findPaginate(query, {
      populate: [{ path: 'subcategories', select: 'name' }],
    });
  }

  async findOneByQuery(query: QueryFilter<Category>): Promise<Category | null> {
    const category = await this.categoriesRepository.findOne(query);

    if (category) await this.populateDoc(category);

    return category;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneById(id);

    if (!category) throw new NotFoundException(CATEGORY_NOT_FOUND);

    await this.populateDoc(category);

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;
    await this.validateUniqueName(name, null);
    // El DTO valida las refs como strings y Mongoose las castea a ObjectId.
    const category = await this.categoriesRepository.create(
      toEntity<Category>(createCategoryDto),
    );

    return await this.populateDoc(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const categoryExist = await this.findById(id);
    const { name, status } = updateCategoryDto;

    if (name) await this.validateUniqueName(name, id);

    if (status !== undefined) {
      await this.validateUniqueName(categoryExist.name, id);
    }

    return await this.categoriesRepository.findByIdAndUpdate(
      id,
      updateCategoryDto,
      {
        new: true,
        strictQuery: true,
        populate: [{ path: 'subcategories', select: 'name' }],
      },
    );
  }

  async remove(id: string) {
    await this.findById(id);

    return await this.categoriesRepository.findByIdAndDelete(id);
  }

  /**
   * * PRIVATE METHODS
   */

  private async validateUniqueName(
    name: string,
    categoryId: string | null,
  ): Promise<void> {
    const category = await this.findOneByQuery({
      name,
      _id: { $ne: categoryId },
      status: Status.ACTIVE,
    });

    if (category) {
      throw new BadRequestException(CATEGORY_NAME_EXIST);
    }
  }

  async populateDoc(category: CategoryDocument) {
    return await category.populate({ path: 'subcategories', select: 'name' });
  }
}
