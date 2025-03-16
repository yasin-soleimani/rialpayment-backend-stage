import { Injectable, VisionMiddleware, MiddlewareFunction } from '@vision/common';

@Injectable()
export class LoggerMiddleware implements VisionMiddleware {
  resolve(context: string): MiddlewareFunction {
    return (req, res, next) => {
      console.log(res + ` Request...`);
      next();
    };
  }
}
