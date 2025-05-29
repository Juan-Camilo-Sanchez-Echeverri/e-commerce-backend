import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Data {
  [key: string]: unknown;
  toObject?: () => unknown;
}

interface ResponseData {
  success: boolean;
  data: Data;
}
@Injectable()
export class ResponseInterceptor<T extends Data>
  implements NestInterceptor<T, ResponseData>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData> {
    return next.handle().pipe(
      map((data: T) => {
        for (const key in data) {
          const value = data[key] as { password?: string };
          if (value && typeof value === 'object' && 'password' in value) {
            value.password = undefined;
          }
        }

        return {
          success: true,
          data: (data?.toObject ? data.toObject() : data) as Data,
        };
      }),
    );
  }
}
