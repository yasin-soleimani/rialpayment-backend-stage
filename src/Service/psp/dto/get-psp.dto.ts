export class GetPspDto {
  Username: string;
  Password: string;
  readonly CommandID: number;
  readonly TraxID: number;
  readonly CardNum: number;
  readonly Track2?: string;
  readonly TermID: number;
  readonly Merchant: number;
  readonly ReceiveDT: number;
  readonly TrnAmt?: number;
  readonly Pin: string;
  readonly TrnSeqCntr: string;
  termType: string;
  TermType: string;
}

// Username: string;
// Password: string;
// readonly commandID: number;
// readonly traxID: number;
// readonly trxId: number;
// readonly cardNum: number;
// readonly track2 ?: string;
// readonly termID: number;
// readonly termId: number;
// readonly merchant: number;
// readonly receiveDT: number;
// readonly trnAmt ?: number;
// readonly pin: string;
// readonly trnSeqCntr: string;
// termType: string;
// TermType: string;
