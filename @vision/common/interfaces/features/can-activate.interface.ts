import { Observable } from 'rxjs';
import { ExecutionContext } from '@vision/common/interfaces/features/execution-context.interface';

export interface CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>;
}
