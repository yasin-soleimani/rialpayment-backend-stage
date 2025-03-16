import { userAccounts } from './query.service';
import * as moment from 'jalali-moment';

export function userInfoDetails(info) {
  let m;
  if (info.birthdate) m = moment.from(info.birthdate, 'fa', 'YYYYMMDD').add('days', 1).unix();
  return {
    fullname: info.fullname || 'بی نام',
    mobile: info.mobile,
    nationalcode: info.nationalcode || '',
    birthdate: m || '',
    cardno: info.card.cardno,
    cardstatus: info.card.status,
    acl: info.acl,
    shetabcards: info.shetab,
    accounts: userAccounts(info.accounts),
    maxcashout: info.maxcheckout,
    perday: info.perday,
    permin: info.perhour,
    address: info.address || '',
  };
}
