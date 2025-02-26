import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateProductAttributeDto, UpdateProductAttributeDto } from './dto';
import {
  ProductAttribute,
  ProductAttributeDocument,
} from './schemas/product-attribute.schema';

import {
  PRODUCT_ATTRIBUTE_NAME_EXIST,
  PRODUCT_ATTRIBUTE_NOT_FOUND,
} from '../../common/constants';

@Injectable()
export class ProductAttributesService {
  constructor(
    @InjectModel(ProductAttribute.name)
    private readonly productAttributeModel: Model<ProductAttribute>,
  ) {}

  async findAll(): Promise<ProductAttributeDocument[]> {
    return await this.productAttributeModel.find();
  }

  async findOne(id: string): Promise<ProductAttributeDocument> {
    const attribute = await this.productAttributeModel.findById(id);
    if (!attribute) throw new NotFoundException(PRODUCT_ATTRIBUTE_NOT_FOUND);
    return attribute;
  }

  async create(
    createProductAttributeDto: CreateProductAttributeDto,
  ): Promise<ProductAttributeDocument> {
    const { name } = createProductAttributeDto;
    await this.validateUniqueAttributeName(name, null);
    return await this.productAttributeModel.create(createProductAttributeDto);
  }

  async update(
    id: string,
    updateProductAttributeDto: UpdateProductAttributeDto,
  ) {
    const existAttribute = await this.findOne(id);
    const { name, isActive } = updateProductAttributeDto;

    if (name) await this.validateUniqueAttributeName(name, id);

    if (isActive !== undefined) {
      await this.validateUniqueAttributeName(existAttribute.name, id);
    }

    return await this.productAttributeModel.findByIdAndUpdate(
      id,
      updateProductAttributeDto,
      { new: true },
    );
  }

  async remove(id: string) {
    return this.productAttributeModel.findByIdAndDelete(id);
  }

  /**
   * * PRIVATE METHODS
   */

  private async validateUniqueAttributeName(
    name: string,
    attributeId: string | null,
  ): Promise<void> {
    const attribute = await this.productAttributeModel.findOne({
      name,
      _id: { $ne: attributeId },
      isActive: true,
    });

    if (attribute) {
      throw new BadRequestException(PRODUCT_ATTRIBUTE_NAME_EXIST);
    }
  }
}
