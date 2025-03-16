import { Observable } from 'rxjs';
import { ExecutionContext } from '@vision/common/interfaces/features/execution-context.interface';

export interface VisionInterceptor<T = any, R = any> {
  intercept(
    context: ExecutionContext,
    call$: Observable<T>,
  ): Observable<R> | Promise<Observable<R>>;
}
