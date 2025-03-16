import 'reflect-metadata';
import iterate from 'iterare';
import {
  VisionContainer,
  InstanceWrapper,
} from '@vision/core/injector/container';
import { NestGateway } from '@vision/websockets';
import { GATEWAY_MIDDLEWARES } from '@vision/websockets/constants';
import { UnknownModuleException } from '@vision/core/errors/exceptions/unknown-module.exception';
import { Injectable } from '@vision/common/interfaces/injectable.interface';
import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { GatewayMiddleware } from '@vision/websockets/interfaces/gateway-middleware.interface';
import {
  isUndefined,
  isFunction,
  isNil,
} from '@vision/common/utils/shared.utils';
import { ApplicationConfig } from '@vision/core/application-config';

export class MiddlewareInjector {
  constructor(
    private readonly container: VisionContainer,
    private readonly config: ApplicationConfig,
  ) {}

  public inject(server, instance: NestGateway, module: string) {
    const adapter: any = this.config.getIoAdapter();
    if (!adapter.bindMiddleware) {
      return;
    }
    const opaqueTokens = this.reflectMiddlewareTokens(instance);
    const modules = this.container.getModules();
    if (!modules.has(module)) {
      throw new UnknownModuleException();
    }
    const { components } = modules.get(module);
    this.applyMiddleware(server, components, opaqueTokens);
  }

  public reflectMiddlewareTokens(instance: NestGateway): any[] {
    const prototype = Object.getPrototypeOf(instance);
    return (
      Reflect.getMetadata(GATEWAY_MIDDLEWARES, prototype.constructor) || []
    );
  }

  public applyMiddleware(
    server,
    components: Map<string, InstanceWrapper<Injectable>>,
    tokens: any[],
  ) {
    const adapter: any = this.config.getIoAdapter();
    iterate(tokens)
      .map(token => this.bindMiddleware(token.name, components))
      .filter(middleware => !isNil(middleware))
      .forEach(middleware => adapter.bindMiddleware(server, middleware));
  }

  public bindMiddleware(
    token: string,
    components: Map<string, InstanceWrapper<Injectable>>,
  ) {
    if (!components.has(token)) {
      throw new RuntimeException();
    }
    const { instance } = components.get(token);
    if (!this.isGatewayMiddleware(instance)) return null;

    const middleware = instance.resolve();
    return isFunction(middleware) ? middleware.bind(instance) : null;
  }

  public isGatewayMiddleware(
    middleware: object,
  ): middleware is GatewayMiddleware {
    return !isUndefined((middleware as GatewayMiddleware).resolve);
  }
}
