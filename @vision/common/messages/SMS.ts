import { nowPersianDate } from "@vision/common/utils/month-diff.util";

export function SafeBoxSendMessage(amount, fullname) {
  const message = " ریال پیمنت \n" +
  "مبلغ : " + amount + "ریال \n" +
  "واریز کننده : " + fullname  + " \n" +
  "جهت دریافت مبلغ به روش های زیر اقدم فرمایید \n" +
  "ثبت نام در :‌ https://portal.rialpayment.ir \n" +
  " دریافت اپلیکیشن: https://app.rialpayment.ir \n" +
  "تماس با پشتیبانی:  09363677791";
  return message;
}

export function ChargeCreditSendMessage(months, permonth, remain, fullname) {
  const message = " ریال پیمنت \n" +
  fullname + " عزیز \n" +
  " شارژ اعتبار به مدت " + months + "ماه \n"+
  "ماهیانه به ملبغ " + permonth + " ریال \n"+
  "مانده کارت اعتباری : " +  remain + " ریال \n"+
  "دانلود اپلیکیشن :‌ http://app.rialpayment.ir";
  return message;
}

export function OrganizationChargeSendMessage( fullname, amount ) {
  const message = " ریال پیمنت \n" +
  fullname + ' عزیز \n' +
  'اعتبار شما به مبلغ ' + amount + ' ریال در تاریخ ' + nowPersianDate() + ' جهت استفاده از مذاکز منتخب شارژ گردید \n'+
  " دریافت اپلیکیشن: https://app.rialpayment.ir \n" +
  "تماس با پشتیبانی:  09363677791";
  return message;
}

export function ReciveAccountBalanceMessage( fullname, amount, balance ) {
  const message = " ریال پیمنت \n" +
    fullname + ' عزیز \n' +
    'شارژ اعتبار شما : '+ amount + 'ریال' + '\n'+
    'مانده کیف پول : '+ balance + 'ریال' + '\n'+
/*
    " دریافت اپلیکیشن: https://app.rialpayment.ir \n" + '\n'+
*/
    "تماس با پشتیبانی:  09363677791";
  return message;
}

export function SendAccountBalanceMessage( fullname, amount, balance ) {
  const message = " ریال پیمنت \n" +
    fullname + ' عزیز \n' +
    'کسر موجودی : '+ amount + 'ریال' +'\n'+
    'مانده کیف پول : '+ balance + 'ریال' +'\n'+
/*
    " دریافت اپلیکیشن: https://app.rialpayment.ir \n" +'\n'+
*/
    "تماس با پشتیبانی:  09363677791";
  return message;
}

export function sendWelcomeToIranianClub( clubname ) {
  const message = "به باشگاه مشتریان " + clubname + "  خوش آمدید \n" +
    'جهت تکمیل ثبت نام خود روی لینک ارسالی کلیک نمایید \n' +
    'https://app.rialpayment.ir \n' +
    'پشتیبانی: 09363677791'
return message;
}

export function sendWelcomeToIranian( ) {
  const message = " به ریال پیمنت خوش آمدید\n" +
    'جهت تکمیل ثبت نام خود روی لینک ارسالی کلیک نمایید \n' +
    'https://app.rialpayment.ir \n' +
    'پشتیبانی: 09363677791'

return message;
}
