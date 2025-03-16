import { Injectable, VisionInterceptor, ExecutionContext, HttpStatus } from '@vision/common';
import { HttpException } from '@vision/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements VisionInterceptor {
  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
    return call$.pipe(catchError((err) => throwError(new HttpException('Message', HttpStatus.BAD_GATEWAY))));
  }
}
