import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';

export class UnknownElementException extends RuntimeException {
  constructor() {
    super(
      'Vision cannot find given element (it does not exist in current context)',
    );
  }
}
