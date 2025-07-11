import { createHash } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

import { NextFunction, Request, Response } from 'express';

import { NestMiddleware } from '@nestjs/common';

export enum AsyncStorageKeys {
  URL = 'url',
}

export const asyncLocalStorage = new AsyncLocalStorage<
  Map<keyof typeof AsyncStorageKeys, string>
>();

export class AsyncLocalStorageMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    asyncLocalStorage.run(new Map(), () => {
      const store = asyncLocalStorage.getStore();
      const reqHash = createHash('sha256')
        .update(req.originalUrl)
        .digest('hex');

      if (store) store.set('URL', reqHash);

      next();
    });
  }

  static getStore() {
    return asyncLocalStorage.getStore();
  }
}
