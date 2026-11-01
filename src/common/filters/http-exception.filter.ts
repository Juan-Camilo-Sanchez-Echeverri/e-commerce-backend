import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ExecModes } from '../enums';
import { envs } from '@modules/config';
import { LogService } from '@modules/log/log.service';

interface ValidationError {
  property: string;
  errors: string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name, {
    timestamp: true,
  });

  constructor(private readonly logService: LogService) {}

  catch(exception: Error | HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isInternalServerError = Math.floor(status / 100) === 5;
    const isProduction = envs.nodeEnv === ExecModes.PROD;

    if (isInternalServerError && !isProduction) {
      this.logService.sendNotificationSlack(request, status, exception);
    }

    if (isInternalServerError || !isProduction) {
      this.logger.error(exception.message, exception.stack);
    }

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errors = this.extractErrors(exceptionResponse);
    const message = this.getFormattedMessage(
      this.extractMessage(exceptionResponse),
    );

    response.status(status).json({
      success: false,
      code: this.extractCode(exceptionResponse, exception, errors),
      status,
      message,
      data: null,
      ...(errors.length > 0 ? { errors } : {}),
    });
  }

  private extractMessage(response: unknown): string | string[] {
    if (typeof response === 'object' && 'message' in response!) {
      return response.message as string | string[];
    }

    return response as string;
  }

  private extractErrors(response: unknown): ValidationError[] {
    if (typeof response === 'object' && response && 'errors' in response) {
      return response.errors as ValidationError[];
    }

    return [];
  }

  /**
   * Builds a stable, machine-readable error code so clients can branch on it
   * instead of parsing human-readable messages.
   */
  private extractCode(
    response: unknown,
    exception: Error | HttpException,
    errors: ValidationError[],
  ): string {
    if (
      typeof response === 'object' &&
      response &&
      'code' in response &&
      response.code
    ) {
      return response.code as string;
    }

    const fields = errors.map((error) => error.property);

    if (fields.length === 1) {
      return `invalid-${this.toKebab(fields[0])}`;
    }

    if (fields.length > 1) {
      return 'validation-error';
    }

    const name = exception.constructor.name.replace(/Exception$/, '');
    if (name === 'Http') return 'internal-server-error';

    return name.replace(/([A-Z])/g, (_match: string, l: string, i: number) => {
      return (i > 0 ? '-' : '') + l.toLowerCase();
    });
  }

  private toKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  private getFormattedMessage(message: string | string[]) {
    return typeof message === 'string' && message.includes('ENOENT')
      ? 'File not found'
      : message;
  }
}
