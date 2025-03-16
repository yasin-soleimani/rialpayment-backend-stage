import { isEmpty } from '@vision/common/utils/shared.utils';
import { BackofficeAccountBlockFilterDto } from '../dto/account-block-filter.dto';

export function BackofficeAccountBlockQueryBuilder(getInfo: BackofficeAccountBlockFilterDto) {
  let tmpQuery = Array();

  if (!isEmpty(getInfo.fullname)) {
    tmpQuery.push({
      'userx.fullname': { $regex: getInfo.fullname },
    });
  }

  if (!isEmpty(getInfo.nationalcode)) {
    tmpQuery.push({
      'userx.nationalcode': { $regex: getInfo.nationalcode },
    });
  }

  if (!isEmpty(getInfo.mobile)) {
    tmpQuery.push({
      mob: { $regex: getInfo.mobile },
    });
  }

  if (tmpQuery.length < 1) {
    return { status: true };
  } else {
    tmpQuery.push({
      status: true,
    });
    return {
      $and: tmpQuery,
    };
  }
}
