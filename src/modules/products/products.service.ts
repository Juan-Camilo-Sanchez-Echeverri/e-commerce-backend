import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PopulateOptions } from 'mongoose';

import { CreateProductDto, ParamsVariantDto, UpdateProductDto } from './dto';
import { Product, ProductDocument } from './schemas/product.schema';

import { FilterDto } from '@common/dto';
import { Status } from '@common/enums';

import { OffersService } from '@modules/offers/offers.service';

import { CreateVariantDto, UpdateVariantDto } from './dto';

import { PRODUCT_NOT_FOUND } from './constants/products.constants';

@Injectable()
export class ProductsService {
  private readonly pathsPopulate: PopulateOptions[] = [
    { path: 'categories', select: 'name', match: { status: 'active' } },
    { path: 'subcategories', select: 'name', match: { status: 'active' } },
  ];

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: PaginateModel<ProductDocument>,
    private readonly offersService: OffersService,
  ) {}

  async findPaginate(query: FilterDto<ProductDocument>) {
    const { data, limit, page } = query;

    return await this.productModel.paginate(data, {
      limit,
      page,
      populate: this.pathsPopulate,
    });
  }

  async findPublic(query: FilterDto<ProductDocument>) {
    const { data, limit, page } = query;

    const products = await this.productModel.paginate(data, {
      limit,
      page,
      populate: this.pathsPopulate,
    });

    const formattedProducts = products.docs.map(async (product) => {
      const priceInOffer = await this.getPrice(product);

      return { ...product.toObject(), priceInOffer };
    });

    return {
      ...products,
      docs: await Promise.all(formattedProducts),
    };
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
    const product = await this.productModel.create(createProductDto);

    return await this.populateDoc(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    let updateQuery = {};

    const { categories, subcategories } = updateProductDto;

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

    return this.getVariant(product, variantId);
  }

  async updateStock(
    productId: string,
    variantId: string,
    size: string,
    qty: number,
  ): Promise<void> {
    const res = await this.productModel.updateOne(
      { _id: productId, 'variants._id': variantId },
      {
        $inc: {
          'variants.$.sizesStock.$[elem].stock': qty,
        },
      },
      { arrayFilters: [{ 'elem.size': size }] },
    );

    if (res.modifiedCount === 0) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }
  }

  async getPrice(product: ProductDocument): Promise<number | null> {
    const offer = await this.offersService.findOneByQuery({
      status: 'active',
      byProduct: product,
    });

    let price = product.price;

    if (!offer) return null;

    if (offer.discountPercentage) {
      price *= 1 - offer.discountPercentage / 100;
    }

    if (offer.discountAmount) {
      price = Math.max(0, price - offer.discountAmount);
    }

    return price;
  }

  /**
   * * PRIVATE METHODS
   */

  private async populateDoc(product: ProductDocument) {
    return await product.populate(this.pathsPopulate);
  }
}
