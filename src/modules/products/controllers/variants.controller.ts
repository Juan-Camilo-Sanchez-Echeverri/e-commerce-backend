import { unlink } from 'fs/promises';
import * as path from 'path';

import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { SharpPipe } from '@common/pipes/';

import { CreateVariantDto, UpdateVariantDto } from '../dto';
import { ProductsService } from '../products.service';

@Controller('products/:productId/variants')
export class VariantsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, { dest: 'temp-uploads' }))
  async addVariant(
    @Param('productId') productId: string,
    @Body() createVariantDto: CreateVariantDto,
    @UploadedFiles(SharpPipe) urls: string[],
  ) {
    try {
      let variant = await this.productsService.addVariant(
        productId,
        createVariantDto,
      );

      variant = await this.productsService.addVariantImages(
        { productId, variantId: String(variant._id) },
        urls,
      );

      return variant;
    } catch (error) {
      await this.cleanupFiles(urls);
      throw error;
    }
  }

  @Patch(':variantId')
  async updateVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    const params = { productId, variantId };
    return this.productsService.updateVariant(params, updateVariantDto);
  }

  @Delete(':variantId')
  async removeVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    const params = { productId, variantId };
    const variant = await this.productsService.removeVariant(params);

    variant.images.forEach((image) => {
      image = image.replace('resources', 'uploads');
      unlink(path.join(process.cwd(), image)).catch(() => {});
    });
  }

  @Post(':variantId/upload')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadVariantImages(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @UploadedFiles(SharpPipe) processedFilenames: string[],
  ) {
    try {
      const params = { productId, variantId };
      return await this.productsService.addVariantImages(
        params,
        processedFilenames,
      );
    } catch (error) {
      await this.cleanupFiles(processedFilenames);

      throw error;
    }
  }

  private async cleanupFiles(urls: string[]): Promise<void> {
    await Promise.all(
      urls.map(async (fileUrl: string) => {
        const filePath = path.join(process.cwd(), fileUrl);
        return await unlink(filePath).catch(() => {});
      }),
    );
  }
}
