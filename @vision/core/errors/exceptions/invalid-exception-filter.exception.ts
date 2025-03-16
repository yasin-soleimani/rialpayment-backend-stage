import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { INVALID_EXCEPTION_FILTER } from '@vision/core/errors/messages';

export class InvalidExceptionFilterException extends RuntimeException {
  constructor() {
    super(INVALID_EXCEPTION_FILTER);
  }
}
