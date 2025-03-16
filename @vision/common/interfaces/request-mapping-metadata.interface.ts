import { RequestMethod } from '@vision/common/enums/request-method.enum';

export interface RequestMappingMetadata {
  path?: string;
  method?: RequestMethod;
}
