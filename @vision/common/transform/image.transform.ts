import { isEmpty, isNil } from "@vision/common/utils/shared.utils";
import { isNullOrUndefined, isNull, isUndefined } from "util";

export function imageTransform (data) {
// TODO complete Compare Data in this scope
  if ( isEmpty(data)) {
    return '';
  } else if (data == 'null') {
    return '';
  } else if( data == 'undefined' ) {
    return '';
  } else {
    return process.env.SITE_URL + data;
  }
}