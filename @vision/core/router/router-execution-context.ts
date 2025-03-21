import 'reflect-metadata';
import {
  ROUTE_ARGS_METADATA,
  PARAMTYPES_METADATA,
  HTTP_CODE_METADATA,
  CUSTOM_ROUTE_AGRS_METADATA,
  RENDER_METADATA,
  HEADERS_METADATA,
} from '@vision/common/constants';
import {
  isUndefined,
  isFunction,
  isString,
} from '@vision/common/utils/shared.utils';
import { RouteParamtypes } from '@vision/common/enums/route-paramtypes.enum';
import { Controller, Transform } from '@vision/common/interfaces';
import { RouteParamsMetadata } from '@vision/common/decorators';
import { IRouteParamsFactory } from '@vision/core/router/interfaces/route-params-factory.interface';
import { PipesContextCreator } from '@vision/core/pipes/pipes-context-creator';
import { PipesConsumer } from '@vision/core/pipes/pipes-consumer';
import {
  ParamData,
  PipeTransform,
  RequestMethod,
  ForbiddenException,
  HttpServer,
} from '@vision/common';
import { GuardsContextCreator } from '@vision/core/guards/guards-context-creator';
import { GuardsConsumer } from '@vision/core/guards/guards-consumer';
import {
  RouterResponseController,
  CustomHeader,
} from '@vision/core/router/router-response-controller';
import { InterceptorsContextCreator } from '@vision/core/interceptors/interceptors-context-creator';
import { InterceptorsConsumer } from '@vision/core/interceptors/interceptors-consumer';
import { FORBIDDEN_MESSAGE } from '@vision/core/guards/constants';
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";

export interface ParamProperties {
  index: number;
  type: RouteParamtypes | string;
  data: ParamData;
  pipes: PipeTransform[];
  extractValue: (req, res, next) => any;
}

export class RouterExecutionContext {
  private readonly responseController: RouterResponseController;
  constructor(
    private readonly paramsFactory: IRouteParamsFactory,
    private readonly pipesContextCreator: PipesContextCreator,
    private readonly pipesConsumer: PipesConsumer,
    private readonly guardsContextCreator: GuardsContextCreator,
    private readonly guardsConsumer: GuardsConsumer,
    private readonly interceptorsContextCreator: InterceptorsContextCreator,
    private readonly interceptorsConsumer: InterceptorsConsumer,
    private readonly applicationRef: HttpServer,
  ) {
    this.responseController = new RouterResponseController(applicationRef);
  }

  public create(
    instance: Controller,
    callback: (...args) => any,
    methodName: string,
    module: string,
    requestMethod: RequestMethod,
  ) {
    const metadata = this.reflectCallbackMetadata(instance, methodName) || {};
    const keys = Object.keys(metadata);
    const argsLength = this.getArgumentsLength(keys, metadata);
    const pipes = this.pipesContextCreator.create(instance, callback, module);
    const paramtypes = this.reflectCallbackParamtypes(instance, methodName);
    const guards = this.guardsContextCreator.create(instance, callback, module);
    const interceptors = this.interceptorsContextCreator.create(
      instance,
      callback,
      module,
    );
    const httpCode = this.reflectHttpStatusCode(callback);
    const paramsMetadata = this.exchangeKeysForValues(keys, metadata, module);
    const isResponseHandled = paramsMetadata.some(
      ({ type }) =>
        type === RouteParamtypes.RESPONSE || type === RouteParamtypes.NEXT,
    );
    const paramsOptions = this.mergeParamsMetatypes(paramsMetadata, paramtypes);
    const httpStatusCode = httpCode
      ? httpCode
      : this.responseController.getStatusByMethod(requestMethod);

    const fnCanActivate = this.createGuardsFn(guards, instance, callback);
    const fnApplyPipes = this.createPipesFn(pipes, paramsOptions);
    const fnHandleResponse = this.createHandleResponseFn(
      callback,
      isResponseHandled,
      httpStatusCode,
    );
    const handler = (args, req, res, next) => async () => {
      fnApplyPipes && (await fnApplyPipes(args, req, res, next));
      return callback.apply(instance, args);
    };

    return async (req, res, next) => {
      const args = this.createNullArray(argsLength);
      fnCanActivate && (await fnCanActivate([req, res]));

      const result = await this.interceptorsConsumer.intercept(
        interceptors,
        [req, res],
        instance,
        callback,
        handler(args, req, res, next),
      );
      await fnHandleResponse(result, res);
    };
  }

  public mapParamType(key: string): string {
    const keyPair = key.split(':');
    return keyPair[0];
  }

