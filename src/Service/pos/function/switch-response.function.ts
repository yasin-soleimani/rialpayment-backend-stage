import * as jalalimoment from 'jalali-moment';

export function PosInvalidPin() {
  return {
    status: 500,
    success: false,
    message: 'رمز نامعتبر',
  };
}

export function PosNotEnoughResource() {
  return {
    status: 500,
    success: false,
    message: 'موجودی ناکافی',
  };
}

export function PosSuccess(res, message) {
  return {
    status: 200,
    success: true,
    message: message,
    amount: res.TrnAmt,
    date: res.ReceiveDT,
    datex: jalalimoment(res.ReceiveDT).locale('fa').format('jYYYY/jMM/jDD HH:mm'),
    transid: posDigitCheck(res.TraxID),
    cardno: res.CardNum,
    data: res.Data,
  };
}

export function LastSuccess(res, message) {
  return {
    status: 200,
    success: true,
    message: message,
    amount: res.TrnAmt,
    date: res.ReceiveDT,
    transid: posDigitCheck(res.TraxID),
    cardno: res.CardNum,
    data: [res.Data],
  };
}

export function PosDefault() {
  return {
    status: 500,
    success: false,
    message: 'خطا در تراکنش',
  };
}

export function PosQrResponse(amount: number, ref: any, data: any) {
  return {
    status: 200,
    success: true,
    message: 'عملیات با موفقیت انجام شد',
    amount: amount,
    date: new Date(),
    datex: jalalimoment(new Date()).locale('fa').format('YYYY/M/D HH:mm'),
    transid: ref,
    cardno: null,
    data: data,
  };
}

function posDigitCheck(data) {
  if (typeof data == 'string') {
    if (data.length > 5) {
      return data.substring(data.length - 5);
    } else {
      return Number(data);
    }
  } else {
    const str = String(data);
    if (str.length > 5) {
      const x = Number(str.substring(str.length - 5));
      return x;
    } else {
      return Number(str);
    }
  }
}

export function PosDataChecker(data) {
  let arr = Array();

  for (const item of data) {
    if (typeof item.amount == 'string') {
      arr.push({
        title: item.title,
        amount: parseInt(removeComma(item.amount)),
      });
    } else {
      arr.push({
        title: item.title,
        amount: item.amount,
      });
    }
  }

  return arr;
}

function removeComma(num) {
  if (num.length > 3 && num.includes(',')) {
    return num.split(',').join('');
  } else {
    return num;
  }
}
