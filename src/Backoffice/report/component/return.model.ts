import { discountPercent } from '@vision/common/utils/load-package.util';

export function retunTerminalInfoModel(terminalInfo) {
  return {
    _id: terminalInfo._id,
    terminalid: terminalInfo.terminalid,
    fullname: terminalInfo.user.fullname,
    nationalcode: terminalInfo.user.nationalcode,
    mobile: terminalInfo.user.mobile,
    category: terminalInfo.category,
    ip: terminalInfo.ip,
    ip2: terminalInfo.ip2,
    ip3: terminalInfo.ip3,
    ip4: terminalInfo.ip4,
    ip5: terminalInfo.ip5,
    ref: {
      fullname: terminalInfo.ref.fullname,
      mobile: terminalInfo.ref.mobile,
      naationalcode: terminalInfo.ref.nationalcode,
    },
  };
}

export function returntraxInfoIpgModel(data, log) {
  const wage = discountPercent(data.discount, 60);
  const confirm = ipgTraxConfirm(data);
  return {
    terminalid: data.terminalid,
    total: data.total,
    amount: data.amount,
    karmozd: data.karmozd,
    wage: data.discount,
    company: wage.discount,
    agent: wage.amount,
    paytype: payTypeSwitch(data.paytype),
    invoiceid: data.invoiceid,
    direct: data.direct || false,
    confirm: confirm,
    respcode: data.details.respcode || -100,
    respmsg: respMessage(data.details.respmsg, confirm),
    rrn: data.details.rrn,
    cardnumber: data.details.cardnumber,
    psp: pspTypeSwitch(data.type),
    callbackurl: data.callbackurl,
    log: log,
    createdAt: data.createdAt,
  };
}

function respMessage(respmessage, confirm) {
  if (confirm == false) return 'از سمت فروشگاه تراکنش تایید نشده است';
  return respmessage || 'تراکنش تکمیل نشده است';
}
export function returnLogModel(data) {
  let tmpArray = Array();
  for (const info of data) {
    let fullname;
    if (info.to) {
      fullname = info.to.fullname;
    }
    tmpArray.push({
      ref: info.ref,
      title: info.title,
      fullname: fullname || info.to.mobile,
      amount: info.amount,
    });
  }

  return tmpArray;
}

function payTypeSwitch(paytype) {
  switch (paytype) {
    case 1:
      return 'درصدی';
    case 2:
      return 'مبلغی';
    case 3:
      return 'آبونمان';
  }
}

function pspTypeSwitch(psp) {
  switch (psp) {
    case 0:
      return 'ریال پیمنت';
    case 2:
      return 'آسان پرداخت پرشین';
    case 1:
      return 'تجارات الکترونیک پارسیان';
    case 3:
      return 'تجارت الکترونیک سامان کیش';
    case 4:
      return 'نوین کارت آرین';
    default:
      return 'مبنا کارت آریا';
  }
}

function ipgTraxConfirm(data) {
  if (typeof data.details.respcode == 'undefined') {
    return false;
  }
  if (data.details.respcode != 0) return false;
  if (data.direct === true) {
    if (data.confirm === true) {
      return true;
    } else {
      return false;
    }
  } else {
    if (data.userinvoice) {
      let regex = /IccIpg-/;
      if (regex.test(data.userinvoice)) {
        return data.confirm;
      } else {
        return data.trx;
      }
    } else {
      return data.trx;
    }
  }
}
