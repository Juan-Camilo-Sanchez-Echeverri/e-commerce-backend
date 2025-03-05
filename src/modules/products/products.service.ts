import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { CreateProductDto, ParamsVariantDto, UpdateProductDto } from './dto';
import { Product, ProductDocument } from './schemas/product.schema';

import { FilterDto } from '@common/dto';
import { Status } from '@common/enums';

import {
  PRODUCT_NOT_FOUND,
  PRODUCT_NAME_EXIST,
} from './constants/products.constants';

import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: PaginateModel<ProductDocument>,
  ) {}

  async findPaginate(query: FilterDto<ProductDocument>) {
    const { data, limit, page } = query;

    return await this.productModel.paginate(data, {
      limit,
      page,
      populate: [
        { path: 'categories', select: 'name', match: { status: 'active' } },
        { path: 'subcategories', select: 'name', match: { status: 'active' } },
      ],
    });
  }

  async findOneByQuery(query: FilterQuery<ProductDocument> = {}) {
    const product = await this.productModel.findOne(query);

    if (product) await this.populateDoc(product);

    return product;
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);

    await this.populateDoc(product);

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const { name } = createProductDto;
    await this.validateNameExist(name, null);

    const product = await this.productModel.create(createProductDto);

    return await this.populateDoc(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const productExist = await this.findById(id);
    let updateQuery = {};
    const { name, categories, status, subcategories } = updateProductDto;

    if (name) await this.validateNameExist(name, id);

    if (status !== undefined) {
      await this.validateNameExist(productExist.name, id);
    }

    if (categories !== undefined && categories.length === 0) {
      updateQuery = { $unset: { categories: 1 }, ...updateProductDto };
    } else {
      updateQuery = updateProductDto;
    }

    if (subcategories !== undefined && subcategories.length === 0) {
      updateQuery = { $unset: { subcategories: 1 }, ...updateProductDto };
    } else {
      updateQuery = updateProductDto;
    }

    const result = await this.productModel.findByIdAndUpdate(id, updateQuery, {
      new: true,
    });

    await this.populateDoc(result!);

    return result;
  }

  async remove(id: string) {
    return await this.productModel.findByIdAndDelete(id);
  }

  // Métodos para variantes

  getVariant(product: ProductDocument, variantId: string) {
    const variant = product.variants.id(variantId);

    if (!variant) throw new NotFoundException('Variant not found');

    return variant;
  }

  async addVariant(productId: string, createVariantDto: CreateVariantDto) {
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { $push: { variants: createVariantDto }, status: Status.ACTIVE },
      { new: true },
    );

    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);

    return product.variants[product.variants.length - 1];
  }

  async updateVariant(
    params: ParamsVariantDto,
    updateVariantDto: UpdateVariantDto,
  ) {
    const { productId, variantId } = params;

    const product = await this.findById(productId);

    const variant = this.getVariant(product, variantId);

    if (updateVariantDto.images !== undefined) {
      variant.images = updateVariantDto.images;
    }

    return variant;
  }

  async removeVariant(params: ParamsVariantDto) {
    const { productId, variantId } = params;
    const product = await this.findById(productId);
    const variant = this.getVariant(product, variantId);

    await this.productModel.findOneAndUpdate(
      { _id: productId },
      { $pull: { variants: { _id: variantId } } },
      { new: true },
    );

    return variant;
  }

  async addVariantImages(params: ParamsVariantDto, imagePaths: string[]) {
    const { productId, variantId } = params;
    const product = await this.productModel.findOneAndUpdate(
      { _id: productId, 'variants._id': variantId },
      { $push: { 'variants.$.images': { $each: imagePaths } } },
      { new: true },
    );

    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);

    const variant = this.getVariant(product, variantId);

    return variant;
  }

  /**
   * * PRIVATE METHODS
   */

  private async validateNameExist(
    name: string,
    productId: string | null,
  ): Promise<void> {
    const product = await this.productModel.findOne({
      name,
      _id: { $ne: productId },
      status: 'active',
    });

    if (product) throw new BadRequestException(PRODUCT_NAME_EXIST);
  }

  private async populateDoc(product: ProductDocument) {
    return await product.populate([
      { path: 'categories', select: 'name', match: { status: 'active' } },
      { path: 'subcategories', select: 'name', match: { status: 'active' } },
    ]);
  }
}
