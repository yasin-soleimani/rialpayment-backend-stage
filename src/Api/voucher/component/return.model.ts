import { VoucherType } from '../const/voucher-type.const';

export function returnVoucherListModel(data, type: number) {
  console.log(type);
  let tmp = Array();
  for (const info of data) {
    let status = false;
    if (info.mod === 0) status = true;
    let amount = 0;
    let mod = info.mod || 0;
    let pin, key, date;
    if (type === VoucherType.Used) {
      amount = info.details.amount;
      pin = '*****';
      key = '****';
      date = info.details.date;
      status = true;
      mod = 0;
    } else {
      amount = info.amount;
      pin = info.pin;
      key = info.key;
      date = info.createdAt;
      mod = info.mod;
      status = status;
    }
    tmp.push({
      _id: info._id,
      id: info.id,
      pin: pin,
      key: key,
      amount: amount,
      status: status,
      mod: mod,
      createdAt: date,
    });
  }
  return tmp;
}
