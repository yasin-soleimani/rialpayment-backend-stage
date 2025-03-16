import { WebSocketAdapter } from '@vision/common/interfaces/websockets/web-socket-adapter.interface';
import { ExceptionFilter } from '@vision/common/interfaces/exceptions/exception-filter.interface';
import { PipeTransform } from '@vision/common/interfaces/features/pipe-transform.interface';
import { VisionInterceptor } from '@vision/common/interfaces/features/vision-interceptor.interface';
import { CanActivate } from '@vision/common/interfaces/features/can-activate.interface';
import { IVisionApplicationContext } from '@vision/common/interfaces/vision-application-context.interface';

export interface IVisionMicroservice extends IVisionApplicationContext {
  /**
   * Starts the microservice.
   *
   * @param  {Function} callback
   * @returns {Promise}
   */
  listen(callback: (value) => void);

  /**
   * Starts the microservice (can be awaited).
   *
   * @returns {Promise}
   */
  listenAsync(): Promise<any>;

  /**
   * Register Ws Adapter which will be used inside Gateways.
   * Use, when you want to override default `socket.io` library.
   *
   * @param  {WebSocketAdapter} adapter
   * @returns {void}
   */
  useWebSocketAdapter(adapter: WebSocketAdapter): this;

  /**
   * Registers exception filters as a global filters (will be used within every message pattern handler)
   *
   * @param  {ExceptionFilter[]} ...filters
   */
  useGlobalFilters(...filters: ExceptionFilter[]): this;

  /**
   * Registers pipes as a global pipes (will be used within every message pattern handler)
   *
   * @param  {PipeTransform[]} ...pipes
   */
  useGlobalPipes(...pipes: PipeTransform<any>[]): this;

  /**
   * Registers interceptors as a global interceptors (will be used within every message pattern handler)
   *
   * @param  {VisionInterceptor[]} ...interceptors
   */
  useGlobalInterceptors(...interceptors: VisionInterceptor[]): this;

  /**
   * Registers guards as a global guards (will be used within every message pattern handler)
   *
   * @param  {CanActivate[]} ...guards
   */
  useGlobalGuards(...guards: CanActivate[]): this;

  /**
   * Terminates the application
   *
   * @returns {Promise<void>}
   */
  close(): Promise<void>;
}
