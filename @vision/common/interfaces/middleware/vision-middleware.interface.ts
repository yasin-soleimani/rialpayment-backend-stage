import { MiddlewareFunction } from '@vision/common/interfaces/middleware/middleware.interface';

export interface VisionMiddleware {
  resolve(...args: any[]): MiddlewareFunction | Promise<MiddlewareFunction>;
}
