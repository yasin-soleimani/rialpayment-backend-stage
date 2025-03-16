import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { InvalidModuleMessage } from '@vision/core/errors/messages';

export class InvalidModuleException extends RuntimeException {
  constructor(trace: any[]) {
    const scope = (trace || []).map(module => module.name).join(' -> ');
    super(InvalidModuleMessage(scope));
  }
}
