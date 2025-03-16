export class SwitchRequestDto {
  Username?: string;
  Password?: string;
  readonly CommandID: number;
  readonly TraxID: number;
  CardNum: number;
  readonly Track2?: string;
  readonly TermID: number;
  readonly Merchant: number;
  ReceiveDT: number;
  TrnAmt?: number;
  readonly Pin: string;
  readonly TrnSeqCntr: string;
  termType: string;
  TermType: string;
  storeinbalance?: number;
}
