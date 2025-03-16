const moment = require('jalali-moment');
const momentz = require('moment-timezone');
const monthNames = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];

export function monthDiff(from, to) {
    var arr = [];
    let DateTime = new Date(from);
    const startDate = DateTime.setMonth( DateTime.getMonth() + 1  );
    const Day = new Date(DateTime.setDate( DateTime.getDate() + 1)).getDate();
    var datFrom = new Date(timeConverter(startDate / 1000));
    var datTo = new Date(to);
    var fromYear =  datFrom.getFullYear();
    var toYear =  datTo.getFullYear();
    var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();
    let counter = 0;
    for (var i = datFrom.getMonth(); i <= diffYear; i++) {
      moment.locale('fa');
      const currDate = moment(datFrom).add(counter, 'month');
      arr.push(currDate.locale('en').format('DD MMMM YYYY'));
      counter++;
    }
    return {
      months: counter,
      monthNames: arr,
    }
}

export function addMonthJalali( month ) {
   const date = moment().locale('fa').add( month, "month" ).unix();
   return moment( date * 1000 );
}

export function addMonthJalaliTimestamp( month ) {
  const date = moment().locale('fa').add( month, "month" ).unix();
  return date * 1000;
}

export function setMonthDiffFa(from, to) {
  var arr = [];
  let DateTime = new Date(from);
  const startDate = DateTime.setMonth( DateTime.getMonth() + 1  );
  const Day = new Date(DateTime.setDate( DateTime.getDate() + 1)).getDate();
  var datFrom = new Date(timeConverter(startDate / 1000));
  var datTo = new Date(to);
  var fromYear =  datFrom.getFullYear();
  var toYear =  datTo.getFullYear();
  var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();
  let counter = 0;
  for (var i = datFrom.getMonth(); i <= diffYear; i++) {
      moment.locale('fa');
      const currDate = moment(datFrom).add(counter, 'month');
      console.log(currDate)
      arr.push(currDate.locale('en').format('DD MMMM YYYY'));
      counter++;
  }
  const daa = {
    months: counter,
    monthNames: arr,
  }

  console.log(daa);
}

export function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = monthNames[a.getMonth()];
  var date = a.getDate();
  // var hour = a.getHours();
  // var min = a.getMinutes();
  // var sec = a.getSeconds();

  var time = date + ' '+ month + ' ' + year;
  return time;
}

export function getDate(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = monthNames[a.getMonth()];

  return month + ' ' + year;
}

export function todayDay(){
  const today = Date.now();
  const todayDate = new Date(today);
  return todayDate.getDate();
}

export function getMonthDateRange(year, month) {
  // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
  // array is 'year', 'month', 'day', etc
  month = month - 1;
  const st = moment([Number(year), Number(month) ]).unix();
  console.log(st,'st');
  var startDate = moment(st * 1000).locale('fa');

  const start = moment(startDate).startOf('month').unix();

  // Clone the value before .endOf()
  var endDate = moment(startDate).endOf('month').locale('fa').unix();

  // just for demonstration:

  // make sure to call toDate() for plain JavaScript date type
  return { start: moment(start * 1000), end: moment( endDate * 1000 ) };
}


export function daydiff(year1,month1,day1, year2,month2,day2) {
  const a = moment([year2, month2, day2]);
  const b = moment([year1, month1, day1]);
  return a.diff(b, 'days');
}

export function setDateMonth(date, month) {
  moment.locale('fa');
  console.log( 'month', month );
  return moment(date).add(parseInt(month), 'months').locale('en').unix() ;
}

export function penaltyInstalls(date) {
  const Today = new Date();
  const Installdate = new Date(date);
  const a = moment([Today.getFullYear(), Today.getMonth(), Today.getDate()]);
  const b = moment([Installdate.getFullYear(), Installdate.getMonth(), Installdate.getDate()]);
  const data = a.diff(b);
  const durationData = moment.duration(data)._data;
  let months;
  if (durationData.months >= 1 || durationData.days >= 1) {
      months = { month: durationData.months + 1, days: durationData.days };
   } else if (durationData.months < 1 && durationData.days > 0) {
      months = { month: durationData.months + 1, days: durationData.days };
  }
  else if (durationData.months = 1 || durationData.days < 0) {
      months = { month: 0, days: durationData.days };
  }
  else {
      months = { month: 0, days: 0 };
  }
  return months;
}

export function dayDiff() {
  const lastDay = moment().locale('fa');
  const month = moment(lastDay).format('MM');
  const day = moment(lastDay).format('DD');
  const year = moment(lastDay).format('YYYY');
  if ( day < 16 ) {
    const data =   lastDay.set('date', 1);
    console.log('1 date', data);
    return data;
  } else {
    const currDate = lastDay.set('date', 1).add(1, 'month')
    console.log('2 date', currDate);
    return currDate;
  }
}

export function hourDiff(date) {

  const currentDate = moment();

  const lastDate = moment(date);

  const diff = currentDate.diff(lastDate, 'hours');
  return diff;
}

export function minuteDiff(date) {

  const currentDate = moment();

  const lastDate = moment(date);

  const diff = currentDate.diff(lastDate, 'minutes');
  return diff;
}

