import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { Roles, Public } from '@common/decorators';
import { Status } from '@common/enums';
import { FilterDto } from '@common/dto';

import { ValidateProductPipe } from '../pipes/validate-product.pipe';
import { CreateProductDto, UpdateProductDto } from '../dto';

import { ProductsService } from '../products.service';
import { ProductDocument } from '../schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('search')
  @Roles('Admin')
  async findAll(@Body() query: FilterDto<ProductDocument>) {
    return await this.productsService.findPaginate(query);
  }

  @Public()
  @Post('public')
  async findPublic(@Body() query: FilterDto<ProductDocument>) {
    query.data = { ...query.data, status: 'active' };
    return await this.productsService.findPaginate(query);
  }

  @Public()
  @Get('public/:id')
  async findOnePublic(@Param('id') id: string) {
    return await this.productsService.findById(id);
  }

  @Get(':productId')
  @Roles('Admin')
  async findOne(@Param('productId') productId: string) {
    return await this.productsService.findById(productId);
  }

  @Post()
  @Roles('Admin')
  async create(@Body(ValidateProductPipe) createProductDto: CreateProductDto) {
    return await this.productsService.create({
      ...createProductDto,
      status: Status.INACTIVE,
    });
  }

  @Patch(':productId')
  @Roles('Admin')
  async update(
    @Param('productId') productId: string,
    @Body(ValidateProductPipe) updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(productId, updateProductDto);
  }

  @Delete(':productId')
  @Roles('Admin')
  async remove(@Param('productId') productId: string) {
    return await this.productsService.update(productId, {
      status: Status.DELETED,
    });
  }
}
