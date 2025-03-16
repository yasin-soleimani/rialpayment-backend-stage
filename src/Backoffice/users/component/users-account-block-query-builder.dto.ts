import { BackofficeUSersAccountBlockFilterDto } from '../dto/users-block-filter.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { Types } from 'mongoose';

export function BackofficeUsersAccountBlockQueryBuilder(getInfo: BackofficeUSersAccountBlockFilterDto) {
  let tmpQuery = Array();
  let status;
  let from, to;
  let ObjId = Types.ObjectId;

  if (!isEmpty(getInfo.from) && getInfo.from != 'null') from = new Date(timestamoToISO(Number(getInfo.from) * 1000));
  if (!isEmpty(getInfo.to) && getInfo.to != 'null') to = new Date(timestamoToISO(Number(getInfo.to) * 1000));

  if (!isEmpty(from) && !isEmpty(getInfo.to) && from > to)
    throw new UserCustomException('تاریخ صحیح نمی باشد', false, 500);

  if (from > 0 && to > 0) {
    tmpQuery.push({
      createdAt: { $gte: from, $lte: to },
    });
  }

  if (!isEmpty(getInfo.status)) {
    if (getInfo.status == true || getInfo.status == 'true') {
      status = true;
    }

    if (getInfo.status == false || getInfo.status == 'false') {
      status = false;
    }

    tmpQuery.push({
      status: status,
    });
  }

  if (tmpQuery.length < 1) {
    return { user: ObjId(getInfo.user) };
  } else {
    tmpQuery.push({ user: ObjId(getInfo.user) });
    return {
      $and: tmpQuery,
    };
  }
}
