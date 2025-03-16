import { HistoryFilterDto } from '../../../Api/history/dto/filter.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { timestamoToISOStartDay, timestamoToISOEndDay } from '@vision/common/utils/month-diff.util';
import * as momentjs from 'jalali-moment';

export function LogFilterQueryBuilder(getInfo: HistoryFilterDto, userid: string) {
  let query = Array();

  if (getInfo.type != '') {
    query.push({ ref: { $regex: new RegExp(getInfo.type + '-+') } });
  }

  if (getInfo.from) {
    if (getInfo.from >= getInfo.to) throw new UserCustomException('بازه زمانی نامناسب');
    const from = timestamoToISOStartDay(getInfo.from);
    const to = timestamoToISOEndDay(getInfo.to);
    query.push({
      createdAt: {
        $gte: from,
        $lte: to,
      },
    });
  }

  if (getInfo.search && getInfo.search.length > 1) {
    query.push({
      $or: [{ title: { $regex: getInfo.search } }, { ref: { $regex: getInfo.search } }],
    });
  }

  if (query.length > 0) {
    return {
      $and: query,
      $or: [{ from: userid }, { to: userid }],
    };
  } else {
    return {
      $or: [{ from: userid }, { to: userid }],
    };
  }
}

export function logMakeResult(data: any, userid: string) {
  let docs = Array();
  for (let i = 0; data.docs.length > i; i++) {
    if (data.docs[i].to == userid) {
      let status = false;
      if (data.docs[i].status == 1 || data.docs[i].status == true) {
        status = true;
      }
      docs.push({
        _id: data.docs[i]._id,
        ref: data.docs[i].ref,
        title: data.docs[i].title,
        in: data.docs[i].amount,
        out: 0,
        amount: data.docs[i].amount,
        status: status,
        mod: data.docs[i].senderbalance || 0,
        createdAt: data.docs[i].createdAt,
      });
    } else {
      let status = false;
      if (data.docs[i].status == 1 || data.docs[i].status == true) {
        status = true;
      }
      docs.push({
        _id: data.docs[i]._id,
        ref: data.docs[i].ref,
        title: data.docs[i].title,
        in: 0,
        out: data.docs[i].amount,
        amount: data.docs[i].amount,
        status: data.docs[i].status,
        mod: data.docs[i].receivebalance || 0,
        createdAt: data.docs[i].createdAt,
      });
    }
  }
  data.docs = docs;
  return data;
}

export function logMakeExcel(data: any, userid: string) {
  let docs = Array();

  for (const info of data) {
    let status = 'ناموفق';
    if (info.status == 1 || info.status == true) {
      status = 'موفق';
    }
    if (info.to == userid) {
      docs.push({
        _id: info._id,
        ref: info.ref,
        title: info.title,
        in: info.amount,
        out: 0,
        amount: info.amount,
        status: status,
        mod: info.senderbalance || 0,
        date: momentjs(info.createdAt).locale('fa').format('YYYY/MM/DD HH:mm:ss'),
      });
    } else {
      docs.push({
        _id: info._id,
        ref: info.ref,
        title: info.title,
        in: 0,
        out: info.amount,
        amount: info.amount,
        status: status,
        mod: info.receivebalance || 0,
        date: momentjs(info.createdAt).locale('fa').format('YYYY/MM/DD HH:mm:ss'),
      });
    }
  }

  return docs;
}
