import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { NextFunction } from 'express';

import { Types } from 'mongoose';

export function validateMongo(error, doc, next: NextFunction): void {
  try {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      next(
        new BadRequestException(
          `There is already a registry with the same ${Object.keys(
            error.keyPattern,
          )} : ${Object.values(error.keyValue).join(', ')}`,
        ),
      );
    }

    if (error.name === 'ValidationError') {
      next(
        new BadRequestException(
          `Fields: ${Object.keys(error.errors).join(', ')} are required.`,
        ),
      );
    }
  } catch (error) {
    next(error);
  }
}

export function validateObjectId(id: string) {
  if (!id) throw new ForbiddenException('The required id');

  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('The id is not valid');
  }
}