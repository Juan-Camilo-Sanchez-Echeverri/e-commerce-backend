import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        for (const key in data) {
          if (data[key]?.password) data[key].password = undefined;
        }

        return {
          success: true,
          data: data?.toObject ? data.toObject() : data,
        };
      }),
    );
  }
}
