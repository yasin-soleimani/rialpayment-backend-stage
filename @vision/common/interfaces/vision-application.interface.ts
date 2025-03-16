import { IVisionMicroservice, ExceptionFilter, PipeTransform } from '@vision/common/interfaces';
import { WebSocketAdapter } from '@vision/common/interfaces/websockets/web-socket-adapter.interface';
import { CanActivate } from '@vision/common/interfaces/features/can-activate.interface';
import { VisionInterceptor } from '@vision/common/interfaces/features/vision-interceptor.interface';
import { IVisionApplicationContext } from '@vision/common/interfaces/vision-application-context.interface';
import { CorsOptions } from '@vision/common/interfaces/external/cors-options.interface';
import { MicroserviceOptions } from '@vision/common/interfaces/microservices/microservice-configuration.interface';

export interface IVisionApplication extends IVisionApplicationContext {
  /**
   * Initializes application. It is not mandatory to call this method directly.
   *
   * @returns {Promise}
   */
  init(): Promise<this>;

  /**
   * A wrapper function around HTTP adapter method: `adapter.use()`.
   * Example `app.use(cors())`
   *
   * @returns {void}
   */
  use(...args): this;

  /**
   * Enables CORS (Cross-Origin Resource Sharing)
   *
   * @returns {void}
   */
  enableCors(options?: CorsOptions): this;

  /**
   * Starts the application.
   *
   * @param  {number} port
   * @param  {string} hostname
   * @param  {Function} callback Optional callback
   * @returns {Promise}
   */
  listen(port: number | string, callback?: () => void): Promise<any>;
  listen(
    port: number | string,
    hostname: string,
    callback?: () => void,
  ): Promise<any>;

  /**
   * Starts the application (can be awaited).
   *
   * @param  {number} port
   * @param  {string} hostname (optional)
   * @returns {Promise}
   */
  listenAsync(port: number | string, hostname?: string): Promise<any>;

  /**
   * Registers the prefix for the every HTTP route path
   *
   * @param  {string} prefix The prefix for the every HTTP route path (for example `/v1/api`)
   * @returns {void}
   */
  setGlobalPrefix(prefix: string): this;

  /**
   * Setup Ws Adapter which will be used inside Gateways.
   * Use, when you want to override default `socket.io` library.
   *
   * @param  {WebSocketAdapter} adapter
   * @returns {void}
   */
  useWebSocketAdapter(adapter: WebSocketAdapter): this;

  /**
   * Connects microservice to the VisionApplication instance. Transforms application to the hybrid instance.
   *
   * @param  {MicroserviceOptions} options Microservice options object
   * @returns {IVisionMicroservice}
   */
  connectMicroservice(options: MicroserviceOptions): IVisionMicroservice;

  /**
   * Returns array of the microservices connected to the VisionApplication.
   *
   * @returns {IVisionMicroservice[]}
   */
  getMicroservices(): IVisionMicroservice[];

  /**
   * Returns an underlying, native HTTP server.
   *
   * @returns {http.Server}
   */
  getHttpServer(): any;

  /**
   * Starts all connected microservices asynchronously
   *
   * @param  {Function} callback Optional callback function
   * @returns {void}
   */
  startAllMicroservices(callback?: () => void): this;

  /**
   * Starts all connected microservices and can be awaited
   *
   * @returns {Promise}
   */
  startAllMicroservicesAsync(): Promise<void>;

  /**
   * Registers exception filters as a global filters (will be used within every HTTP route handler)
   *
   * @param  {ExceptionFilter[]} ...filters
   */
  useGlobalFilters(...filters: ExceptionFilter[]): this;

  /**
   * Registers pipes as a global pipes (will be used within every HTTP route handler)
   *
   * @param  {PipeTransform[]} ...pipes
   */
  useGlobalPipes(...pipes: PipeTransform<any>[]): this;

  /**
   * Registers interceptors as a global interceptors (will be used within every HTTP route handler)
   *
   * @param  {VisionInterceptor[]} ...interceptors
   */
  useGlobalInterceptors(...interceptors: VisionInterceptor[]): this;

  /**
   * Registers guards as a global guards (will be used within every HTTP route handler)
   *
   * @param  {CanActivate[]} ...guards
   */
  useGlobalGuards(...guards: CanActivate[]): this;

  /**
   * Terminates the application (including VisionApplication, Gateways, and each connected microservice)
   *
   * @returns {Promise<void>}
   */
  close(): Promise<void>;
}
