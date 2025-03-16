import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';

export class UnknownModuleException extends RuntimeException {
  constructor() {
    super(
      'Vision cannot select given module (it does not exist in current context)',
    );
  }
}
