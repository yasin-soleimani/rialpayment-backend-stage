import * as sha256 from 'sha256';
import { convertToTimestamp, nowIso } from '@vision/common/utils/month-diff.util';

export function SwitchFormatter(trxID, crdNo, cmdID, mrcht, pin, trmType, trmID, trk2, amnt, rcvDt) {

  return {
    TraxID: trxID,
    CardNum: crdNo,
    CommandID: cmdID,
    Merchant: mrcht,
    Pin: pin,
    TermType: trmType,
    termType: trmType,
    TermID: trmID,
    Track2: trk2,
    TrnAmt: amnt,
    ReceiveDT: rcvDt,
    TrnSeqCntr: ''
  }

}

export function SwitchReturn(crdno, fullname, amnt, ref, print, date) {

  return {
    cardno: crdno,
    fullname: fullname,
    amount: amnt,
    ref: ref,
    print: print,
    date: nowIso()
  }

}

export function TrasnferReturn(crdno, fullname, amnt, ref, print, date) {

  return {
    cardno: crdno,
    fullname: fullname,
    amount: amnt,
    ref: ref,
    print: print,
    date: nowIso()

  }

}