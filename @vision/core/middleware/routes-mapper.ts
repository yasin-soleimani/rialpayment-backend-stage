import { RequestMethod } from '@vision/common';
import { PATH_METADATA } from '@vision/common/constants';
import { RouteInfo, Type } from '@vision/common/interfaces';
import { isString, isUndefined, validatePath } from '@vision/common/utils/shared.utils';
import 'reflect-metadata';
import { VisionContainer } from '@vision/core/injector/container';
import { MetadataScanner } from '@vision/core/metadata-scanner';
import { RouterExplorer } from '@vision/core/router/router-explorer';

export class RoutesMapper {
  private readonly routerExplorer: RouterExplorer;

  constructor(container: VisionContainer) {
    this.routerExplorer = new RouterExplorer(new MetadataScanner(), container);
  }

  public mapRouteToRouteInfo(
    route: Type<any> | RouteInfo | string,
  ): RouteInfo[] {
    if (isString(route)) {
      return [
        {
          path: this.validateRoutePath(route),
          method: RequestMethod.ALL,
        },
      ];
    }
    const routePath: string = Reflect.getMetadata(PATH_METADATA, route);
    if (this.isRouteInfo(routePath, route)) {
      return [
        {
          path: this.validateRoutePath(route.path),
          method: route.method,
        },
      ];
    }
    const paths = this.routerExplorer.scanForPaths(
      Object.create(route),
      route.prototype,
    );
    return paths.map(item => ({
      path:
        this.validateGlobalPath(routePath) + this.validateRoutePath(item.path),
      method: item.requestMethod,
    }));
  }

  private isRouteInfo(
    path: string | undefined,
    objectOrClass: Function | RouteInfo,
  ): objectOrClass is RouteInfo {
    return isUndefined(path);
  }

  private validateGlobalPath(path: string): string {
    const prefix = validatePath(path);
    return prefix === '/' ? '' : prefix;
  }

  private validateRoutePath(path: string): string {
    return validatePath(path);
  }
}
