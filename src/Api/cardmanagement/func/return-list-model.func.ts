import { isEmpty } from '@vision/common/utils/shared.utils';

export function CardManagementReturnModel(shetab, iranian) {
  let tmpArray = Array();

  if (shetab.length > 0) {
    for (const info of shetab) {
      tmpArray.push({
        cardno: info.cardno,
        cardownerfullname: info.cardownerfullname,
      });
    }
  }

  for (const info of iranian) {
    let firstpass = false;

    if (isEmpty(info.pin)) {
      firstpass = true;
    }

    let fullname = '';
    if (info.user && info.user.fullname) {
      fullname = info.user.fullname;
    }

    let status = true;
    if (info.status == false) {
      status = false;
    }
    tmpArray.push({
      cardno: info.cardno,
      cardownerfullname: fullname || '',
      status: status,
      firstpass: firstpass,
    });
  }

  return tmpArray;
}
