import { loginAuthDto } from "src/Api/auth/dto/loginAuth.dto";

export function RequestTrans(cmid, trxid, trnamt, crdno, trid, merch, rcdt, trk2, ttype, data, income, req) {
  return {
    CommandID: cmid,
    TraxID: trxid,
    CardNum: crdno,
    TrnAmt: trnamt,
    TermID: trid,
    Merchant: merch,
    ReceiveDT: rcdt,
    Track2: trk2,
    TermType: ttype,
    Data: data,
    inCome: income,
    req: req,
  }
}

export function ReqMainTrans(userx, cardRef, merchantRef, merchantid, terminalid, trxid, sib, req, reqin, reqout, reqtype, crdid, disid, logid, termtype) {
  return {
    user: userx,
    cardref: cardRef,
    merchantref: merchantRef,
    terminal: terminalid,
    merchant: merchantid,
    log: logid,
    TraxID: trxid,
    storeinbalance: sib,
    request: req,
    reqtype: reqtype,
    credit: crdid,
    discount: disid,
    reqin: reqin,
    reqout: reqout,
    termtype: termtype
  }
}

export function ReqDiscountTrans(companywage, cardref, merchantref, nonebank, bankdisc, discount, amount, storeinbalance, organization?, orgdetails?) {
  return {
    companywage: companywage,
    cardref: cardref,
    merchantref: merchantref,
    nonebank: nonebank,
    bankdisc: bankdisc,
    discount: discount,
    amount: amount,
    storeinbalance: storeinbalance,
    organization: organization,
    orgdetails: orgdetails
  }
}

export function ReqCreditHistoryTrans(from, to, terminal, amount, prepaid, advance, type, cobenefit, tenday, tnyday, remain) {
  return {
    amount: amount,
    prepaid: prepaid,
    from: from,
    to: to,
    terminal: terminal,
    advance: advance,
    type: type,
    cobenefit: cobenefit,
    tenday: tenday,
    tnyday: tnyday,
    remain: remain,
  }
}

export function ReqInstallsTRans(shopid, amount, date) {
  return {
    shopid: shopid,
    amount: amount,
    date: date,
  }
}