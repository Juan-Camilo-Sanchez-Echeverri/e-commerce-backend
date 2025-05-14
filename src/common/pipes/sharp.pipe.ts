import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { mkdirSync, unlinkSync } from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File[], Promise<string[]>>
{
  async transform(files: Express.Multer.File[]): Promise<string[]> {
    const outputDir = path.join('uploads/products');
    mkdirSync(outputDir, { recursive: true });

    this.validateFiles(files);

    const processedFiles: string[] = [];

    for (const file of files) {
      this.validateFile(file);

      const filename = `${uuid()}.webp`;
      const outputPath = path.join(outputDir, filename);

      await sharp(file.path).resize(800).webp({ effort: 3 }).toFile(outputPath);
      unlinkSync(file.path);

      processedFiles.push(`/resources/products/${filename}`);
    }

    return processedFiles;
  }

  private validateFiles(files: Express.Multer.File[]): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files must be provided');
    }

    if (!Array.isArray(files)) {
      throw new BadRequestException('Files must be an array');
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      throw new BadRequestException('Only image files are allowed!');
    }

    if (!file.path) {
      throw new BadRequestException('File path is not available');
    }
  }
}
