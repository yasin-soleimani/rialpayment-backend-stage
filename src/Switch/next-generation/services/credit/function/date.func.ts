import * as moment from 'jalali-moment';

export function timeConvertCredit(date) {
  let timex = moment(date).add(1, 'month').locale('fa');
  if (Number(timex.format('D')) > 15) {
    const now = timex.locale('fa').add(1, 'month').startOf('month');
    return {
      fullDate: timex.locale('fa').add(1, 'month').startOf('month').format('YYYY/M/D'),
      unix: new Date(now.add(1, 'day').locale('en').unix() * 1000).getTime() / 1000,
    };
  } else {
    const now = timex.locale('fa').startOf('month');
    return {
      fullDate: timex.locale('fa').startOf('month').format('YYYY/M/D'),
      unix: new Date(now.add(1, 'day').locale('en').unix() * 1000).getTime() / 1000,
    };
  }
}
