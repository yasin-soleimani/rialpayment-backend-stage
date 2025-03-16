import { OpaqueToken } from '@vision/core/injector/module';

export abstract class ModuleRef {
  public abstract get<T>(type: OpaqueToken): T;
}
