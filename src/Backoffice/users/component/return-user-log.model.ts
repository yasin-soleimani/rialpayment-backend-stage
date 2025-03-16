export function returnUserLogModel(data, userid) {
  let tmpArray = Array();
  for (const info of data) {
    if (info.to && info.to._id == userid) {
      let status = false;
      if (info.status == 1 || info.status == true) {
        status = true;
      }
      let toname,
        rcvname = null;
      if (info.to) toname = info.to.fullname || info.to.mobile;
      if (info.from) rcvname = info.from.fullname || info.from.mobile;
      tmpArray.push({
        _id: info._id,
        ref: info.ref,
        title: info.title,
        toname: toname,
        rcvname: rcvname,
        in: info.amount,
        out: 0,
        amount: info.amount,
        status: status,
        mod: info.senderbalance || 0,
        createdAt: info.createdAt,
      });
    } else {
      let status = false;
      if (info.status == 1 || info.status == true) {
        status = true;
      }
      let toname,
        rcvname = null;
      if (info.to) toname = info.to.fullname || info.to.mobile;
      if (info.from) rcvname = info.from.fullname || info.from.mobile;
      tmpArray.push({
        _id: info._id,
        ref: info.ref,
        title: info.title,
        toname: toname,
        rcvname: rcvname,
        in: 0,
        out: info.amount,
        amount: info.amount,
        status: info.status,
        mod: info.receivebalance || 0,
        createdAt: info.createdAt,
      });
    }
  }

  return tmpArray;
}

export function returnCashoutMdel(data) {
  let tmpArray = Array();
  for (const info of data) {
    let status = false;
    let message;
    if (info.data) {
      status = checkBankStatus(info.data);
      if (status === true) {
        message = 'عملیات با موفقیت انجام شده است';
      } else {
        message = 'متاسفانه با خطا مواجه شده است';
      }
    }
    let account,
      bankname = '';
    if (info.checkout) {
      bankname = info.checkout.bankname;
      account = info.checkout.account;
    } else if (info.account) {
      account = info.account;
      bankname = info.bankname;
    }
    tmpArray.push({
      amount: info.amount,
      fullname: info.user.fullname || '',
      block: info.user.block || false,
      checkout: info.user.checkout || false,
      userid: info.user._id,
      account: account,
      bankname: bankname || '',
      status: status,
      message: message,
      ref: '',
      invoice: '',
      createdAt: info.createdAt,
    });
  }

  return tmpArray;
}

function checkBankStatus(data) {
  const res = JSON.parse(data);
  return res.status == 200;
}
