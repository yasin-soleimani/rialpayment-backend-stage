import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { UnknownExportMessage } from '@vision/core/errors/messages';

export class UnknownExportException extends RuntimeException {
  constructor(name: string) {
    super(UnknownExportMessage(name));
  }
}
