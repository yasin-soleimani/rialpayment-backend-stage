import * as tzmoment from 'moment-timezone';
import * as moment from 'jalali-moment';

export function timeDateJalali(date) {
  const datex = tzmoment(date);
  const tzDate = datex.tz('Asia/Tehran').valueOf();

  return {
    date: moment(tzDate).locale('fa').format('YYYY/MM/DD'),
    time: moment(tzDate).locale('fa').format('HH:MM:SS'),
  };
}
