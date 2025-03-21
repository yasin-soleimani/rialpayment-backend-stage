import { Type } from '@vision/common/interfaces/type.interface';

export type Provider =
  | Type<any>
  | ClassProvider
  | ValueProvider
  | FactoryProvider;

export interface ClassProvider {
  provide: any;
  useClass: Type<any>;
}

export interface ValueProvider {
  provide: any;
  useValue: any;
}

export interface FactoryProvider {
  provide: any;
  useFactory: (...args: any[]) => any;
  inject?: Array<Type<any> | string | any>;
}