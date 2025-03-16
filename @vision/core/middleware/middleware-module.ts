import { HttpServer } from '@vision/common';
import { RequestMethod } from '@vision/common/enums/request-method.enum';
import { MiddlewareConfiguration, RouteInfo } from '@vision/common/interfaces/middleware/middleware-configuration.interface';
import { VisionMiddleware } from '@vision/common/interfaces/middleware/vision-middleware.interface';
import { VisionModule } from '@vision/common/interfaces/modules/vision-module.interface';
import { Type } from '@vision/common/interfaces/type.interface';
import { isUndefined, validatePath } from '@vision/common/utils/shared.utils';
import { ApplicationConfig } from '@vision/core/application-config';
import { InvalidMiddlewareException } from '@vision/core/errors/exceptions/invalid-middleware.exception';
import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { ExceptionsHandler } from '@vision/core/exceptions/exceptions-handler';
import { VisionContainer } from '@vision/core/injector/container';
import { Module } from '@vision/core/injector/module';
import { RouterExceptionFilters } from '@vision/core/router/router-exception-filters';
import { RouterProxy } from '@vision/core/router/router-proxy';
import { MiddlewareBuilder } from '@vision/core/middleware/builder';
import { MiddlewareContainer, MiddlewareWrapper } from '@vision/core/middleware/container';
import { MiddlewareResolver } from '@vision/core/middleware/resolver';
import { RoutesMapper } from '@vision/core/middleware/routes-mapper';

export class MiddlewareModule {
  private readonly routerProxy = new RouterProxy();
  private routerExceptionFilter: RouterExceptionFilters;
  private routesMapper: RoutesMapper;
  private resolver: MiddlewareResolver;
  private config: ApplicationConfig;

  public async register(
    middlewareContainer: MiddlewareContainer,
    container: VisionContainer,
    config: ApplicationConfig,
  ) {
    const appRef = container.getApplicationRef();
    this.routerExceptionFilter = new RouterExceptionFilters(
      container,
      config,
      appRef,
    );
    this.routesMapper = new RoutesMapper(container);
    this.resolver = new MiddlewareResolver(middlewareContainer);
    this.config = config;

    const modules = container.getModules();
    await this.resolveMiddleware(middlewareContainer, modules);
  }

  public async resolveMiddleware(
    middlewareContainer: MiddlewareContainer,
    modules: Map<string, Module>,
  ) {
    await Promise.all(
      [...modules.entries()].map(async ([name, module]) => {
        const instance = module.instance;

        this.loadConfiguration(middlewareContainer, instance, name);
        await this.resolver.resolveInstances(module, name);
      }),
    );
  }

  public loadConfiguration(
    middlewareContainer: MiddlewareContainer,
    instance: VisionModule,
    module: string,
  ) {
    if (!instance.configure) return;

    const middlewareBuilder = new MiddlewareBuilder(this.routesMapper);
    instance.configure(middlewareBuilder);

    if (!(middlewareBuilder instanceof MiddlewareBuilder)) return;

    const config = middlewareBuilder.build();
    middlewareContainer.addConfig(config, module);
  }

  public async registerMiddleware(
    middlewareContainer: MiddlewareContainer,
    applicationRef: any,
  ) {
    const configs = middlewareContainer.getConfigs();
    const registerAllConfigs = (
      module: string,
      middlewareConfig: MiddlewareConfiguration[],
    ) =>
      middlewareConfig.map(async (config: MiddlewareConfiguration) => {
        await this.registerMiddlewareConfig(
          middlewareContainer,
          config,
          module,
          applicationRef,
        );
      });

    await Promise.all(
      [...configs.entries()].map(async ([module, moduleConfigs]) => {
        await Promise.all(registerAllConfigs(module, [...moduleConfigs]));
      }),
    );
  }

  public async registerMiddlewareConfig(
    middlewareContainer: MiddlewareContainer,
    config: MiddlewareConfiguration,
    module: string,
    applicationRef: any,
  ) {
    const { forRoutes } = config;
    await Promise.all(
      forRoutes.map(async (routeInfo: RouteInfo) => {
        await this.registerRouteMiddleware(
          middlewareContainer,
          routeInfo,
          config,
          module,
          applicationRef,
        );
      }),
    );
  }

  public async registerRouteMiddleware(
    middlewareContainer: MiddlewareContainer,
    routeInfo: RouteInfo,
    config: MiddlewareConfiguration,
    module: string,
    applicationRef: any,
  ) {
    const middlewareCollection = [].concat(config.middleware);
    await Promise.all(
      middlewareCollection.map(async (metatype: Type<VisionMiddleware>) => {
        const collection = middlewareContainer.getMiddleware(module);
        const middleware = collection.get(metatype.name);
        if (isUndefined(middleware)) {
          throw new RuntimeException();
        }

        const { instance } = middleware as MiddlewareWrapper;
        await this.bindHandler(
          instance,
          metatype,
          applicationRef,
          routeInfo.method,
          routeInfo.path,
        );
      }),
    );
  }

  private async bindHandler(
    instance: VisionMiddleware,
    metatype: Type<VisionMiddleware>,
    applicationRef: HttpServer,
    method: RequestMethod,
    path: string,
  ) {
    if (isUndefined(instance.resolve)) {
      throw new InvalidMiddlewareException(metatype.name);
    }
    const exceptionsHandler = this.routerExceptionFilter.create(
      instance,
      instance.resolve,
      undefined,
    );
    const router = applicationRef.createMiddlewareFactory(method);
    const bindWithProxy = middlewareInstance =>
      this.bindHandlerWithProxy(
        exceptionsHandler,
        router,
        middlewareInstance,
        path,
      );
    const resolve = instance.resolve();

    if (!(resolve instanceof Promise)) {
      bindWithProxy(resolve);
      return;
    }
    const middleware = await resolve;
    bindWithProxy(middleware);
  }

  private bindHandlerWithProxy(
    exceptionsHandler: ExceptionsHandler,
    router: (...args) => void,
    middleware: (req, res, next) => void,
    path: string,
  ) {
    const proxy = this.routerProxy.createProxy(middleware, exceptionsHandler);
    const prefix = this.config.getGlobalPrefix();
    const basePath = prefix ? validatePath(prefix) : '';
    router(basePath + path, proxy);
  }
}
