import { Type } from '@vision/common/interfaces';
import { ArgumentsHost } from '@vision/common/interfaces/features/arguments-host.interface';

export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>;
  getHandler(): FunctionConstructor;
}
