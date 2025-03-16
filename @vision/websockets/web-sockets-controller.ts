import { Type } from '@vision/common/interfaces/type.interface';
import { isFunction } from '@vision/common/utils/shared.utils';
import { ApplicationConfig } from '@vision/core/application-config';
import { VisionContainer } from '@vision/core/injector/container';
import { MetadataScanner } from '@vision/core/metadata-scanner';
import 'reflect-metadata';
import { from as fromPromise, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, mergeAll } from 'rxjs/operators';
import { GATEWAY_OPTIONS, PORT_METADATA } from '@vision/websockets/constants';
import { WsContextCreator } from '@vision/websockets/context/ws-context-creator';
import { InvalidSocketPortException } from '@vision/websockets/exceptions/invalid-socket-port.exception';
import {
  GatewayMetadataExplorer,
  MessageMappingProperties,
} from '@vision/websockets/gateway-metadata-explorer';
import { NestGateway } from '@vision/websockets/interfaces/nest-gateway.interface';
import { ObservableSocketServer } from '@vision/websockets/interfaces/observable-socket-server.interface';
import { MiddlewareInjector } from '@vision/websockets/middleware-injector';
import { SocketServerProvider } from '@vision/websockets/socket-server-provider';

export class WebSocketsController {
  private readonly metadataExplorer = new GatewayMetadataExplorer(
    new MetadataScanner(),
  );
  private readonly middlewareInjector: MiddlewareInjector;

  constructor(
    private readonly socketServerProvider: SocketServerProvider,
    private readonly container: VisionContainer,
    private readonly config: ApplicationConfig,
    private readonly contextCreator: WsContextCreator,
  ) {
    this.middlewareInjector = new MiddlewareInjector(container, config);
  }

  public hookGatewayIntoServer(
    instance: NestGateway,
    metatype: Type<any>,
    module: string,
  ) {
    const options = Reflect.getMetadata(GATEWAY_OPTIONS, metatype) || {};
    const port = Reflect.getMetadata(PORT_METADATA, metatype) || 0;

    if (!Number.isInteger(port)) {
      throw new InvalidSocketPortException(port, metatype);
    }
    this.subscribeObservableServer(instance, options, port, module);
  }

  public subscribeObservableServer(
    instance: NestGateway,
    options: any,
    port: number,
    module: string,
  ) {
    const plainMessageHandlers = this.metadataExplorer.explore(instance);
    const messageHandlers = plainMessageHandlers.map(
      ({ callback, message }) => ({
        message,
        callback: this.contextCreator.create(instance, callback, module),
      }),
    );
    const observableServer = this.socketServerProvider.scanForSocketServer(
      options,
      port,
    );
    this.injectMiddleware(observableServer, instance, module);
    this.hookServerToProperties(instance, observableServer.server);
    this.subscribeEvents(instance, messageHandlers, observableServer);
  }

  public injectMiddleware({ server }, instance: NestGateway, module: string) {
    this.middlewareInjector.inject(server, instance, module);
  }

  public subscribeEvents(
    instance: NestGateway,
    messageHandlers: MessageMappingProperties[],
    observableServer: ObservableSocketServer,
  ) {
    const { init, disconnect, connection, server } = observableServer;
    const adapter = this.config.getIoAdapter();

    this.subscribeInitEvent(instance, init);
    this.subscribeConnectionEvent(instance, connection);
    this.subscribeDisconnectEvent(instance, disconnect);

    const handler = this.getConnectionHandler(
      this,
      instance,
      messageHandlers,
      disconnect,
      connection,
    );
    adapter.bindClientConnect(server, handler);
  }

  public getConnectionHandler(
    context: WebSocketsController,
    instance: NestGateway,
    messageHandlers: MessageMappingProperties[],
    disconnect: Subject<any>,
    connection: Subject<any>,
  ) {
    const adapter = this.config.getIoAdapter();
    return client => {
      connection.next(client);
      context.subscribeMessages(messageHandlers, client, instance);

      const disconnectHook = adapter.bindClientDisconnect;
      disconnectHook &&
        disconnectHook.call(adapter, client, _ => disconnect.next(client));
    };
  }

  public subscribeInitEvent(instance: NestGateway, event: Subject<any>) {
    if (instance.afterInit) {
      event.subscribe(instance.afterInit.bind(instance));
    }
  }

  public subscribeConnectionEvent(instance: NestGateway, event: Subject<any>) {
    if (instance.handleConnection) {
      event
        .pipe(distinctUntilChanged())
        .subscribe(instance.handleConnection.bind(instance));
    }
  }

  public subscribeDisconnectEvent(instance: NestGateway, event: Subject<any>) {
    if (instance.handleDisconnect) {
      event
        .pipe(distinctUntilChanged())
        .subscribe(instance.handleDisconnect.bind(instance));
    }
  }

  public subscribeMessages(
    messageHandlers: MessageMappingProperties[],
    client,
    instance: NestGateway,
  ) {
    const adapter = this.config.getIoAdapter();
    const handlers = messageHandlers.map(({ callback, message }) => ({
      message,
      callback: callback.bind(instance, client),
    }));
    adapter.bindMessageHandlers(client, handlers, data =>
      fromPromise(this.pickResult(data)).pipe(mergeAll()),
    );
  }

  public async pickResult(
    defferedResult: Promise<any>,
  ): Promise<Observable<any>> {
    const result = await defferedResult;
    if (result && isFunction(result.subscribe)) {
      return result;
    }
    if (result instanceof Promise) {
      return fromPromise(result);
    }
    return of(result);
  }

  private hookServerToProperties(instance: NestGateway, server) {
    for (const propertyKey of this.metadataExplorer.scanForServerHooks(
      instance,
    )) {
      Reflect.set(instance, propertyKey, server);
    }
  }
}
