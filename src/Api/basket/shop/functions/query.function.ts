import { BasketShopApiDto, BasketShopReportExportDto } from '../dto/shop.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as JalaliMoment from 'jalali-moment';

export function shopQueryBuilder(getInfo: BasketShopApiDto, userid: string) {
  let from,
    to = 0;
  let query = Array();
  if (!isEmpty(getInfo.from) && getInfo.from != 'null') from = timestamoToISO(Number(getInfo.from) * 1000);
  if (!isEmpty(getInfo.to) && getInfo.to != 'null') to = timestamoToISO(Number(getInfo.to) * 1000);
  console.log(to, 'to');
  if (!isEmpty(from) && !isEmpty(getInfo.to) && from > to)
    throw new UserCustomException('تاریخ صحیح نمی باشد', false, 500);

  if (from > 0 && to > 0)
    query.push({
      createdAt: { $gte: from, $lte: to },
    });

  if (!isEmpty(getInfo.invoiceid) && getInfo.invoiceid != 'null') query.push({ invoiceid: getInfo.invoiceid });

  if (isEmpty(query)) {
    return { merchantuser: userid, $or: [{ paid: true }, { cashOnDelivery: true }] };
  } else {
    query.push({ merchantuser: userid });
    query.push({ $or: [{ paid: true }, { cashOnDelivery: true }] });
    return { $and: query };
  }
}

export function shopExportQueryBuilder(getInfo: BasketShopReportExportDto, userid: string) {
  let from, to;
  let query = Array();

  if (getInfo.justToday) {
    from = JalaliMoment().startOf('day');
    to = JalaliMoment().endOf('day');
  } else {
    if (getInfo.from === null || getInfo.from === undefined || getInfo.to === null || getInfo.to === undefined) {
      throw new UserCustomException('تاریخ صحیح نمی‌باشد', false, 500);
    }
    from = JalaliMoment(getInfo.from);
    to = JalaliMoment(getInfo.to);

    if (!isEmpty(from) && !isEmpty(getInfo.to) && from > to)
      throw new UserCustomException('تاریخ صحیح نمی باشد', false, 500);
  }

  if (from > 0 && to > 0) {
    query.push({
      createdAt: { $gte: from, $lte: to },
    });
  }
  query.push({ merchantuser: userid });
  query.push({ paid: true });
  return { $and: query };
}
