export function PosSwitchFormatFunction(
  cmdid,
  traxId,
  cardNum,
  track2,
  termId,
  merchantId,
  date,
  amount,
  pin,
  termType
) {
  return {
    CommandID: cmdid,
    TraxID: traxId,
    CardNum: cardNum,
    Track2: track2,
    TermID: termId,
    Merchant: merchantId,
    ReceiveDT: date,
    TrnAmt: amount,
    Pin: pin,
    termType: termType,
    TermType: termType,
    TrnSeqCntr: '',
  };
}
