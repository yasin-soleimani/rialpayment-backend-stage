import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { UNKNOWN_REQUEST_MAPPING } from '@vision/core/errors/messages';

export class UnknownRequestMappingException extends RuntimeException {
  constructor() {
    super(UNKNOWN_REQUEST_MAPPING);
  }
}
