import { ArgumentsHost } from '@vision/common/interfaces/features/arguments-host.interface';

export interface WsExceptionFilter<T = any> {
  catch(exception: T, host: ArgumentsHost);
}