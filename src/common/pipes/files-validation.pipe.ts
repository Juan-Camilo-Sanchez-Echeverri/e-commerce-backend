import {
  PipeTransform,
  Injectable,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { fileFilter } from '@common/helpers';

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  transform(value: Array<Express.Multer.File>) {
    if (!value) return value;

    this.validateQuantity(value);

    this.validMaxSize(value);

    for (const file of value) {
      fileFilter(null, file, (error) => {
        if (error) throw new UnsupportedMediaTypeException(error);
      });
    }

    return value;
  }

  private validMaxSize(files: Array<Express.Multer.File>) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const MAX_SIZE = 50 * 1024 * 1024;

    const EXCEEDS_LIMIT = 'Only files up to 50MB are allowed to be uploaded';

    if (totalSize > MAX_SIZE) throw new BadRequestException(EXCEEDS_LIMIT);
  }

  private validateQuantity(files: Array<Express.Multer.File>) {
    const MAX_FILES = 10;

    const EXCEEDS_LIMIT = 'Only up to 10 files may be uploaded';

    if (files.length > MAX_FILES) throw new BadRequestException(EXCEEDS_LIMIT);
  }
}
