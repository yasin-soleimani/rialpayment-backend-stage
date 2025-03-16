import { VoucherSearchDto } from '../dto/voucher-search.dto';
import { timestamoToISOEndDay, timestamoToISOStartDay } from '@vision/common/utils/month-diff.util';
import { VoucherType } from '../const/voucher-type.const';
import { ObjectID } from 'bson';
import { Types } from 'mongoose';

export function VoucherApiSearchQueryBuilder(userid: string, getInfo: VoucherSearchDto) {
  let tmp = Array();
  if (getInfo.from && getInfo.to) {
    const from = timestamoToISOStartDay(Number(getInfo.from));
    const to = timestamoToISOEndDay(Number(getInfo.to));
    tmp.push({ updatedAt: { $gte: from, $lte: to } });
  }

  let ObjId = Types.ObjectId;

  if (getInfo.amount) tmp.push({ amount: getInfo.amount });

  if (getInfo.voucherid) tmp.push({ id: getInfo.voucherid });

  if (getInfo.type == VoucherType.Used) {
    tmp.push({
      $or: [{ 'details.user': ObjId(userid) }],
    });
  } else {
    tmp.push({ user: ObjId(userid) });
  }

  const query = { $and: tmp };

  if (getInfo.type == VoucherType.Generated) {
    return [{ $match: query }];
  } else {
    return [{ $unwind: '$details' }, { $match: query }];
  }
}
