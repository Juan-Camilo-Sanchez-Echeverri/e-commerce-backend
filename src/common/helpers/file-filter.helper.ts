import { UnsupportedMediaTypeException } from '@nestjs/common';
import { IMAGE_EXTENSIONS } from '../constants';

export const fileFilter = (
  req: Express.Request | null,
  file: Express.Multer.File,
  callback: (
    error: UnsupportedMediaTypeException | null,
    isValid: boolean,
  ) => void,
) => {
  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = IMAGE_EXTENSIONS;

  if (validExtensions.includes(fileExtension)) return callback(null, true);

  const error = new UnsupportedMediaTypeException(
    `The file extension is not valid. Only files are allowed ${Object.values(
      validExtensions,
    ).join(', ')}`,
  );

  callback(error, false);
};
