import { FILTER_CATCH_EXCEPTIONS } from '@vision/common/constants';
import { ExceptionFilter } from '@vision/common/interfaces/exceptions/exception-filter.interface';
import { Type } from '@vision/common/interfaces';
import { isEmpty, isFunction, isUndefined } from '@vision/common/utils/shared.utils';
import iterate from 'iterare';
import 'reflect-metadata';
import { VisionContainer } from '@vision/core/injector/container';
import { ContextCreator } from '@vision/core/helpers/context-creator';

export class BaseExceptionFilterContext extends ContextCreator {
  protected moduleContext: string;

  constructor(private readonly container: VisionContainer) {
    super();
  }

  public createConcreteContext<T extends any[], R extends any[]>(
    metadata: T,
  ): R {
    if (isUndefined(metadata) || isEmpty(metadata)) {
      return [] as R;
    }
    return iterate(metadata)
      .filter(
        instance => instance && (isFunction(instance.catch) || instance.name),
      )
      .map(filter => this.getFilterInstance(filter))
      .map(instance => ({
        func: instance.catch.bind(instance),
        exceptionMetatypes: this.reflectCatchExceptions(instance),
      }))
      .toArray() as R;
  }

  public getFilterInstance(filter: Function | ExceptionFilter) {
    const isObject = (filter as ExceptionFilter).catch;
    if (isObject) {
      return filter;
    }
    const instanceWrapper = this.getInstanceByMetatype(filter);
    return instanceWrapper && instanceWrapper.instance
      ? instanceWrapper.instance
      : null;
  }

  public getInstanceByMetatype(filter): { instance: any } | undefined {
    if (!this.moduleContext) {
      return undefined;
    }
    const collection = this.container.getModules();
    const module = collection.get(this.moduleContext);
    if (!module) {
      return undefined;
    }
    return module.injectables.get((filter as any).name);
  }

  public reflectCatchExceptions(instance: ExceptionFilter): Type<any>[] {
    const prototype = Object.getPrototypeOf(instance);
    return (
      Reflect.getMetadata(FILTER_CATCH_EXCEPTIONS, prototype.constructor) || []
    );
  }
}
