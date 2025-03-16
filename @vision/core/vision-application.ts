import {
  CanActivate,
  ExceptionFilter,
  IVisionApplication,
  IVisionMicroservice,
  VisionInterceptor,
  OnModuleDestroy,
  PipeTransform,
  WebSocketAdapter,
} from '@vision/common';
import { HttpServer } from '@vision/common/interfaces';
import { CorsOptions } from '@vision/common/interfaces/external/cors-options.interface';
import { ServeStaticOptions } from '@vision/common/interfaces/external/serve-static-options.interface';
import { MicroserviceOptions } from '@vision/common/interfaces/microservices/microservice-configuration.interface';
import { VisionApplicationOptions } from '@vision/common/interfaces/vision-application-options.interface';
import { IVisionExpressApplication } from '@vision/common/interfaces/vision-express-application.interface';
import { IVisionFastifyApplication } from '@vision/common/interfaces/vision-fastify-application.interface';
import { Logger } from '@vision/common/services/logger.service';
import { loadPackage } from '@vision/common/utils/load-package.util';
import {
  isFunction,
  isNil,
  isObject,
  isUndefined,
  validatePath,
} from '@vision/common/utils/shared.utils';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as http from 'http';
import * as https from 'https';
import iterate from 'iterare';
import * as optional from 'optional';
import { ExpressAdapter } from '@vision/core/adapters/express-adapter';
import { FastifyAdapter } from '@vision/core/adapters/fastify-adapter';
import { ApplicationConfig } from '@vision/core/application-config';
import { messages } from '@vision/core/constants';
import { VisionContainer } from '@vision/core/injector/container';
import { Module } from '@vision/core/injector/module';
import { MiddlewareContainer } from '@vision/core/middleware/container';
import { MiddlewareModule } from '@vision/core/middleware/middleware-module';
import { VisionApplicationContext } from '@vision/core/vision-application-context';
import { Resolver } from '@vision/core/router/interfaces/resolver.interface';
import { RoutesResolver } from '@vision/core/router/routes-resolver';

const { SocketModule } =
  optional('@vision/websockets/socket-module') || ({} as any);
const { MicroservicesModule } =
  optional('@vision/microservices/microservices-module') || ({} as any);
const { IoAdapter } =
  optional('@vision/websockets/adapters/io-adapter') || ({} as any);

