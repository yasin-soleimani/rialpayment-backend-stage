import { CreditStatusEnums } from '@vision/common';

export function setTicketType(type, month) {
  console.log(type, 'type');
  if (type === CreditStatusEnums.CREDIT) {
    return { title: 'خرید اعتباری' };
  }
  if (type === CreditStatusEnums.INSTALLMENTS_CREDIT) {
    return { title: 'تعداد اقساط', amount: month };
  }
  if (type === CreditStatusEnums.MOZAREBEH) {
    return { title: ' سر رسید پرداخت ' + month + ' ماه دیگر' };
  }
}
