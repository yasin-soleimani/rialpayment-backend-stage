export function returnVoucherMode(data) {
  let tmp = Array();
  for (const info of data) {
    let fullname = null;
    let used,
      status = false;
    if (info.to) {
      used = true;
      fullname = info.to.fullname;
    }

    tmp.push({
      _id: info._id,
      id: info.id,
      pin: info.pin,
      key: info.key,
      amount: info.amount,
      mod: info.mod,
      used: status,
      status: info.type,
      from: info.user.fullname,
      to: fullname,
      createdAt: info.createdAt,
    });
  }
  return tmp;
}

export function returnVoucherUsedModel(data) {
  let tmp = Array();
  for (const info of data) {
    let fullname = null;
    let used,
      status = false;

    tmp.push({
      _id: info._id,
      id: info.id,
      pin: info.pin,
      key: info.key,
      mod: info.mod,
      amount: info.details.amount,
      used: status,
      status: info.type,
      from: info.fromInfo[0].fullname,
      to: info.toInfo[0].fullname,
      createdAt: info.createdAt,
    });
  }
  return tmp;
}

function statusChecker(status) {
  switch (status) {
    case -2: {
      return 'عودت داده شده';
    }

    case -1: {
      return 'موقتا مسدود شده';
    }

    case 0: {
      return 'مسدود شده';
    }

    case 1: {
      return 'آزاد';
    }
  }
}
