import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { INVALID_MIDDLEWARE_CONFIGURATION } from '@vision/core/errors/messages';

export class InvalidMiddlewareConfigurationException extends RuntimeException {
  constructor() {
    super(INVALID_MIDDLEWARE_CONFIGURATION);
  }
}
