import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { envs } from './envs';

export const corsConfig: CorsOptions = {
  origin: [...envs.allowedOrigins],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
};
