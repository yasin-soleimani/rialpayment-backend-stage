import {
  HttpServer,
  IVisionApplication,
  IVisionApplicationContext,
  IVisionMicroservice,
} from '@vision/common';
import { MicroserviceOptions } from '@vision/common/interfaces/microservices/microservice-configuration.interface';
import { VisionMicroserviceOptions } from '@vision/common/interfaces/microservices/vision-microservice-options.interface';
import { VisionApplicationContextOptions } from '@vision/common/interfaces/vision-application-context-options.interface';
import { VisionApplicationOptions } from '@vision/common/interfaces/vision-application-options.interface';
import { IVisionExpressApplication } from '@vision/common/interfaces/vision-express-application.interface';
import { IVisionFastifyApplication } from '@vision/common/interfaces/vision-fastify-application.interface';
import { Logger } from '@vision/common/services/logger.service';
import { loadPackage } from '@vision/common/utils/load-package.util';
import { isFunction } from '@vision/common/utils/shared.utils';
import { ExpressAdapter } from '@vision/core/adapters/express-adapter';
import { ExpressFactory } from '@vision/core/adapters/express-factory';
import { FastifyAdapter } from '@vision/core/adapters/fastify-adapter';
import { ApplicationConfig } from '@vision/core/application-config';
import { messages } from '@vision/core/constants';
import { ExceptionsZone } from '@vision/core/errors/exceptions-zone';
import { VisionContainer } from '@vision/core/injector/container';
import { InstanceLoader } from '@vision/core/injector/instance-loader';
import { MetadataScanner } from '@vision/core/metadata-scanner';
import { VisionApplication } from '@vision/core/vision-application';
import { VisionApplicationContext } from '@vision/core/vision-application-context';
import { DependenciesScanner } from '@vision/core/scanner';

export class VisionFactoryStatic {
  private readonly logger = new Logger('VisionFactory', true);
  /**
   * Creates an instance of the VisionApplication
   * @returns {Promise}
   */
  public async create(
    module: any,
  ): Promise<IVisionApplication & IVisionExpressApplication>;
  public async create(
    module: any,
    options: VisionApplicationOptions,
  ): Promise<IVisionApplication & IVisionExpressApplication>;
  public async create(
    module: any,
    httpServer: FastifyAdapter,
    options?: VisionApplicationOptions,
  ): Promise<IVisionApplication & IVisionFastifyApplication>;
  public async create(
    module: any,
    httpServer: HttpServer,
    options?: VisionApplicationOptions,
  ): Promise<IVisionApplication & IVisionExpressApplication>;
  public async create(
    module: any,
    httpServer: any,
    options?: VisionApplicationOptions,
  ): Promise<IVisionApplication & IVisionExpressApplication>;
  public async create(
    module: any,
    serverOrOptions?: any,
    options?: VisionApplicationOptions,
  ): Promise<
    IVisionApplication & (IVisionExpressApplication | IVisionFastifyApplication)
  > {
    const isHttpServer = serverOrOptions && serverOrOptions.patch;
    // tslint:disable-next-line:prefer-const
    let [httpServer, appOptions] = isHttpServer
      ? [serverOrOptions, options]
      : [ExpressFactory.create(), serverOrOptions];

    const applicationConfig = new ApplicationConfig();
    const container = new VisionContainer(applicationConfig);
    httpServer = this.applyExpressAdapter(httpServer);

    this.applyLogger(appOptions);
    await this.initialize(module, container, applicationConfig, httpServer);
    return this.createVisionInstance<VisionApplication>(
      new VisionApplication(container, httpServer, applicationConfig, appOptions),
    );
  }

  /**
   * Creates an instance of the VisionMicroservice
   *
   * @param  {} module Entry (root) application module class
   * @param  {VisionMicroserviceOptions & MicroserviceOptions} options Optional microservice configuration
   * @returns {Promise}
   */
  public async createMicroservice(
    module,
    options?: VisionMicroserviceOptions & MicroserviceOptions,
  ): Promise<IVisionMicroservice> {
    const { VisionMicroservice } = loadPackage(
      '@vision/microservices',
      'VisionFactory',
    );

    const applicationConfig = new ApplicationConfig();
    const container = new VisionContainer(applicationConfig);

    this.applyLogger(options);
    await this.initialize(module, container, applicationConfig);
    return this.createVisionInstance<IVisionMicroservice>(
      new VisionMicroservice(container, options as any, applicationConfig),
    );
  }

  /**
   * Creates an instance of the VisionApplicationContext
   *
   * @param  {} module Entry (root) application module class
   * @param  {VisionApplicationContextOptions} options Optional Vision application configuration
   * @returns {Promise}
   */
  public async createApplicationContext(
    module,
    options?: VisionApplicationContextOptions,
  ): Promise<IVisionApplicationContext> {
    const container = new VisionContainer();

    this.applyLogger(options);
    await this.initialize(module, container);

    const modules = container.getModules().values();
    const root = modules.next().value;
    const context = this.createVisionInstance<VisionApplicationContext>(
      new VisionApplicationContext(container, [], root),
    );
    return await context.init();
  }

  private createVisionInstance<T>(instance: T): T {
    return this.createProxy(instance);
  }

  private async initialize(
    module,
    container: VisionContainer,
    config = new ApplicationConfig(),
    httpServer: HttpServer = null,
  ) {
    const instanceLoader = new InstanceLoader(container);
    const dependenciesScanner = new DependenciesScanner(
      container,
      new MetadataScanner(),
      config,
    );
    container.setApplicationRef(httpServer);
    try {
      this.logger.log(messages.APPLICATION_START);
      await ExceptionsZone.asyncRun(async () => {
        await dependenciesScanner.scan(module);
        await instanceLoader.createInstancesOfDependencies();
        dependenciesScanner.applyApplicationProviders();
      });
    } catch (e) {
      process.abort();
    }
  }

  private createProxy(target) {
    const proxy = this.createExceptionProxy();
    return new Proxy(target, {
      get: proxy,
      set: proxy,
    });
  }

  private createExceptionProxy() {
    return (receiver, prop) => {
      if (!(prop in receiver)) return;

      if (isFunction(receiver[prop])) {
        return (...args) => {
          let result;
          ExceptionsZone.run(() => {
            result = receiver[prop](...args);
          });
          return result;
        };
      }
      return receiver[prop];
    };
  }

  private applyLogger(options: VisionApplicationContextOptions | undefined) {
    if (!options || !options.logger) {
      return;
    }
    Logger.overrideLogger(options.logger);
  }

  private applyExpressAdapter(httpAdapter: HttpServer): HttpServer {
    const isAdapter = httpAdapter.getHttpServer;
    if (isAdapter) {
      return httpAdapter;
    }
    return new ExpressAdapter(httpAdapter);
  }
}

export const VisionFactory = new VisionFactoryStatic();
