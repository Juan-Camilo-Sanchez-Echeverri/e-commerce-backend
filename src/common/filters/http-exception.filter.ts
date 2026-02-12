import { Response } from 'express';

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { ErrorsResponse } from '../responses/errors.response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorMessage = this.extractMessage(exceptionResponse);
    const errorCode = this.extractCode(exceptionResponse);
    const errors = this.extractErrors(exceptionResponse);

    const responseBody: ErrorsResponse = {
      code: errorCode,
      message: errorMessage,
      errors: errors.length > 0 ? errors : undefined,
    };

    return response.status(status).json(responseBody);
  }

  private extractMessage(response: string | object): string {
    if (typeof response === 'object' && 'message' in response) {
      return response.message as string;
    }

    return response as string;
  }

  private extractCode(response: string | object): number | null {
    if (typeof response === 'object' && 'code' in response) {
      return response.code as number;
    }
    return null;
  }

  private extractErrors(
    response: string | object,
  ): Array<{ property: string; errors: string[] }> {
    if (typeof response === 'object' && 'errors' in response) {
      return response.errors as Array<{ property: string; errors: string[] }>;
    }
    return [];
  }
}
