import { INestApplication } from '@nestjs/common';

import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

const swaggerConfig = new DocumentBuilder()
  .setTitle('E-Commerce API')
  .setDescription('The API for the E-Commerce project')
  .setVersion('1.0.0')
  .addGlobalParameters({
    name: 'Accept-Language',
    in: 'header',
    required: false,
    schema: {
      type: 'string',
      default: 'es',
      enum: ['es', 'en'],
      example: 'es',
      description: 'Language preference for the response',
    },
  })
  .addGlobalResponse({
    status: 500,
    description: 'Internal Server Error',
    example: { code: null, message: 'Internal Server Error' },
  })
  .addBearerAuth()
  .build();

const swaggerDocOptions: SwaggerDocumentOptions = {
  ignoreGlobalPrefix: false,
};

export const setupSwagger = (app: INestApplication): void => {
  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerDocOptions,
  );

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
      tagsSorter: 'alpha',
    },
  });
};
