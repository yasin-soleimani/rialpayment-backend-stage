import 'reflect-metadata';
import iterate from 'iterare';
import { Controller, VisionInterceptor } from '@vision/common/interfaces';
import { INTERCEPTORS_METADATA } from '@vision/common/constants';
import {
  isUndefined,
  isFunction,
  isNil,
  isEmpty,
} from '@vision/common/utils/shared.utils';
import { ContextCreator } from '@vision/core/helpers/context-creator';
import { VisionContainer } from '@vision/core/injector/container';
import { ConfigurationProvider } from '@vision/common/interfaces/configuration-provider.interface';

export class InterceptorsContextCreator extends ContextCreator {
  private moduleContext: string;

  constructor(
    private readonly container: VisionContainer,
    private readonly config?: ConfigurationProvider,
  ) {
    super();
  }

  public create(
    instance: Controller,
    callback: (...args) => any,
    module: string,
  ): VisionInterceptor[] {
    this.moduleContext = module;
    return this.createContext(instance, callback, INTERCEPTORS_METADATA);
  }

  public createConcreteContext<T extends any[], R extends any[]>(
    metadata: T,
  ): R {
    if (isUndefined(metadata) || isEmpty(metadata)) {
      return [] as R;
    }
    return iterate(metadata)
      .filter(
        (interceptor: any) =>
          interceptor && (interceptor.name || interceptor.intercept),
      )
      .map(interceptor => this.getInterceptorInstance(interceptor))
      .filter(
        (interceptor: VisionInterceptor) =>
          interceptor && isFunction(interceptor.intercept),
      )
      .toArray() as R;
  }

  public getInterceptorInstance(interceptor: Function | VisionInterceptor) {
    const isObject = (interceptor as VisionInterceptor).intercept;
    if (isObject) {
      return interceptor;
    }
    const instanceWrapper = this.getInstanceByMetatype(interceptor);
    return instanceWrapper && instanceWrapper.instance
      ? instanceWrapper.instance
      : null;
  }

  public getInstanceByMetatype(metatype): { instance: any } | undefined {
    if (!this.moduleContext) {
      return undefined;
    }
    const collection = this.container.getModules();
    const module = collection.get(this.moduleContext);
    if (!module) {
      return undefined;
    }
    return module.injectables.get((metatype as any).name);
  }

  public getGlobalMetadata<T extends any[]>(): T {
    if (!this.config) {
      return [] as T;
    }
    return this.config.getGlobalInterceptors() as T;
  }
}
