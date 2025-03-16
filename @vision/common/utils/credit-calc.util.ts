import * as moment from 'jalali-moment';
import { dayDiff, todayDay } from '@vision/common/utils/month-diff.util';
const roundTo = require('round-to');

export function creditCalc(value, month, benefit, freemonth, type) {
  const permonth = value / month;
  let months;
  let installs= Array();
  if ( freemonth > 0) {
    months = month - freemonth;
  } else {
    months = month;
  }
  const TodayDate = dayDiff();
  const permonthBenefiy = Math.round(( (benefit * permonth) / 100));
  let monthCounter= 1;

  let lastMonth: number = 0;

  if ( freemonth > 0) {
    for(let i= freemonth; i > 0; i--) {
      const permonthInstall = permonth;
      const roundPerMonth = roundTo(permonthInstall, -2);
      lastMonth = lastMonth + (permonthInstall - roundPerMonth);
      const installdate = moment(TodayDate).add(monthCounter, 'month').locale('en').unix() ;
      if ( freemonth >= months && i == 1 ) {
        installs.push({ amount: roundTo.up(roundPerMonth + lastMonth, 2 ), date: installdate});
      } else {
        installs.push({ amount: roundPerMonth, date: installdate});
      }
      monthCounter++;
    }
  }

  for(let i= months; i > 0; i--) {
    const permonthInstall = permonth + permonthBenefiy
    const roundPerMonth = roundTo(permonthInstall, -2);
      lastMonth = lastMonth + (permonthInstall - roundPerMonth);
    const installdate = moment(TodayDate).add(monthCounter, 'month').locale('en').unix() ;
    console.log('install date', installdate);
    if ( i == 1 && lastMonth > 0 ) {
      installs.push({ amount: roundTo.up(roundPerMonth + lastMonth, 2 ), date: installdate});
    } else {
      installs.push({ amount: roundPerMonth, date: installdate});
    }
    monthCounter++;
  }
return installs;
}