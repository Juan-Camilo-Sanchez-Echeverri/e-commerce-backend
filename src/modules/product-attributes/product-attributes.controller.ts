import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateProductAttributeDto, UpdateProductAttributeDto } from './dto';
import { ProductAttributeDocument } from './schemas/product-attribute.schema';
import { ProductAttributesService } from './product-attributes.service';

import { Roles } from '../../common/decorators';

import { Role } from '../../common/enums';

@Controller('product-attributes')
export class ProductAttributesController {
  constructor(
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  @Get()
  @Roles(Role.Supervisor)
  async findAll(): Promise<ProductAttributeDocument[]> {
    return await this.productAttributesService.findAll();
  }

  @Get(':attributeId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async findOne(
    @Param('attributeId') attributeId: string,
  ): Promise<ProductAttributeDocument> {
    return await this.productAttributesService.findOne(attributeId);
  }

  @Post()
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async create(
    @Body() createProductAttributeDto: CreateProductAttributeDto,
  ): Promise<ProductAttributeDocument> {
    return await this.productAttributesService.create(
      createProductAttributeDto,
    );
  }

  @Patch(':attributeId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async update(
    @Param('attributeId') attributeId: string,
    @Body() updateProductAttributeDto: UpdateProductAttributeDto,
  ) {
    return await this.productAttributesService.update(
      attributeId,
      updateProductAttributeDto,
    );
  }

  @Delete(':attributeId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async remove(@Param('attributeId') attributeId: string) {
    return await this.productAttributesService.remove(attributeId);
  }
}
