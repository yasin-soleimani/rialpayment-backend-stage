import { BackofficeReportDto } from '../dto/report.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

export function BackofficeReportQueryBuilder(getInfo: BackofficeReportDto) {
  let from, to;
  if (!isEmpty(getInfo.from) && !isEmpty(getInfo.to)) {
    to = new Date(Number(getInfo.to) * 1000);
    from = new Date(Number(getInfo.from) * 1000);
    if (from > to) throw new UserCustomException('تاریخ اشتباه می باشد');
    return {
      createdAt: {
        $gte: from,
        $lte: to,
      },
      userinvoice: { $not: /IccIpg-/ },
      $or: [{ paytype: 1 }, { paytype: 2 }],
      'details.respcode': { $eq: 0 },
    };
  }

  return { userinvoice: /Ipg-/, $or: [{ paytype: 1 }, { paytype: 2 }], 'details.respcode': { $eq: 0 } };
}

export function BackofficeReportIpgType3QueryBuilder(getInfo: BackofficeReportDto) {
  let from, to;
  let tmpArray = Array();
  if (!isEmpty(getInfo.from) && !isEmpty(getInfo.to)) {
    to = new Date(Number(getInfo.to) * 1000);
    from = new Date(Number(getInfo.from) * 1000);

    if (from > to) throw new UserCustomException('تاریخ اشتباه می باشد');
    return {
      createdAt: {
        $gte: from,
        $lte: to,
      },
      userinvoice: { $not: /IccIpg-/ },
      paytype: 3,
      'details.respcode': { $eq: 0 },
    };
  }

  return { userinvoice: /Ipg-/, paytype: 3, 'details.respcode': { $eq: 0 } };
}

export function BackofficeReportPosQueryBuiler(getInfo: BackofficeReportDto) {
  let from,
    to = 0;
  let tmpArray = Array();
  if (!isEmpty(getInfo.from) && isEmpty(getInfo.to)) {
    to = timestamoToISO(getInfo.to * 1000);
    from = timestamoToISO(getInfo.from * 1000);
    if (from > to) throw new UserCustomException('تاریخ اشتباه می باشد');
    tmpArray.push({
      createdAt: {
        $gte: from,
        lte: to,
      },
    });
  }
  if (!isEmpty(tmpArray)) {
    tmpArray.push({ $or: [{ reverse: true }, { reverse: false, confirm: false }] });
    return { $and: tmpArray };
  }

  return { $or: [{ reverse: true }, { reverse: false, confirm: false }] };
}

export function BackofficeReportWebServiceQueryBuiler(getInfo: BackofficeReportDto) {
  let from,
    to = 0;
  let tmpArray = Array();
  if (!isEmpty(getInfo.from) && isEmpty(getInfo.to)) {
    to = timestamoToISO(getInfo.to * 1000);
    from = timestamoToISO(getInfo.from * 1000);
    if (from > to) throw new UserCustomException('تاریخ اشتباه می باشد');
    tmpArray.push({
      createdAt: {
        $gte: from,
        lte: to,
      },
    });
  }
  if (!isEmpty(tmpArray)) {
    tmpArray.push({ ref: /WebServiceWage/, status: true });
    return { $and: tmpArray };
  }
  return { ref: /WebServiceWage/, status: true };
}

export function BackofficeReportIpgQueryBuilder(from, to, terminalid) {
  const dateto = new Date(Number(to) * 1000);
  const datefrom = new Date(Number(from) * 1000);

  if (terminalid) {
    return {
      createdAt: { $gte: datefrom, $lte: dateto },
      terminalid: terminalid,
    };
  } else {
    return {
      createdAt: { $gte: datefrom, $lte: dateto },
    };
  }
}
