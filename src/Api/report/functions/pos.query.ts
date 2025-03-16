import { ReportApiDto } from '../dto/report.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as mongoose from 'mongoose';

export function posQueryBuiler(getInfo: ReportApiDto, withCards = false, cards = []) {
  let tmp = Array();

  if (!getInfo.merchant || isEmpty(getInfo.merchant)) throw new UserCustomException('پذیرنده نامعتبر');

  if (!getInfo.terminal || isEmpty(getInfo.terminal)) throw new UserCustomException('ترمینال نامعتبر');

  const isAllTerminal = getInfo.terminal === '0';
  const isAllMerchant = getInfo.merchant === '0';

  if (withCards) {
    tmp.push({
      cardref: { $in: cards },
    });
  }
  if (!isAllMerchant && isAllTerminal) {
    tmp.push({
      merchant: getInfo.merchant,
    });
  } else if(!isAllTerminal) {
    tmp.push({
      terminal: getInfo.terminal,
    });
  }

  // tmp.push({
  //   type: 14
  // });
  if (getInfo.datefrom) {
    if (getInfo.datefrom >= getInfo.dateto) throw new UserCustomException('بازه زمانی اشتباه است');

    tmp.push({
      createdAt: {
        $gte: new Date(Number(getInfo.datefrom) * 1000),
        $lte: new Date(Number(getInfo.dateto) * 1000),
      },
    });
  }

  if (getInfo.search) {
    tmp.push({
      TraxID: getInfo.search,
    });
  }

  return tmp.length > 0 ? {
    $and: tmp,
  }: {};
}

export function posQueryAggregateBuiler(getInfo: ReportApiDto, cards = []) {
  let tmp = Array();

  if (!getInfo.merchant || isEmpty(getInfo.merchant)) throw new UserCustomException('پذیرنده نامعتبر');
  if (!getInfo.terminal || isEmpty(getInfo.terminal)) throw new UserCustomException('ترمینال نامعتبر');

  const isAllTerminal = getInfo.terminal === '0';
  const isAllMerchant = getInfo.merchant === '0';

  if (!isAllMerchant && isAllTerminal) {
    tmp.push({
      $match: {
        merchant: mongoose.Types.ObjectId(getInfo.merchant),
      },
    });
  } else if (!isAllTerminal) {
    tmp.push({
      $match: {
        terminal: mongoose.Types.ObjectId(getInfo.terminal),
      },
    });
  }

  if (getInfo.datefrom) {
    if (getInfo.datefrom >= getInfo.dateto) throw new UserCustomException('بازه زمانی اشتباه است');
    tmp.push({
      $match: {
        createdAt: {
          $gte: new Date(Number(getInfo.datefrom) * 1000),
          $lte: new Date(Number(getInfo.dateto) * 1000),
        },
      },
    });
  }

  if (getInfo.search) {
    tmp.push({
      $match: {
        TraxID: getInfo.search,
      },
    });
  }

  tmp.push(
    {
      $lookup: {
        from: 'psprequests',
        localField: 'request',
        foreignField: '_id',
        as: 'request',
      },
    },
    {
      $unwind: {
        path: '$request',
        preserveNullAndEmptyArrays: false,
      },
    }
  );

  // بررسی کنیم که آیا کارت‌ها ارسال شده‌اند یا نه
  if (cards.length > 0) {
    tmp.push({
      $match: {
        'request.CardNum': {
          $in: cards,
        },
      },
    });
  }

  tmp.push({
    $sort: { createdAt: -1 },
  });

  // اطمینان حاصل کنیم که tmp خالی نیست
  return tmp.length > 0 ? tmp : [{}];
}