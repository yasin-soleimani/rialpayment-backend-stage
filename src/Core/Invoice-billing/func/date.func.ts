import * as jalaliMoment from 'jalali-moment';

export function invoiceBillingDateRangeMonthFunc(date: number) {
  const start = jalaliMoment(date).utc(false).locale('fa').startOf('month').valueOf();
  const end = jalaliMoment(date).utc(false).locale('fa').endOf('month').valueOf();

  return {
    start: new Date(start),
    end: new Date(end),
    from: jalaliMoment(date).locale('fa').startOf('month').format('YYYY/MM/DD'),
    to: jalaliMoment(date).locale('fa').endOf('month').format('YYYY/MM/DD'),
  };
}