  public reflectCallbackMetadata(
    instance: Controller,
    methodName: string,
  ): RouteParamsMetadata {
    return Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      instance.constructor,
      methodName,
    );
  }

  public reflectCallbackParamtypes(
    instance: Controller,
    methodName: string,
  ): any[] {
    return Reflect.getMetadata(PARAMTYPES_METADATA, instance, methodName);
  }

  public reflectHttpStatusCode(callback: (...args) => any): number {
    return Reflect.getMetadata(HTTP_CODE_METADATA, callback);
  }

  public reflectRenderTemplate(callback): string {
    return Reflect.getMetadata(RENDER_METADATA, callback);
  }

  public reflectResponseHeaders(callback): CustomHeader[] {
    return Reflect.getMetadata(HEADERS_METADATA, callback) || [];
  }

  public getArgumentsLength(
    keys: string[],
    metadata: RouteParamsMetadata,
  ): number {
    return Math.max(...keys.map(key => metadata[key].index)) + 1;
  }

  public createNullArray(length: number): any[] {
    return Array.apply(null, { length }).fill(null);
  }

  public exchangeKeysForValues(
    keys: string[],
    metadata: RouteParamsMetadata,
    moduleContext: string,
  ): ParamProperties[] {
    this.pipesContextCreator.setModuleContext(moduleContext);
    return keys.map(key => {
      const { index, data, pipes: pipesCollection } = metadata[key];
      const pipes = this.pipesContextCreator.createConcreteContext(
        pipesCollection,
      );
      const type = this.mapParamType(key);

      if (key.includes(CUSTOM_ROUTE_AGRS_METADATA)) {
        const { factory } = metadata[key];
        const customExtractValue = this.getCustomFactory(factory, data);
        return { index, extractValue: customExtractValue, type, data, pipes };
      }
      const nType = Number(type);
      const extractValue = (req, res, next) =>
        this.paramsFactory.exchangeKeyForValue(nType, data, { req, res, next });
      return { index, extractValue, type: nType, data, pipes };
    });
  }

  public getCustomFactory(factory: (...args) => void, data): (...args) => any {
    return !isUndefined(factory) && isFunction(factory)
      ? (req, res, next) => factory(data, req)
      : () => null;
  }

  public mergeParamsMetatypes(
    paramsProperties: ParamProperties[],
    paramtypes: any[],
  ): (ParamProperties & { metatype?: any })[] {
    if (!paramtypes) {
      return paramsProperties;
    }
    return paramsProperties.map(param => ({
      ...param,
      metatype: paramtypes[param.index],
    }));
  }

  public async getParamValue<T>(
    value: T,
    { metatype, type, data },
    transforms: Transform<any>[],
  ): Promise<any> {
    if (
      type === RouteParamtypes.BODY ||
      type === RouteParamtypes.QUERY ||
      type === RouteParamtypes.PARAM ||
      isString(type)
    ) {
      return await this.pipesConsumer.apply(
        value,
        { metatype, type, data },
        transforms,
      );
    }
    return Promise.resolve(value);
  }

  public createGuardsFn(
    guards: any[],
    instance: Controller,
    callback: (...args) => any,
  ) {
    const canActivateFn = async (args: any[]) => {
      const canActivate = await this.guardsConsumer.tryActivate(
        guards,
        args,
        instance,
        callback,
      );
      if (!canActivate) {
        throw new UserCustomException('متاسفانه شما به این قسمت دسترسی ندارید', false, 401);
      }
    };
    return guards.length ? canActivateFn : null;
  }

  public createPipesFn(
    pipes: any[],
    paramsOptions: (ParamProperties & { metatype?: any })[],
  ) {
    const pipesFn = async (args, req, res, next) => {
      await Promise.all(
        paramsOptions.map(async param => {
          const {
            index,
            extractValue,
            type,
            data,
            metatype,
            pipes: paramPipes,
          } = param;
          const value = extractValue(req, res, next);

          args[index] = await this.getParamValue(
            value,
            { metatype, type, data },
            pipes.concat(paramPipes),
          );
        }),
      );
    };
    return paramsOptions.length ? pipesFn : null;
  }

  public createHandleResponseFn(
    callback,
    isResponseHandled: boolean,
    httpStatusCode: number,
  ) {
    const renderTemplate = this.reflectRenderTemplate(callback);
    const responseHeaders = this.reflectResponseHeaders(callback);

    if (renderTemplate) {
      return async (result, res) => {
        this.responseController.setHeaders(res, responseHeaders);
        await this.responseController.render(result, res, renderTemplate);
      };
    }
    return async (result, res) => {
      this.responseController.setHeaders(res, responseHeaders);

      !isResponseHandled &&
        (await this.responseController.apply(result, res, httpStatusCode));
    };
  }
}
