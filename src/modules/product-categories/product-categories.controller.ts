import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto';
import { ProductCategoryDocument } from './schemas/product-category.schema';
import { ProductCategoriesService } from './product-categories.service';

import { Public, Roles } from '../../common/decorators';
import { generateFileNameAndPath, fileFilter } from '../../common/helpers';
import { Role } from '../../common/enums';

import { S3Service } from '../s3/s3.service';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @Roles(Role.Supervisor)
  async findAll(): Promise<ProductCategoryDocument[]> {
    return await this.productCategoriesService.findAll();
  }

  @Public()
  @Get('public')
  async findPublic(): Promise<ProductCategoryDocument[]> {
    return this.productCategoriesService.findAll();
  }

  @Get(':categoryId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async findOne(
    @Param('categoryId') categoryId: string,
  ): Promise<ProductCategoryDocument> {
    return await this.productCategoriesService.findOne(categoryId);
  }

  @Post()
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  async create(
    @Body()
    createProductCategoryDto: CreateProductCategoryDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ProductCategoryDocument> {
    const categoryNew = await this.productCategoriesService.create(
      createProductCategoryDto,
    );

    if (image && categoryNew) {
      const { path } = generateFileNameAndPath(image, 'categories');
      categoryNew.image = await this.s3Service.uploadFile(image, path);
      await categoryNew.save();
    }
    return categoryNew;
  }

  @Patch(':categoryId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  async update(
    @Param('categoryId') categoryId: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const category = await this.productCategoriesService.findOne(categoryId);

    if (image) {
      const { path } = generateFileNameAndPath(image, 'categories');
      if (category.image) await this.s3Service.deleteFile(category.image);

      const imageUrl = await this.s3Service.uploadFile(image, path);
      updateProductCategoryDto.image = imageUrl;
    }
    return await this.productCategoriesService.update(
      categoryId,
      updateProductCategoryDto,
    );
  }

  @Delete(':categoryId')
  @Roles(Role.Supervisor, Role.Admin, Role.Manager)
  async remove(@Param('categoryId') categoryId: string) {
    const category = await this.productCategoriesService.findOne(categoryId);

    if (category.image) {
      await this.s3Service.deleteFile(category.image);
    }

    return await this.productCategoriesService.remove(categoryId);
  }
}
