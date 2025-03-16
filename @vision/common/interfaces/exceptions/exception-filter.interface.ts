import { ArgumentsHost } from '@vision/common/interfaces/features/arguments-host.interface';

export interface ExceptionFilter<T = any> {
  catch(exception: T, host: ArgumentsHost);
}
