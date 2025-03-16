import { HttpServer } from '@vision/common';
import { EXCEPTION_FILTERS_METADATA } from '@vision/common/constants';
import { Controller } from '@vision/common/interfaces/controllers/controller.interface';
import { isEmpty } from '@vision/common/utils/shared.utils';
import 'reflect-metadata';
import { BaseExceptionFilterContext } from '@vision/core/exceptions/base-exception-filter-context';
import { ExceptionsHandler } from '@vision/core/exceptions/exceptions-handler';
import { VisionContainer } from '@vision/core/injector/container';
import { ApplicationConfig } from '@vision/core/application-config';
import { RouterProxyCallback } from '@vision/core/router/router-proxy';

export class RouterExceptionFilters extends BaseExceptionFilterContext {
  constructor(
    container: VisionContainer,
    private readonly config: ApplicationConfig,
    private readonly applicationRef: HttpServer,
  ) {
    super(container);
  }

  public create(
    instance: Controller,
    callback: RouterProxyCallback,
    module: string,
  ): ExceptionsHandler {
    this.moduleContext = module;

    const exceptionHandler = new ExceptionsHandler(this.applicationRef);
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
    return this.config.getGlobalFilters() as T;
  }
}
