import { ModuleMetadata } from '@vision/common/interfaces/modules/module-metadata.interface';
import { Type } from '@vision/common/interfaces/type.interface';

export interface DynamicModule extends ModuleMetadata {
  module: Type<any>;
}
