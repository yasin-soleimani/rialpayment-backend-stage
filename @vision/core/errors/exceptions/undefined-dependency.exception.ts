import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { UnknownDependenciesMessage } from '@vision/core/errors/messages';

export class UndefinedDependencyException extends RuntimeException {
  constructor(type: string, index: number, length: number) {
    super(UnknownDependenciesMessage(type, index, length));
  }
}
