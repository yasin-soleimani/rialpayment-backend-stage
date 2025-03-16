import { EXCEPTION_FILTERS_METADATA } from '@vision/common/constants';
import { Controller } from '@vision/common/interfaces/controllers/controller.interface';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { BaseExceptionFilterContext } from '@vision/core/exceptions/base-exception-filter-context';
import { VisionContainer } from '@vision/core/injector/container';
import 'reflect-metadata';
import { WsExceptionsHandler } from '@vision/websockets/exceptions/ws-exceptions-handler';

export class ExceptionFiltersContext extends BaseExceptionFilterContext {
  constructor(container: VisionContainer) {
    super(container);
  }

  public create(
    instance: Controller,
    callback: (client, data) => any,
    module: string,
  ): WsExceptionsHandler {
    this.moduleContext = module;

    const exceptionHandler = new WsExceptionsHandler();
    const filters = this.createContext(
      instance,
      callback,
      EXCEPTION_FILTERS_METADATA,
    );
    if (isEmpty(filters)) {
      return exceptionHandler;
    }
    exceptionHandler.setCustomFilters(filters.reverse());
    return exceptionHandler;
  }

  public getGlobalMetadata<T extends any[]>(): T {
    return [] as T;
  }
}
