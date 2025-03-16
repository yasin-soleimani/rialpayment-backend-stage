import { ExceptionFilter } from '@vision/common/interfaces/exceptions/exception-filter.interface';
import { Type } from '@vision/common/interfaces/type.interface';

export interface ExceptionFilterMetadata {
  func: ExceptionFilter['catch'];
  exceptionMetatypes: Type<any>[];
}
