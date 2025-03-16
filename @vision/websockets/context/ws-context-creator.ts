import { Observable } from 'rxjs';
import { WsProxy } from '@vision/websockets/context/ws-proxy';
import { WsExceptionsHandler } from '@vision/websockets/exceptions/ws-exceptions-handler';
import { ExceptionFiltersContext } from '@vision/websockets/context/exception-filters-context';
import { Controller } from '@vision/common/interfaces';
import { PipesContextCreator } from '@vision/core/pipes/pipes-context-creator';
import { PipesConsumer } from '@vision/core/pipes/pipes-consumer';
import { PARAMTYPES_METADATA } from '@vision/common/constants';
import { GuardsContextCreator } from '@vision/core/guards/guards-context-creator';
import { GuardsConsumer } from '@vision/core/guards/guards-consumer';
import { FORBIDDEN_MESSAGE } from '@vision/core/guards/constants';
import { WsException } from '@vision/websockets/exceptions/ws-exception';
import { InterceptorsConsumer } from '@vision/core/interceptors/interceptors-consumer';
import { InterceptorsContextCreator } from '@vision/core/interceptors/interceptors-context-creator';

export class WsContextCreator {
  constructor(
    private readonly wsProxy: WsProxy,
    private readonly exceptionFiltersContext: ExceptionFiltersContext,
    private readonly pipesCreator: PipesContextCreator,
    private readonly pipesConsumer: PipesConsumer,
    private readonly guardsContextCreator: GuardsContextCreator,
    private readonly guardsConsumer: GuardsConsumer,
    private readonly interceptorsContextCreator: InterceptorsContextCreator,
    private readonly interceptorsConsumer: InterceptorsConsumer,
  ) {}

  public create(
    instance: Controller,
    callback: (...args) => void,
    module,
  ): (...args) => Promise<void> {
    const exceptionHandler = this.exceptionFiltersContext.create(
      instance,
      callback,
      module,
    );
    const pipes = this.pipesCreator.create(instance, callback, module);
    const guards = this.guardsContextCreator.create(instance, callback, module);
    const metatype = this.getDataMetatype(instance, callback);
    const interceptors = this.interceptorsContextCreator.create(
      instance,
      callback,
      module,
    );
    const handler = (args: any[]) => async () => {
      const [client, data, ...params] = args;
      const result = await this.pipesConsumer.applyPipes(
        data,
        { metatype },
        pipes,
      );
      return callback.call(instance, client, result, ...params);
    };

    return this.wsProxy.create(async (...args) => {
      const canActivate = await this.guardsConsumer.tryActivate(
        guards,
        args,
        instance,
        callback,
      );
      if (!canActivate) {
        throw new WsException(FORBIDDEN_MESSAGE);
      }
      return await this.interceptorsConsumer.intercept(
        interceptors,
        args,
        instance,
        callback,
        handler(args),
      );
    }, exceptionHandler);
  }

  public reflectCallbackParamtypes(
    instance: Controller,
    callback: (...args) => any,
  ): any[] {
    return Reflect.getMetadata(PARAMTYPES_METADATA, instance, callback.name);
  }

  public getDataMetatype(instance, callback) {
    const paramtypes = this.reflectCallbackParamtypes(instance, callback);
    return paramtypes && paramtypes.length ? paramtypes[1] : null;
  }
}
