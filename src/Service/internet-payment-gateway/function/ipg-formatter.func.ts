import * as uid from 'uniqid';

export function InternetPaymentGatewayMipgFormatterFunction(
  user,
  ref,
  terminalid,
  details,
  terminalinfo,
  amount,
  payload,
  callbackurl,
  invoiceid
) {
  return {
    user: user,
    ref: ref,
    terminalid: terminalid,
    type: 0,
    details: details,
    terminalinfo: terminalinfo,
    amount: amount,
    payload: payload,
    callbackurl: callbackurl,
    invoiceid: invoiceid,
    userinvoice: uid('RpIpg-'),
    trx: true,
    isdirect: false,
  };
}
