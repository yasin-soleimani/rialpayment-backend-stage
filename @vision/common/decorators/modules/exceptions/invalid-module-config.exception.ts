import { InvalidModuleConfigMessage } from '@vision/common/decorators/modules/exceptions/constants';

export class InvalidModuleConfigException extends Error {
  constructor(property: string) {
    super(InvalidModuleConfigMessage(property));
  }
}
