import { DynamicModule } from '@vision/common';
import {
  EXCEPTION_FILTERS_METADATA,
  GATEWAY_MIDDLEWARES,
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  metadata,
  PIPES_METADATA,
  ROUTE_ARGS_METADATA,
} from '@vision/common/constants';
import { Controller } from '@vision/common/interfaces/controllers/controller.interface';
import { Injectable } from '@vision/common/interfaces/injectable.interface';
import { Type } from '@vision/common/interfaces/type.interface';
import {
  isFunction,
  isNil,
  isUndefined,
} from '@vision/common/utils/shared.utils';
import 'reflect-metadata';
import { MetadataScanner } from '@vision/core/metadata-scanner';
import { ApplicationConfig } from '@vision/core/application-config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@vision/core/constants';
import { CircularDependencyException } from '@vision/core/errors/exceptions/circular-dependency.exception';
import { VisionContainer } from '@vision/core/injector/container';

interface ApplicationProviderWrapper {
  moduleToken: string;
  providerToken: string;
}

export class DependenciesScanner {
  private readonly applicationProvidersApplyMap: ApplicationProviderWrapper[] = [];
  constructor(
    private readonly container: VisionContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly applicationConfig = new ApplicationConfig(),
  ) {}

  public async scan(module: Type<any>) {
    await this.scanForModules(module);
    await this.scanModulesForDependencies();
    this.container.bindGlobalScope();
  }

  public async scanForModules(
    module: Type<any> | DynamicModule,
    scope: Type<any>[] = [],
  ) {
    await this.storeModule(module, scope);

    const modules = this.reflectMetadata(module, metadata.MODULES);
    for (const innerModule of modules) {
      await this.scanForModules(innerModule, [].concat(scope, module));
    }
  }

  public async storeModule(module: any, scope: Type<any>[]) {
    if (module && module.forwardRef) {
      return await this.container.addModule(module.forwardRef(), scope);
    }
    await this.container.addModule(module, scope);
  }

  public async scanModulesForDependencies() {
    const modules = this.container.getModules();

    for (const [token, { metatype }] of modules) {
      await this.reflectRelatedModules(metatype, token, metatype.name);
      this.reflectComponents(metatype, token);
      this.reflectControllers(metatype, token);
      this.reflectExports(metatype, token);
    }
  }

  public async reflectRelatedModules(
    module: Type<any>,
    token: string,
    context: string,
  ) {
    const modules = [
      ...this.reflectMetadata(module, metadata.MODULES),
      ...this.container.getDynamicMetadataByToken(
        token,
        metadata.MODULES as 'modules',
      ),
      ...this.container.getDynamicMetadataByToken(
        token,
        metadata.IMPORTS as 'imports',
      ),
    ];
    for (const related of modules) {
      await this.storeRelatedModule(related, token, context);
    }
  }

  public reflectComponents(module: Type<any>, token: string) {
    const components = [
      ...this.reflectMetadata(module, metadata.COMPONENTS),
      ...this.container.getDynamicMetadataByToken(
        token,
        metadata.COMPONENTS as 'components',
      ),
      ...this.container.getDynamicMetadataByToken(
        token,
        metadata.PROVIDERS as 'providers',
      ),
    ];
    components.map(component => {
      this.storeComponent(component, token);
      this.reflectComponentMetadata(component, token);
      this.reflectDynamicMetadata(component, token);
    });
  }

  public reflectComponentMetadata(component: Type<Injectable>, token: string) {
    this.reflectGatewaysMiddleware(component, token);
  }

  public reflectControllers(module: Type<any>, token: string) {
    const routes = [
      ...this.reflectMetadata(module, metadata.CONTROLLERS),
      ...this.container.getDynamicMetadataByToken(
        token,
        metadata.CONTROLLERS as 'controllers',
      ),
    ];
    routes.map(route => {
      this.storeRoute(route, token);
      this.reflectDynamicMetadata(route, token);
    });
  }

  public reflectDynamicMetadata(obj: Type<Injectable>, token: string) {
    if (!obj || !obj.prototype) {
      return;
    }
    this.reflectInjectables(obj, token, GUARDS_METADATA);
    this.reflectInjectables(obj, token, INTERCEPTORS_METADATA);
    this.reflectInjectables(obj, token, EXCEPTION_FILTERS_METADATA);
    this.reflectInjectables(obj, token, PIPES_METADATA);
    this.reflectParamInjectables(obj, token, ROUTE_ARGS_METADATA);
  }

