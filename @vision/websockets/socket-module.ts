import 'reflect-metadata';
import iterate from 'iterare';
import {
  VisionContainer,
  InstanceWrapper,
} from '@vision/core/injector/container';
import { NestGateway } from '@vision/websockets/interfaces/nest-gateway.interface';
import { SocketsContainer } from '@vision/websockets/container';
import { WebSocketsController } from '@vision/websockets/web-sockets-controller';
import { Injectable } from '@vision/common/interfaces/injectable.interface';
import { SocketServerProvider } from '@vision/websockets/socket-server-provider';
import { GATEWAY_METADATA } from '@vision/websockets/constants';
import { ApplicationConfig } from '@vision/core/application-config';
import { WsContextCreator } from '@vision/websockets/context/ws-context-creator';
import { WsProxy } from '@vision/websockets/context/ws-proxy';
import { ExceptionFiltersContext } from '@vision/websockets/context/exception-filters-context';
import { PipesConsumer } from '@vision/core/pipes/pipes-consumer';
import { PipesContextCreator } from '@vision/core/pipes/pipes-context-creator';
import { GuardsContextCreator } from '@vision/core/guards/guards-context-creator';
import { GuardsConsumer } from '@vision/core/guards/guards-consumer';
import { InterceptorsContextCreator } from '@vision/core/interceptors/interceptors-context-creator';
import { InterceptorsConsumer } from '@vision/core/interceptors/interceptors-consumer';

export class SocketModule {
  private readonly socketsContainer = new SocketsContainer();
  private applicationConfig: ApplicationConfig;
  private webSocketsController: WebSocketsController;

  public register(container, config) {
    this.applicationConfig = config;
    this.webSocketsController = new WebSocketsController(
      new SocketServerProvider(this.socketsContainer, config),
      container,
      config,
      this.getContextCreator(container),
    );
    const modules = container.getModules();
    modules.forEach(({ components }, moduleName) =>
      this.hookGatewaysIntoServers(components, moduleName),
    );
  }

  public hookGatewaysIntoServers(
    components: Map<string, InstanceWrapper<Injectable>>,
    moduleName: string,
  ) {
    components.forEach(wrapper =>
      this.hookGatewayIntoServer(wrapper, moduleName),
    );
  }

  public hookGatewayIntoServer(
    wrapper: InstanceWrapper<Injectable>,
    moduleName: string,
  ) {
    const { instance, metatype, isNotMetatype } = wrapper;
    if (isNotMetatype) {
      return;
    }
    const metadataKeys = Reflect.getMetadataKeys(metatype);
    if (metadataKeys.indexOf(GATEWAY_METADATA) < 0) {
      return;
    }
    this.webSocketsController.hookGatewayIntoServer(
      instance as NestGateway,
      metatype,
      moduleName,
    );
  }

  public async close(): Promise<any> {
    if (!this.applicationConfig) {
      return undefined;
    }
    const adapter = this.applicationConfig.getIoAdapter();
    const servers = this.socketsContainer.getAllServers();
    await Promise.all(
      iterate(servers.values()).map(
        async ({ server }) => server && (await adapter.close(server)),
      ),
    );
    this.socketsContainer.clear();
  }

  private getContextCreator(container): WsContextCreator {
    return new WsContextCreator(
      new WsProxy(),
      new ExceptionFiltersContext(container),
      new PipesContextCreator(container),
      new PipesConsumer(),
      new GuardsContextCreator(container),
      new GuardsConsumer(),
      new InterceptorsContextCreator(container),
      new InterceptorsConsumer(),
    );
  }
}
