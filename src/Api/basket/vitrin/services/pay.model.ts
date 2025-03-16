export function PayIpgModel(terminalid, amount, callbackurl, payload, invoiceid, isdirect?) {
  return {
    terminalid: terminalid,
    amount: amount,
    callbackurl: callbackurl,
    payload: payload,
    invoiceid: invoiceid,
    isdirect: isdirect,
  };
}