  public reflectExports(module: Type<any>, token: string) {
    const exports = [
      ...this.reflectMetadata(module, metadata.EXPORTS),
      ...this.container.getDynamicMetadataByToken(
        token,
        metadata.EXPORTS as 'exports',
      ),
    ];
    exports.map(exportedComponent =>
      this.storeExportedComponent(exportedComponent, token),
    );
  }

  public reflectGatewaysMiddleware(component: Type<Injectable>, token: string) {
    const middleware = this.reflectMetadata(component, GATEWAY_MIDDLEWARES);
    middleware.map(ware => this.storeComponent(ware, token));
  }

  public reflectInjectables(
    component: Type<Injectable>,
    token: string,
    metadataKey: string,
  ) {
    const controllerInjectables = this.reflectMetadata(component, metadataKey);
    const methodsInjectables = this.metadataScanner.scanFromPrototype(
      null,
      component.prototype,
      this.reflectKeyMetadata.bind(this, component, metadataKey),
    );
    const flattenMethodsInjectables = methodsInjectables.reduce<any[]>(
      (a: any[], b) => a.concat(b),
      [],
    );
    const mergedInjectables = [
      ...controllerInjectables,
      ...flattenMethodsInjectables,
    ].filter(isFunction);

    mergedInjectables.map(injectable =>
      this.storeInjectable(injectable, token),
    );
  }

  public reflectParamInjectables(
    component: Type<Injectable>,
    token: string,
    metadataKey: string,
  ) {
    const paramsMetadata = this.metadataScanner.scanFromPrototype(
      null,
      component.prototype,
      method => Reflect.getMetadata(metadataKey, component, method),
    );
    const flatten = arr => arr.reduce((a, b) => a.concat(b), []);
    const paramsInjectables = flatten(paramsMetadata).map(param =>
      flatten(Object.keys(param).map(k => param[k].pipes)).filter(isFunction),
    );

    flatten(paramsInjectables).map(injectable =>
      this.storeInjectable(injectable, token),
    );
  }

  public reflectKeyMetadata(
    component: Type<Injectable>,
    key: string,
    method: string,
  ) {
    const descriptor = Reflect.getOwnPropertyDescriptor(
      component.prototype,
      method,
    );
    return descriptor ? Reflect.getMetadata(key, descriptor.value) : undefined;
  }

  public async storeRelatedModule(
    related: any,
    token: string,
    context: string,
  ) {
    if (isUndefined(related)) {
      throw new CircularDependencyException(context);
    }
    if (related && related.forwardRef) {
      return await this.container.addRelatedModule(related.forwardRef(), token);
    }
    await this.container.addRelatedModule(related, token);
  }

  public storeComponent(component, token: string) {
    const isCustomProvider = component && !isNil(component.provide);
    if (!isCustomProvider) {
      return this.container.addComponent(component, token);
    }
    const applyProvidersMap = this.getApplyProvidersMap();
    const providersKeys = Object.keys(applyProvidersMap);
    const providerToken = component.provide;
    if (providersKeys.indexOf(providerToken) < 0) {
      return this.container.addComponent(component, token);
    }
    this.applicationProvidersApplyMap.push({
      moduleToken: token,
      providerToken,
    });
    this.container.addComponent(component, token);
  }

  public storeInjectable(component: Type<Injectable>, token: string) {
    this.container.addInjectable(component, token);
  }

  public storeExportedComponent(
    exportedComponent: Type<Injectable>,
    token: string,
  ) {
    this.container.addExportedComponent(exportedComponent, token);
  }

  public storeRoute(route: Type<Controller>, token: string) {
    this.container.addController(route, token);
  }

  public reflectMetadata(metatype, metadataKey: string) {
    return Reflect.getMetadata(metadataKey, metatype) || [];
  }

  public applyApplicationProviders() {
    const applyProvidersMap = this.getApplyProvidersMap();
    this.applicationProvidersApplyMap.forEach(
      ({ moduleToken, providerToken }) => {
        const modules = this.container.getModules();
        const { components } = modules.get(moduleToken);
        const { instance } = components.get(providerToken);

        applyProvidersMap[providerToken](instance);
      },
    );
  }

  public getApplyProvidersMap(): { [type: string]: Function } {
    return {
      [APP_INTERCEPTOR]: interceptor =>
        this.applicationConfig.addGlobalInterceptor(interceptor),
      [APP_PIPE]: pipe => this.applicationConfig.addGlobalPipe(pipe),
      [APP_GUARD]: guard => this.applicationConfig.addGlobalGuard(guard),
      [APP_FILTER]: filter => this.applicationConfig.addGlobalFilter(filter),
    };
  }
}
