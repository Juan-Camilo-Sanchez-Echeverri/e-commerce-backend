import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { unlink } from 'fs/promises';
import * as path from 'path';

import { ExecModes } from '../enums';
import { envs } from '@modules/config';
import { LogService } from '@modules/log/log.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name, {
    timestamp: true,
  });

  constructor(private readonly logService: LogService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    await this.cleanupUploadedFiles(request);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isInternalServerError = status === HttpStatus.INTERNAL_SERVER_ERROR;
    const isNotLocalEnvironment = envs.nodeEnv !== ExecModes.LOCAL;

    if (isInternalServerError && isNotLocalEnvironment) {
      this.logService.sendNotificationSlack(request, status, exception);
    }

    if (isInternalServerError || !isNotLocalEnvironment) {
      this.logger.error(exception.message, exception.stack);
    }

    const messageException =
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal Server Error'
        : exception?.response?.message || exception.message;

    return response.status(status).json({
      success: false,
      message: messageException,
      error: exception?.response?.error || exception.name,
      data: null,
    });
  }

  private async cleanupUploadedFiles(request: Request): Promise<void> {
    const files = (request.files as Express.Multer.File[]) || [];

    await Promise.all(
      files.map((file) => {
        if (file.path) {
          const fullPath = path.join(process.cwd(), file.path);
          console.log({ fullPath });

          return unlink(fullPath).catch((e) => {
            console.log(e);
          });
        }
      }),
    );
  }
}
