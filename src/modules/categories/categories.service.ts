import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';

import {
  CATEGORY_NAME_EXIST,
  CATEGORY_NOT_FOUND,
} from './constants/categories.constants';

import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './schemas/category.schema';
import { FilterDto } from '@common/dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: PaginateModel<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryModel.find();
  }

  async findPaginate(
    query: FilterDto<Category>,
  ): Promise<PaginateResult<Category>> {
    const { data, limit, page } = query;

    return await this.categoryModel.paginate(data, {
      limit,
      page,
      populate: [{ path: 'subcategories', select: 'name' }],
    });
  }

  async findOneByQuery(query: FilterQuery<Category>): Promise<Category | null> {
    const category = await this.categoryModel.findOne(query);

    if (category) await this.populateDoc(category);

    return category;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);

    if (!category) throw new NotFoundException(CATEGORY_NOT_FOUND);

    await this.populateDoc(category);

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;
    await this.validateUniqueName(name, null);
    const category = await this.categoryModel.create(createCategoryDto);

    return await this.populateDoc(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const categoryExist = await this.findById(id);
    const { name, status } = updateCategoryDto;

    if (name) await this.validateUniqueName(name, id);

    if (status !== undefined) {
      await this.validateUniqueName(categoryExist.name, id);
    }

    return await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, {
      new: true,
      strictQuery: true,
      populate: [{ path: 'subcategories', select: 'name' }],
    });
  }

  async remove(id: string) {
    await this.findById(id);

    return this.categoryModel.findByIdAndDelete(id);
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
      status: 'active',
    });

    if (category) {
      throw new BadRequestException(CATEGORY_NAME_EXIST);
    }
  }

  async populateDoc(category: Category) {
    return await category.populate({ path: 'subcategories', select: 'name' });
  }
}
