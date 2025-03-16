import { RpcExceptionFilter } from '@vision/common/interfaces/exceptions/rpc-exception-filter.interface';
import { Type } from '@vision/common/interfaces/type.interface';

export interface RpcExceptionFilterMetadata {
  func: RpcExceptionFilter['catch'];
  exceptionMetatypes: Type<any>[];
}
