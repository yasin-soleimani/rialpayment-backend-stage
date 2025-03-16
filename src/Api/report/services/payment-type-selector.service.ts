export function ipgPaymentTypeSelector(data: any) {
  console.log(data, 'data ipg');
  let msg;
  let direct = false;

  if (data.userinvoice && data.userinvoice.match(/^((DirectIpg))-/)) {
    direct = true;
    if (data.confirm === true) {
      msg = 'تراکنش تایید شده است';
    } else if (data.reverse === true) {
      return (msg = 'تراکنش برگشت داده شده است');
    } else if (data.reverse === false && data.confirm === false) {
      msg = 'در انتظار تایید تراکنش';
    }
  } else {
    direct = false;
    if (data.details && data.details.respcode == 0) {
      if (data.trx === true) {
        msg = 'تراکنش تایید شده است';
      } else {
        msg = 'در انتظار تایید تراکنش';
      }
    } else {
      if (data.details.respmsg == 'عملیات با موفقیت انجام شد') {
        msg = 'عملیات با خطا مواجه شده است';
      } else {
        msg = data.details.respmsg;
      }
    }
  }

  return {
    msg: msg,
    direct: direct,
  };
}
