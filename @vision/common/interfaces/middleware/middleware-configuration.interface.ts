import { RequestMethod } from '@vision/common/enums';
import { Type } from '@vision/common/interfaces/type.interface';

export interface RouteInfo {
  path: string;
  method: RequestMethod;
}

export interface MiddlewareConfiguration<T = any> {
  middleware: T;
  forRoutes: (Type<any> | string | RouteInfo)[];
}
