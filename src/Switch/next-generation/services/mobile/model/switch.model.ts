export class SwitchModel {
  CommandID: number;
  TraxID: number;
  CardNum: number;
  Track2?: string;
  TermID: number;
  Merchant: number;
  ReceiveDT: number;
  TrnAmt: number;
  Pin: string;
  TrnSeqCntr: string;
  termType: number;
  TermType: number;
  storeinbalance?: number;

  set setCommandID(CID: number) {
    this.CommandID = CID;
  }
  set setTraxID(traxid: number) {
    this.TraxID = traxid;
  }
  set setCardNum(cardno: number) {
    this.CardNum = cardno;
  }
  set setTrack2(track2: string) {
    this.Track2 = track2;
  }
  set setTermID(termid: number) {
    this.TermID = termid;
  }
  set setMerchant(merchant: number) {
    this.Merchant = merchant;
  }
  set setReceiveDT(date: number) {
    this.ReceiveDT = date;
  }
  set setTrnAmt(amount: number) {
    this.TrnAmt = amount;
  }
  set setTrnSeqCntr(seq: string) {
    this.TrnSeqCntr = seq;
  }
  set setTermType(type: number) {
    this.termType = type;
    this.TermType = type;
  }
  set setPin(pin: string) {
    this.Pin = pin;
  }
  set setStoreinbalance(balance: number) {
    this.storeinbalance = balance;
  }
}
