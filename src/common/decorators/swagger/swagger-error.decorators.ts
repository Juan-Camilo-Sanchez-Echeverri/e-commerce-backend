import { applyDecorators } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ServiceError } from '../../responses';

import { AuthErrors } from '@modules/auth/errors/auth.errors';

const ERRORS_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      property: { type: 'string' },
      errors: { type: 'array', items: { type: 'string' } },
    },
  },
};

const ERROR_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    code: { type: 'string' },
    status: { type: 'number' },
    message: { type: 'string' },
    data: { nullable: true },
    errors: ERRORS_SCHEMA,
  },
};

export const ApiAuthResponses = () => {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Unauthorized (missing or invalid token)',
      schema: ERROR_SCHEMA,
      examples: {
        missingToken: {
          summary: 'No token provided',
          value: AuthErrors.TOKEN_NOT_FOUND,
        },
        invalidToken: {
          summary: 'Malformed token',
          value: AuthErrors.INVALID_TOKEN,
        },
        expiredToken: {
          summary: 'Token has expired',
          value: AuthErrors.TOKEN_EXPIRED,
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden (insufficient role)',
      schema: ERROR_SCHEMA,
      example: {
        code: 'forbidden',
        status: 403,
        message: 'Forbidden resource',
        details: {},
      },
    }),
  );
};

export const ApiNotFoundResponseWrapper = (example: ServiceError) => {
  return ApiNotFoundResponse({
    description: 'Not Found (resource not found)',
    schema: ERROR_SCHEMA,
    example: { status: 404, ...example },
  });
};

export const ApiConflictResponseWrapper = (example: ServiceError) => {
  return ApiConflictResponse({
    description: 'Conflict – duplicate resource or business rule violation',
    schema: ERROR_SCHEMA,
    example: { status: 409, ...example },
  });
};

export const ApiValidationResponseWrapper = (example: ServiceError) => {
  return ApiBadRequestResponse({
    description: 'Bad Request – validation failed',
    schema: ERROR_SCHEMA,
    example: { status: 400, ...example },
  });
};

export const ApiBadRequestResponseWrapper = (example: ServiceError) => {
  return ApiBadRequestResponse({
    description: 'Bad Request – invalid request payload',
    schema: ERROR_SCHEMA,
    example: { status: 400, ...example },
  });
};
