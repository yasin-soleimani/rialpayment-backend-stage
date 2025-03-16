import { RequestMethod } from '@vision/common';
import { flatten } from '@vision/common/decorators/core/dependencies.decorator';
import { MiddlewareConsumer, Type } from '@vision/common/interfaces';
import { MiddlewareConfigProxy, RouteInfo } from '@vision/common/interfaces/middleware';
import { MiddlewareConfiguration } from '@vision/common/interfaces/middleware/middleware-configuration.interface';
import { BindResolveMiddlewareValues } from '@vision/common/utils/bind-resolve-values.util';
import { isNil } from '@vision/common/utils/shared.utils';
import { RoutesMapper } from '@vision/core/middleware/routes-mapper';
import { filterMiddleware } from '@vision/core/middleware/utils';

export class MiddlewareBuilder implements MiddlewareConsumer {
  private readonly middlewareCollection = new Set<MiddlewareConfiguration>();
  constructor(private readonly routesMapper: RoutesMapper) {}

  public apply(
    ...middleware: Array<Type<any> | Function | any>
  ): MiddlewareConfigProxy {
    return new MiddlewareBuilder.ConfigProxy(this, flatten(middleware));
  }

  public build() {
    return [...this.middlewareCollection];
  }

  private bindValuesToResolve(
    middleware: Type<any> | Type<any>[],
    resolveParams: any[],
  ) {
    if (isNil(resolveParams)) {
      return middleware;
    }
    const bindArgs = BindResolveMiddlewareValues(resolveParams);
    return [].concat(middleware).map(bindArgs);
  }

  private static ConfigProxy = class implements MiddlewareConfigProxy {
    private contextParameters = null;
    private excludedRoutes: RouteInfo[] = [];
    private includedRoutes: any[];

    constructor(private readonly builder: MiddlewareBuilder, middleware) {
      this.includedRoutes = filterMiddleware(middleware);
    }

    public getExcludedRoutes(): RouteInfo[] {
      return this.excludedRoutes;
    }

    public with(...args): MiddlewareConfigProxy {
      this.contextParameters = args;
      return this;
    }

    public exclude(
      ...routes: Array<string | RouteInfo>
    ): MiddlewareConfigProxy {
      const { routesMapper } = this.builder;
      this.excludedRoutes = this.mapRoutesToFlatList(
        routes.map(route => routesMapper.mapRouteToRouteInfo(route)),
      );
      return this;
    }

    public forRoutes(
      ...routes: Array<string | Type<any> | RouteInfo>
    ): MiddlewareConsumer {
      const {
        middlewareCollection,
        bindValuesToResolve,
        routesMapper,
      } = this.builder;

      const forRoutes = this.mapRoutesToFlatList(
        routes.map(route => routesMapper.mapRouteToRouteInfo(route)),
      );
      const configuration = {
        middleware: bindValuesToResolve(
          this.includedRoutes,
          this.contextParameters,
        ),
        forRoutes: forRoutes.filter(route => !this.isRouteExcluded(route)),
      };
      middlewareCollection.add(configuration);
      return this.builder;
    }

    private mapRoutesToFlatList(forRoutes): RouteInfo[] {
      return forRoutes.reduce((a, b) => a.concat(b));
    }

    private isRouteExcluded(routeInfo: RouteInfo): boolean {
      const pathLastIndex = routeInfo.path.length - 1;
      const validatedRoutePath =
        routeInfo.path[pathLastIndex] === '/'
          ? routeInfo.path.slice(0, pathLastIndex)
          : routeInfo.path;

      return this.excludedRoutes.some(excluded => {
        const isPathEqual = validatedRoutePath === excluded.path;
        if (!isPathEqual) {
          return false;
        }
        return (
          routeInfo.method === excluded.method ||
          excluded.method === RequestMethod.ALL
        );
      });
    }
  };
}
