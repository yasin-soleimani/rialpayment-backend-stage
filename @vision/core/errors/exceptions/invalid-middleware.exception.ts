import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { InvalidMiddlewareMessage } from '@vision/core/errors/messages';

export class InvalidMiddlewareException extends RuntimeException {
  constructor(name: string) {
    super(InvalidMiddlewareMessage(name));
  }
}
