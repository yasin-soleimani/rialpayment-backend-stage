import { Type } from '@vision/common/interfaces/type.interface';
import { DynamicModule } from '@vision/common/interfaces/modules/dynamic-module.interface';
import { ForwardReference } from '@vision/common/interfaces/modules/forward-reference.interface';
import { Provider } from '@vision/common/interfaces/modules/provider.interface';

export interface ModuleMetadata {
  imports?: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  controllers?: Type<any>[];
  providers?: Provider[];
  exports?: Array<
    | DynamicModule
    | Promise<DynamicModule>
    | string
    | Provider
    | ForwardReference
  >;
  /** @deprecated */
  modules?: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  /** @deprecated */
  components?: Provider[];
}
