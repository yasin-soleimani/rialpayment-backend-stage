import { BackofficeUsersLogDto } from '../dto/users-log.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';

export function BackofficeUsersLogQueryBuilder(getInfo: BackofficeUsersLogDto) {
  let from,
    to = 0;
  let tmpArray = Array();
  if (!isEmpty(getInfo.from) && !isEmpty(getInfo.to)) {
    from = timestamoToISO(getInfo.from * 1000);
    to = timestamoToISO(getInfo.to * 1000);
    tmpArray.push({
      createdAt: {
        $gte: from,
        $lte: to,
      },
    });
  }

  if (!isEmpty(getInfo.type)) tmpArray.push({ ref: { $regex: getInfo.type } });

  if (!isEmpty(getInfo.amountfrom) && !isEmpty(getInfo.amountto))
    tmpArray.push({
      amount: {
        $gte: getInfo.amountfrom,
        $lte: getInfo.amountto,
      },
    });

  if (isEmpty(tmpArray))
    if (getInfo.userid)
      return {
        $or: [{ to: getInfo.userid }, { from: getInfo.userid }],
      };
    else return {};

  tmpArray.push({
    $or: [{ to: getInfo.userid }, { from: getInfo.userid }],
  });

  return { $and: tmpArray };
}

export function userCashoutQueryBuilder(from, to, userid) {
  let tmpArray = Array();
  if (!isEmpty(from) && !isEmpty(to)) {
    const fromx = timestamoToISO(from * 1000);
    const tox = timestamoToISO(to * 1000);

    tmpArray.push({
      createdAt: {
        $gte: fromx,
        $lte: tox,
      },
    });
  }

  if (isEmpty(tmpArray)) {
    return {
      user: userid,
    };
  }

  tmpArray.push({
    user: userid,
  });
  return {
    $and: tmpArray,
  };
}
