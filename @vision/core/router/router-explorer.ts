import 'reflect-metadata';
import { Controller } from '@vision/common/interfaces/controllers/controller.interface';
import { RequestMethod } from '@vision/common/enums/request-method.enum';
import { RouterProxy, RouterProxyCallback } from '@vision/core/router/router-proxy';
import { UnknownRequestMappingException } from '@vision/core/errors/exceptions/unknown-request-mapping.exception';
import { Type } from '@vision/common/interfaces/type.interface';
import { isUndefined, validatePath } from '@vision/common/utils/shared.utils';
import { RouterMethodFactory } from '@vision/core/helpers/router-method-factory';
import { PATH_METADATA, METHOD_METADATA } from '@vision/common/constants';
import { Logger } from '@vision/common/services/logger.service';
import { routeMappedMessage } from '@vision/core/helpers/messages';
import { RouterExecutionContext } from '@vision/core/router/router-execution-context';
import { ExceptionsFilter } from '@vision/core/router/interfaces/exceptions-filter.interface';
import { RouteParamsFactory } from '@vision/core/router/route-params-factory';
import { MetadataScanner } from '@vision/core/metadata-scanner';
import { ApplicationConfig } from '@vision/core/application-config';
import { PipesContextCreator } from '@vision/core/pipes/pipes-context-creator';
import { PipesConsumer } from '@vision/core/pipes/pipes-consumer';
import { VisionContainer } from '@vision/core/injector/container';
import { GuardsContextCreator } from '@vision/core/guards/guards-context-creator';
import { GuardsConsumer } from '@vision/core/guards/guards-consumer';
import { InterceptorsContextCreator } from '@vision/core/interceptors/interceptors-context-creator';
import { InterceptorsConsumer } from '@vision/core/interceptors/interceptors-consumer';

export class RouterExplorer {
  private readonly executionContextCreator: RouterExecutionContext;
  private readonly routerMethodFactory = new RouterMethodFactory();
  private readonly logger = new Logger(RouterExplorer.name, true);

  constructor(
    private readonly metadataScanner: MetadataScanner,
    container: VisionContainer,
    private readonly routerProxy?: RouterProxy,
    private readonly exceptionsFilter?: ExceptionsFilter,
    private readonly config?: ApplicationConfig,
  ) {
    this.executionContextCreator = new RouterExecutionContext(
      new RouteParamsFactory(),
      new PipesContextCreator(container, config),
      new PipesConsumer(),
      new GuardsContextCreator(container, config),
      new GuardsConsumer(),
      new InterceptorsContextCreator(container, config),
      new InterceptorsConsumer(),
      container.getApplicationRef(),
    );
  }

  public explore(
    instance: Controller,
    metatype: Type<Controller>,
    module: string,
    appInstance,
    basePath: string,
  ) {
    const routerPaths = this.scanForPaths(instance);
    this.applyPathsToRouterProxy(
      appInstance,
      routerPaths,
      instance,
      module,
      basePath,
    );
  }

  public extractRouterPath(
    metatype: Type<Controller>,
    prefix?: string,
  ): string {
    let path = Reflect.getMetadata(PATH_METADATA, metatype);
    if (prefix) path = prefix + this.validateRoutePath(path);
    return this.validateRoutePath(path);
  }

  public validateRoutePath(path: string): string {
    if (isUndefined(path)) {
      throw new UnknownRequestMappingException();
    }
    return validatePath(path);
  }

  public scanForPaths(instance: Controller, prototype?): RoutePathProperties[] {
    const instancePrototype = isUndefined(prototype)
      ? Object.getPrototypeOf(instance)
      : prototype;
    return this.metadataScanner.scanFromPrototype<
      Controller,
      RoutePathProperties
    >(instance, instancePrototype, method =>
      this.exploreMethodMetadata(instance, instancePrototype, method),
    );
  }

  public exploreMethodMetadata(
    instance: Controller,
    instancePrototype,
    methodName: string,
  ): RoutePathProperties {
    const targetCallback = instancePrototype[methodName];
    const routePath = Reflect.getMetadata(PATH_METADATA, targetCallback);
    if (isUndefined(routePath)) {
      return null;
    }
    const requestMethod: RequestMethod = Reflect.getMetadata(
      METHOD_METADATA,
      targetCallback,
    );
    return {
      path: this.validateRoutePath(routePath),
      requestMethod,
      targetCallback,
      methodName,
    };
  }

  public applyPathsToRouterProxy(
    router,
    routePaths: RoutePathProperties[],
    instance: Controller,
    module: string,
    basePath: string,
  ) {
    (routePaths || []).map(pathProperties => {
      const { path, requestMethod } = pathProperties;
      this.applyCallbackToRouter(
        router,
        pathProperties,
        instance,
        module,
        basePath,
      );
      this.logger.log(routeMappedMessage(path, requestMethod));
    });
  }

  private applyCallbackToRouter(
    router,
    pathProperties: RoutePathProperties,
    instance: Controller,
    module: string,
    basePath: string,
  ) {
    const { path, requestMethod, targetCallback, methodName } = pathProperties;
    const routerMethod = this.routerMethodFactory
      .get(router, requestMethod)
      .bind(router);

    const proxy = this.createCallbackProxy(
      instance,
      targetCallback,
      methodName,
      module,
      requestMethod,
    );
    const stripSlash = str =>
      str[str.length - 1] === '/' ? str.slice(0, str.length - 1) : str;
    const fullPath = stripSlash(basePath) + path;
    routerMethod(stripSlash(fullPath) || '/', proxy);
  }

  private createCallbackProxy(
    instance: Controller,
    callback: RouterProxyCallback,
    methodName: string,
    module: string,
    requestMethod,
  ) {
    const executionContext = this.executionContextCreator.create(
      instance,
      callback,
      methodName,
      module,
      requestMethod,
    );
    const exceptionFilter = this.exceptionsFilter.create(
      instance,
      callback,
      module,
    );
    return this.routerProxy.createProxy(executionContext, exceptionFilter);
  }
}

export interface RoutePathProperties {
  path: string;
  requestMethod: RequestMethod;
  targetCallback: RouterProxyCallback;
  methodName: string;
}
