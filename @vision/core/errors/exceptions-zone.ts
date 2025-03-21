import { ExceptionHandler } from '@vision/core/errors/exception-handler';
import { UNHANDLED_RUNTIME_EXCEPTION } from '@vision/core/errors/messages';

export class ExceptionsZone {
  private static readonly exceptionHandler = new ExceptionHandler();

  public static run(fn: () => void) {
    try {
      fn();
    } catch (e) {
      this.exceptionHandler.handle(e);
      throw UNHANDLED_RUNTIME_EXCEPTION;
    }
  }

  public static async asyncRun(fn: () => Promise<void>) {
    try {
      await fn();
    } catch (e) {
      this.exceptionHandler.handle(e);
      throw UNHANDLED_RUNTIME_EXCEPTION;
    }
  }
}
