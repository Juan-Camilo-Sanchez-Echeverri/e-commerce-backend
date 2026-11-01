import { NextFunction } from 'express';

import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Types } from 'mongoose';

interface MongoError {
  name: string;
  code?: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  message?: string;
}

export function validateMongo<T>(
  error: MongoError,
  _document: T,
  next: NextFunction,
): void {
  try {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const duplicatedKey = Object.keys(error.keyPattern ?? {})[0];
      const duplicatedValue = error.keyValue?.[duplicatedKey] as string;

      const message = `There is already a registry with the same ${duplicatedKey}: ${duplicatedValue}`;

      return next(
        new ConflictException({
          code: `invalid-${duplicatedKey}`,
          message,
          errors: [{ property: duplicatedKey, errors: [message] }],
        }),
      );
    }

    if (error.name === 'ValidationError') {
      return next(
        new UnprocessableEntityException(
          `Fields: ${Object.keys(error.errors ?? {}).join(', ')} are required.`,
        ),
      );
    }

    if (error.name === 'StrictModeError') {
      const field = error.message?.match(/Path "(.+?)"/)?.[1];

      const message = field
        ? `Field "${field}" is not allowed in query`
        : 'Invalid field in query';

      return next(new UnprocessableEntityException(message));
    }

    return next();
  } catch (error) {
    next(error);
  }
}

export type PopulatedEntity<T, K extends keyof T = keyof T> =
  Types.ObjectId | Pick<T, K> | null;
