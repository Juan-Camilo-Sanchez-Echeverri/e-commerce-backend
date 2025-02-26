import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';

import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductDocument } from './schemas/product.schema';
import { ProductsService } from './products.service';

import { S3Service } from '../s3/s3.service';

import { Roles, Public } from '../../common/decorators';

import { Role } from '../../common/enums';

import { fileFilter, generateFileNameAndPath } from '../../common/helpers';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @Roles(Role.Supervisor)
  async findAll(): Promise<ProductDocument[]> {
    return await this.productsService.findAll();
  }

  @Public()
  @Get('public')
  async findPublic() {
    return await this.productsService.findPublic();
  }

  @Get('public/:id')
  @Public()
  async findOnePublic(@Param('id') id: string): Promise<ProductDocument> {
    return await this.productsService.findOne(id);
  }

  @Get(':productId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async findOne(
    @Param('productId') productId: string,
  ): Promise<ProductDocument> {
    return await this.productsService.findOne(productId);
  }

  @Post()
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    if (images.length === 0 || !images)
      throw new BadRequestException('No se proporcionaron imágenes');

    for (const image of images) {
      fileFilter(null, image, (error) => {
        if (error) throw new UnsupportedMediaTypeException(error.message);
      });
    }

    const newProduct = await this.productsService.create(createProductDto);
    if (newProduct) {
      for (const image of images) {
        const { path } = generateFileNameAndPath(image, 'products');
        const imageUrl = await this.s3Service.uploadFile(image, path);
        newProduct.images.push(imageUrl);
        await newProduct.save();
      }
      return newProduct;
    }
  }

  @Patch(':productId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const product = await this.productsService.findOne(productId);

    for (const image of product.images) {
      if (!updateProductDto.images!.includes(image)) {
        await this.s3Service.deleteFile(image);
      }
    }

    if (images) {
      for (const image of images) {
        const { path } = generateFileNameAndPath(image, 'products');
        const imageUrl = await this.s3Service.uploadFile(image, path);
        if (!updateProductDto.images) {
          updateProductDto.images = [];
        }
        updateProductDto.images.push(imageUrl);
      }
    }

    return await this.productsService.update(productId, updateProductDto);
  }

  @Patch(':productId/qualification')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager, Role.Customer)
  async updateQualificationsAverage(
    @Param('productId') productId: string,
    @Body('qualification') qualification: number,
  ) {
    return await this.productsService.updateQualificationAverage(
      productId,
      qualification,
    );
  }

  @Delete(':productId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async remove(@Param('productId') productId: string) {
    const { images } = await this.productsService.findOne(productId);
    for (const image of images) {
      await this.s3Service.deleteFile(image);
    }
    return await this.productsService.remove(productId);
  }
}
