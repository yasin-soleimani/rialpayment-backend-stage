export class PspRequestDto {
  CommandID: number;
  TraxID: number;
  CardNum: number;
  TermID: number;
  Merchant: number;
  ReceiveDT: string;
  Track2: string;
  TermType: number;
  Data: string;
  inCome: string;
  req: string;
  RsCode?: number;
}