export class VisionApplication extends VisionApplicationContext
  implements IVisionApplication,
    IVisionExpressApplication,
    IVisionFastifyApplication {
  private readonly logger = new Logger(VisionApplication.name, true);
  private readonly middlewareModule = new MiddlewareModule();
  private readonly middlewareContainer = new MiddlewareContainer();
  private readonly microservicesModule = MicroservicesModule
    ? new MicroservicesModule()
    : null;
  private readonly socketModule = SocketModule ? new SocketModule() : null;
  private readonly routesResolver: Resolver;
  private readonly microservices = [];
  private httpServer: http.Server;
  private isInitialized = false;

  constructor(
    container: VisionContainer,
    private readonly httpAdapter: HttpServer,
    private readonly config: ApplicationConfig,
    private readonly appOptions: VisionApplicationOptions = {},
  ) {
    super(container, [], null);

    this.applyOptions();
    this.selectContextModule();
    this.registerHttpServer();

    this.routesResolver = new RoutesResolver(this.container, this.config);
  }

  public registerHttpServer() {
    this.httpServer = this.createServer();

    const server = this.getUnderlyingHttpServer();
    const ioAdapter = IoAdapter ? new IoAdapter(server) : null;
    this.config.setIoAdapter(ioAdapter);
  }

  public applyOptions() {
    if (!this.appOptions || !this.appOptions.cors) {
      return undefined;
    }
    const isCorsOptionsObj = isObject(this.appOptions.cors);
    if (!isCorsOptionsObj) {
      return this.enableCors();
    }
    this.enableCors(this.appOptions.cors as CorsOptions);
  }

  public createServer(): any {
    const isHttpsEnabled = this.appOptions && this.appOptions.httpsOptions;
    const isExpress = this.isExpress();

    if (isHttpsEnabled && isExpress) {
      return https.createServer(
        this.appOptions.httpsOptions,
        this.httpAdapter.getHttpServer(),
      );
    }
    if (isExpress) {
      return http.createServer(this.httpAdapter.getHttpServer());
    }
    return this.httpAdapter;
  }

  public getUnderlyingHttpServer(): any {
    return this.isExpress()
      ? this.httpServer
      : this.httpAdapter.getHttpServer();
  }

  public async registerModules() {
    this.socketModule &&
      this.socketModule.register(this.container, this.config);

    if (this.microservicesModule) {
      this.microservicesModule.register(this.container, this.config);
      this.microservicesModule.setupClients(this.container);
    }
    await this.middlewareModule.register(
      this.middlewareContainer,
      this.container,
      this.config,
    );
  }

  public async init(): Promise<this> {
    const useBodyParser =
      this.appOptions && this.appOptions.bodyParser !== false;
    useBodyParser && this.registerParserMiddleware();

    await this.registerModules();
    await this.registerRouter();
    await this.callInitHook();

    this.isInitialized = true;
    this.logger.log(messages.APPLICATION_READY);
    return this;
  }

  public registerParserMiddleware() {
    if (this.httpAdapter instanceof FastifyAdapter) {
      return this.httpAdapter.register(
        this.loadPackage('fastify-formbody', 'FastifyAdapter'),
      );
    }
    if (!this.isExpress()) {
      return undefined;
    }
    const parserMiddleware = {
      jsonParser: bodyParser.json(),
      urlencodedParser: bodyParser.urlencoded({ extended: true }),
    };
    Object.keys(parserMiddleware)
      .filter(parser => !this.isMiddlewareApplied(this.httpAdapter, parser))
      .forEach(parserKey => this.httpAdapter.use(parserMiddleware[parserKey]));
  }

  public isMiddlewareApplied(httpAdapter: HttpServer, name: string): boolean {
    const app = this.httpAdapter.getHttpServer();
    return (
      !!app._router &&
      !!app._router.stack &&
      isFunction(app._router.stack.filter) &&
      !!app._router.stack.filter(
        layer => layer && layer.handle && layer.handle.name === name,
      ).length
    );
  }

  public async registerRouter() {
    await this.registerMiddleware(this.httpAdapter);
    const prefix = this.config.getGlobalPrefix();
    const basePath = prefix ? validatePath(prefix) : '';
    this.routesResolver.resolve(this.httpAdapter, basePath);
  }

  public connectMicroservice(options: MicroserviceOptions): IVisionMicroservice {
    const { VisionMicroservice } = loadPackage(
      '@vision/microservices',
      'VisionFactory',
    );

    const applicationConfig = new ApplicationConfig();
    const instance = new VisionMicroservice(
      this.container as any,
      options as any,
      applicationConfig,
    );
    instance.registerListeners();
    instance.setIsInitialized(true);
    instance.setIsInitHookCalled(true);

    this.microservices.push(instance);
    return instance;
  }

  public getMicroservices(): IVisionMicroservice[] {
    return this.microservices;
  }

  public getHttpServer() {
    return this.httpServer;
  }

  public startAllMicroservices(callback?: () => void): this {
    Promise.all(this.microservices.map(this.listenToPromise)).then(
      () => callback && callback(),
    );
    return this;
  }

  public startAllMicroservicesAsync(): Promise<void> {
    return new Promise(resolve => this.startAllMicroservices(resolve));
  }

  public use(...args: any[]): this {
    (this.httpAdapter as any).use(...args);
    return this;
  }

  public engine(...args): this {
    if (!this.isExpress()) {
      return this;
    }
    (this.httpAdapter as ExpressAdapter).engine(...args);
    return this;
  }

  public set(...args): this {
    if (!this.isExpress()) {
      return this;
    }
    (this.httpAdapter as ExpressAdapter).set(...args);
    return this;
  }

  public disable(...args): this {
    if (!this.isExpress()) {
      return this;
    }
    (this.httpAdapter as ExpressAdapter).disable(...args);
    return this;
  }

  public enable(...args): this {
    if (!this.isExpress()) {
      return this;
    }
    (this.httpAdapter as ExpressAdapter).enable(...args);
    return this;
  }

  public register(...args): this {
    const adapter = this.httpAdapter as FastifyAdapter;
    adapter.register && adapter.register(...args);
    return this;
  }

  public inject(...args) {
    const adapter = this.httpAdapter as FastifyAdapter;
    return adapter.inject && adapter.inject(...args);
  }

  public enableCors(options?: CorsOptions): this {
    this.httpAdapter.use(cors(options));
    return this;
  }

  public async listen(port: number | string, callback?: () => void);
  public async listen(
    port: number | string,
    hostname: string,
    callback?: () => void,
  );
  public async listen(port: number | string, ...args) {
    !this.isInitialized && (await this.init());

    this.httpServer.listen(port, ...args);
    return this.httpServer;
  }

  public listenAsync(port: number | string, hostname?: string): Promise<any> {
    return new Promise(resolve => {
      const server = this.listen(port, hostname, () => resolve(server));
    });
  }

  public async close(): Promise<any> {
    this.socketModule && (await this.socketModule.close());
    this.httpServer && this.httpServer.close();

    await Promise.all(
      iterate(this.microservices).map(async microservice => {
        microservice.setIsTerminated(true);
        await microservice.close();
      }),
    );
    await this.callDestroyHook();
  }

  public setGlobalPrefix(prefix: string): this {
    this.config.setGlobalPrefix(prefix);
    return this;
  }

  public useWebSocketAdapter(adapter: WebSocketAdapter): this {
    this.config.setIoAdapter(adapter);
    return this;
  }

  public useGlobalFilters(...filters: ExceptionFilter[]): this {
    this.config.useGlobalFilters(...filters);
    return this;
  }

  public useGlobalPipes(...pipes: PipeTransform<any>[]): this {
    this.config.useGlobalPipes(...pipes);
    return this;
  }

  public useGlobalInterceptors(...interceptors: VisionInterceptor[]): this {
    this.config.useGlobalInterceptors(...interceptors);
    return this;
  }

  public useGlobalGuards(...guards: CanActivate[]): this {
    this.config.useGlobalGuards(...guards);
    return this;
  }

  public useStaticAssets(options: any): this;
  public useStaticAssets(path: string, options?: ServeStaticOptions);
  public useStaticAssets(
    pathOrOptions: any,
    options?: ServeStaticOptions,
  ): this {
    this.httpAdapter.useStaticAssets &&
      this.httpAdapter.useStaticAssets(pathOrOptions, options);
    return this;
  }

  public setBaseViewsDir(path: string): this {
    this.httpAdapter.setBaseViewsDir && this.httpAdapter.setBaseViewsDir(path);
    return this;
  }

  public setViewEngine(engineOrOptions: any): this {
    this.httpAdapter.setViewEngine &&
      this.httpAdapter.setViewEngine(engineOrOptions);
    return this;
  }

  private loadPackage(name: string, ctx: string) {
    return loadPackage(name, ctx);
  }

  private async registerMiddleware(instance) {
    await this.middlewareModule.registerMiddleware(
      this.middlewareContainer,
      instance,
    );
  }

  private isExpress(): boolean {
    const isExpress = !this.httpAdapter.getHttpServer;
    if (isExpress) {
      return isExpress;
    }
    return this.httpAdapter instanceof ExpressAdapter;
  }

  private listenToPromise(microservice: IVisionMicroservice) {
    return new Promise(async (resolve, reject) => {
      await microservice.listen(resolve);
    });
  }

  private async callDestroyHook(): Promise<any> {
    const modules = this.container.getModules();
    await Promise.all(
      iterate(modules.values()).map(
        async module => await this.callModuleDestroyHook(module),
      ),
    );
  }

  private async callModuleDestroyHook(module: Module): Promise<any> {
    const components = [...module.routes, ...module.components];
    await Promise.all(
      iterate(components)
        .map(([key, { instance }]) => instance)
        .filter(instance => !isNil(instance))
        .filter(this.hasOnModuleDestroyHook)
        .map(
          async instance =>
            await (instance as OnModuleDestroy).onModuleDestroy(),
        ),
    );
  }

  private hasOnModuleDestroyHook(instance): instance is OnModuleDestroy {
    return !isUndefined((instance as OnModuleDestroy).onModuleDestroy);
  }
}
