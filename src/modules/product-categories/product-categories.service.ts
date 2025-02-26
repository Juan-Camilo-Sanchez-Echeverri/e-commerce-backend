import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto';
import {
  ProductCategory,
  ProductCategoryDocument,
} from './schemas/product-category.schema';

import {
  PRODUCT_CATEGORY_NAME_EXIST,
  PRODUCT_CATEGORY_NOT_FOUND,
} from '../../common/constants';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectModel(ProductCategory.name)
    private readonly productCategoryModel: PaginateModel<ProductCategory>,
  ) {}

  async findAll(): Promise<ProductCategoryDocument[]> {
    return await this.productCategoryModel.find();
  }

  async findByQuery(
    query: FilterQuery<ProductCategory>,
  ): Promise<ProductCategoryDocument[]> {
    return await this.productCategoryModel.find(query);
  }

  async findOne(id: string): Promise<ProductCategoryDocument> {
    const productCategory = await this.productCategoryModel.findById(id);
    if (!productCategory) {
      throw new NotFoundException(PRODUCT_CATEGORY_NOT_FOUND);
    }
    return productCategory;
  }

  async create(
    createProductCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategoryDocument> {
    const { name } = createProductCategoryDto;
    await this.validateUniqueCategoryName(name, null);
    return this.productCategoryModel.create(createProductCategoryDto);
  }

  async update(id: string, updateProductCategoryDto: UpdateProductCategoryDto) {
    const categoryExist = await this.findOne(id);
    const { name, isActive } = updateProductCategoryDto;

    if (name) await this.validateUniqueCategoryName(name, id);

    if (isActive !== undefined) {
      await this.validateUniqueCategoryName(categoryExist.name, id);
    }

    return await this.productCategoryModel.findByIdAndUpdate(
      id,
      updateProductCategoryDto,
      { new: true },
    );
  }

  async remove(id: string) {
    return this.productCategoryModel.findByIdAndDelete(id);
  }

  /**
   * * PRIVATE METHODS
   */

  private async validateUniqueCategoryName(
    name: string,
    categoryId: string | null,
  ): Promise<void> {
    const category = await this.productCategoryModel.findOne({
      name,
      _id: { $ne: categoryId },
      isActive: true,
    });

    if (category) {
      throw new BadRequestException(PRODUCT_CATEGORY_NAME_EXIST);
    }
  }
}
