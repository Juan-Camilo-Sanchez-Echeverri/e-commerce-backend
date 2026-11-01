import {
  BadRequestException,
  UnsupportedMediaTypeException,
  applyDecorators,
  UseInterceptors,
  NestInterceptor,
  Type,
} from '@nestjs/common';

import {
  FileInterceptor,
  FilesInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import type { Request } from 'express';

import { memoryStorage } from 'multer';

export interface UploadConfig {
  /** 'single' = un archivo en campo definido; 'multiple' = varios en campo definido; 'any' = varios en cualquier campo */
  type: 'single' | 'multiple' | 'any';
  /** Campo (solo para single/multiple) */
  fieldName?: string;
  /** Máximo MB por archivo */
  maxSizeMB?: number;
  /** Tipos MIME permitidos */
  allowedMimeTypes?: string[];
  /** Máximo de archivos (solo para multiple) */
  maxCount?: number;
}

/**
 * Interceptor configurable para subidas:
 * - single: FileInterceptor
 * - multiple: FilesInterceptor
 * - any:    AnyFilesInterceptor
 */
export function UploadInterceptor(config: UploadConfig) {
  const storage = memoryStorage();

  const multerOptions = {
    storage,

    limits: {
      fileSize: (config.maxSizeMB ?? 5) * 1024 * 1024,
    },

    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: (err: Error | null, accept: boolean) => void,
    ) => {
      if (
        config.allowedMimeTypes &&
        !config.allowedMimeTypes.includes(file.mimetype)
      ) {
        return cb(
          new UnsupportedMediaTypeException(
            `File type not allowed: ${file.mimetype}`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  };

  let interceptor: Type<NestInterceptor>;

  switch (config.type) {
    case 'single':
      if (!config.fieldName) {
        throw new BadRequestException(
          `'fieldName' is required for type 'single'`,
        );
      }
      interceptor = FileInterceptor(config.fieldName, multerOptions);
      break;

    case 'multiple':
      if (!config.fieldName) {
        throw new BadRequestException(
          `'fieldName' is required for type 'multiple'`,
        );
      }
      interceptor = FilesInterceptor(
        config.fieldName,
        config.maxCount ?? 10,
        multerOptions,
      );
      break;

    case 'any':
      interceptor = AnyFilesInterceptor(multerOptions);
      break;

    default:
      throw new BadRequestException(
        `Type '${String(config.type)}' not supported`,
      );
  }

  return applyDecorators(UseInterceptors(interceptor));
}
