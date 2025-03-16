import { BackofficeAuthorizeListDto } from '../dto/authorize-list.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';

export function BackofficeAuthorizeQueryBuilderList(getInfo: BackofficeAuthorizeListDto) {
  console.log(getInfo);
  let tmpQuery = Array();

  if (getInfo.mobile) {
    console.log(' ok mobile');
    tmpQuery.push({
      mobile: { $regex: getInfo.mobile },
    });
  }

  if (getInfo.website) {
    tmpQuery.push({
      website: { $regex: getInfo.website },
    });
  }

  if (getInfo.status) {
    tmpQuery.push({
      status: getInfo.status,
    });
  }

  if (getInfo.type) {
    tmpQuery.push({
      type: getInfo.type,
    });
  }

  if (getInfo.title) {
    tmpQuery.push({
      title: { $regex: getInfo.title },
    });
  }

  console.log(tmpQuery, 'tmpQuery');
  if (tmpQuery.length > 0) {
    return {
      $and: tmpQuery,
    };
  } else {
    return {
      type: 1,
    };
  }
}
