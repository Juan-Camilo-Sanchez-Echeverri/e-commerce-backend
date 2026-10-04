import { applyDecorators, Type } from '@nestjs/common';

import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginationResponse } from '../../responses';

export const ApiCreatedResponseWrapper = <TModel>(model: Type<TModel>) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      description: 'Created successfully',
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );
};

export const ApiNoContentResponseWrapper = () => {
  return applyDecorators(ApiNoContentResponse({ description: 'No content' }));
};

interface ApiOkResponseOptions {
  isPaginate: boolean;
}

export const ApiOkResponseWrapper = <TModel extends Type>(
  model: TModel,
  options: ApiOkResponseOptions,
) => {
  const { isPaginate } = options;

  return applyDecorators(
    ApiExtraModels(PaginationResponse, model),
    ApiOkResponse({
      description: 'Request was successful',
      schema: isPaginate
        ? {
            allOf: [
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                },
              },
              {
                $ref: getSchemaPath(PaginationResponse),
              },
            ],
          }
        : {
            $ref: getSchemaPath(model),
          },
    }),
  );
};
