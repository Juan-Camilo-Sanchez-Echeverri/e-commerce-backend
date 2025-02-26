import { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

import { ExecModes } from '../enums';

import { envs } from '@modules/config';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logService: LogService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (envs.nodeEnv === ExecModes.LOCAL) {
      console.log(
        '##########################################################################',
      );
      console.log('DATE:', new Date().toISOString());
      console.log('PATH:', req.baseUrl);
      console.log('HEADERS:', req.headers);
      console.log('METHOD:', req.method);
      console.log('BODY:', req.body);
      console.log('QUERIES:', req.query);
      console.log('PARAMS:', req.params);
    } else {
      res.on('finish', () => this.logService.saveFileLog(req, res));
    }

    next();
  }
}
