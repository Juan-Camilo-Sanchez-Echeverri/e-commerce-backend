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

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    await this.cleanupUploadedFiles(request);

    const status: HttpStatus =
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

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const baseMessage = this.extractMessage(exceptionResponse);
    const messageException = this.getFormattedMessage(baseMessage);

    return response.status(status).json({
      success: false,
      message: messageException,
      data: null,
    });
  }

  private extractMessage(response: unknown): string | string[] {
    if (typeof response === 'object' && 'message' in response!) {
      return response.message as string | string[];
    }

    return response as string;
  }

  private getFormattedMessage(message: string | string[]) {
    return typeof message === 'string' && message.includes('ENOENT')
      ? 'File not found'
      : message;
  }

  private async cleanupUploadedFiles(request: Request): Promise<void> {
    const file = (request.file as Express.Multer.File) || null;
    const files = (request.files as Express.Multer.File[]) || [];

    const allFiles = file ? [file] : files;

    await Promise.all(
      allFiles.map((file) => {
        if (file.path) {
          const fullPath = path.join(process.cwd(), file.path);
          unlink(fullPath).catch(() => {});
        }
      }),
    );
  }
}