export function trasnTime() {

  const currentDate = moment();
  const now = momentz.tz(currentDate, "Asia/Tehran");

  const hour = now.format('H');
  const minute = now.format('m');

  if ( hour > 6 && hour < 16) {
    if( hour === 7 && minute < 30 ) {
      return false;
    } else if( hour === 15 && minute > 30) {
      return false;
    } else {
      return true;
    }
  }
}

export function intToDate(data) {
  let year, month, day ;
for (let i=0; i< data.length; i++) {
 if ( i < 4) {
   if ( i == 0 ) {
    year = data.charAt(i);
   } else {
    year = year + data.charAt(i);
   }
 }

 if ( i > 3 && i< 6) {
   if (i == 4) {
    month =  data.charAt(i)
   } else {
    month = month + data.charAt(i)
   }
 }

 if ( i > 5 && i <8) {
  if (i == 6) {
    day =  data.charAt(i)
   } else {
    day = day + data.charAt(i)
   }
 }
}

return {
  year: year,
  month: month,
  day: day
}
}


export function timeDuration( time ){
  const currentTime = moment();
  const now = momentz.tz(currentTime, "Asia/Tehran");
  const datatime = now;
  const qrTime = moment( time * 1000 );
  return now.diff(qrTime , 'second');
}

export function Sio5(){
  const currentTime = moment();
  const now = momentz.tz(currentTime, "Asia/Tehran");
  return now.add('second', 35).unix();
}

export function daysOfWeek(str) {
  const data =  moment().day(str);
  data.add(1, 'day');
  console.log(data);
  return data.day()
}
export function todayNum(str) {
  const data =  moment();
  console.log(data);
  return data.day();
}

export function todayRange() {
  return {
    start : moment().startOf('day'),
    end: moment().endOf('day')
  }
}

export function currentTime() {
  const now = moment();
  return now.format('HH:mm');
}

export function betweenTime(time1, time2) {
  const time1Spilit = time1.split(':');
  const time2Spilit = time2.split(':')
  const firstTime = moment().set({ hour: time1Spilit[0], minute: time1Spilit[1] });
  const secondTime = moment().set({ hour: time2Spilit[0], minute: time2Spilit[1] });
  const data =  moment().isBetween(firstTime, secondTime);
  return data;
}

export function timestamoToISO(timestamp) {
  return moment(timestamp).add( 1, 'day');
}

export function timestamoToISOStartDay(timestamp) {
  return moment(timestamp).add( 1, 'day').startOf('day');
}
export function timestamoToISOEndDay(timestamp) {
  return moment(timestamp).endOf('day');
}
export function now() {
  const currentDate = moment();
  const now = momentz.tz(currentDate, "Asia/Tehran");
  return now.format('YYYYMMDDHHmmss');
}

export function convertToTimestamp(date ) {
  return moment( date, 'YYYYMMDDHHmmss').toDate();
}

export function getMonthForward(month) {
  return moment().add( month, 'month').unix();
}

export function nowIso() {
  return moment().toDate();
}

export function nowPersian() {
  moment.locale('fa');
  return moment().locale('fa').format('YYYY/MM/DD HH:mm:ss');
}

export function nowPersianDate() {
  moment.locale('fa');
  return moment().locale('fa').format('YYYY/MM/DD');

}

export function nowTimezone(){
  const currentDate = moment();
  const now = momentz.tz(currentDate, "Europe/London");
  return now.unix();
}

export function dateRange( date: number ){
    return {
      start :moment( date  ).locale('en').startOf('day'),
      end:  moment( date ).locale('en').endOf('day')
    }
}

export function TodayLocale( ) {
  moment.locale('fa');
  return moment().locale('fa').format('YYYYMMDD');
}

export function isoTime( date ) {
  return moment( date ).locale('fa').format('YYYY');
}

export function diffHourByIsoDate( start ) {
  // const execTime = momentz( start).tz("Asia/Tehran");
  const execTime = momentz(start).tz('Asia/Tehran');
  console.log( execTime);
  const now = moment();
  const nowExec = momentz(now).tz(  "Asia/Tehran");
  console.log( nowExec );

  return nowExec.diff( execTime , 'hours');
}

export function addYearToExpire( year ) {
  const now = moment().add(year, 'years');
  return now.toISOString();
}

export function diffDays( start, end) {
  const startExec = moment( start );
  const endExec = moment( end );
  return endExec.diff( startExec, 'days');
}

export function currentDayNum() {
  return moment().day();
}

export function getNowTimeWith15minSub() {
  return moment().subtract(15,'minutes');
}

export function getTodayStartDayUtc() {
  const day = moment().startOf('day').utc()
  return new Date( day )
}

export function get10PmClock() {
  const day = moment().subtract(1, 'day');
  return new Date(day.hour(22).minute(0).second(0).utc());
}

export function getDiffBySecond( time ) {
  const now = moment();
  const genTime = moment( time );
  return now.diff( genTime, 'seconds' );
}

export function dateFormatYearMonth( time ) {
  return moment.unix(time).locale('fa').format('YYYY/MM');
}

export function dateWithTz() {
  const currentDate = moment();
  const now = momentz.tz(currentDate, "Asia/Tehran");
  return moment(now).locale('fa').format('YYYY-MM-DD');
}