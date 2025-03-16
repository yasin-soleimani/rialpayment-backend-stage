import * as momentjs from 'jalali-moment';

export function CardStatisticsMakePdfFormat(html, data) {
  html = html.replace('!!allcard', data.members.total);
  html = html.replace('!!usedcard', data.members.used);
  html = html.replace('!!unusedcard', data.members.mod);
  html = html.replace('!!maxusedtranscount', data.paymentDate.max.count);
  html = html.replace('!!maxusedtransdate', momentjs(data.paymentDate.max.date).locale('fa').format('YYYY/MM/DD'));
  html = html.replace('!!minusedtranscount', data.paymentDate.min.count);
  html = html.replace('!!maxusedtransdate', momentjs(data.paymentDate.min.date).locale('fa').format('YYYY/MM/DD'));
  html = html.replace('!!amountused', data.amount.paid);
  html = html.replace('!!amountremain', data.amount.mod);

  return html;
}
