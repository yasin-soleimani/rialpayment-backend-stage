import { Type } from '@vision/common/interfaces/type.interface';
import { RouteInfo } from '@vision/common/interfaces/middleware/middleware-configuration.interface';
import { MiddlewareConsumer } from '@vision/common/interfaces/middleware/middleware-consumer.interface';

export interface MiddlewareConfigProxy {
  /**
   * Delegates custom arguments to the `resolve()` method of the middleware.
   *
   * @param  {} ...data
   * @returns {MiddlewareConfigProxy}
   */
  with(...data: any[]): MiddlewareConfigProxy;

  /**
   * Excludes routes from the currently processed middleware.
   * This excluded route has to use an exact same route path.
   *
   * @param  {} ...routes
   * @returns {MiddlewareConfigProxy}
   */
  exclude(...routes: (string | RouteInfo)[]): MiddlewareConfigProxy;

  /**
   * Attaches passed either routes or controllers to the currently configured middleware.
   * If you pass a class, Vision would attach middleware to every path defined within this controller.
   *
   * @param  {} ...routes
   * @returns {MiddlewareConsumer}
   */
  forRoutes(...routes: (string | Type<any> | RouteInfo)[]): MiddlewareConsumer;
}
