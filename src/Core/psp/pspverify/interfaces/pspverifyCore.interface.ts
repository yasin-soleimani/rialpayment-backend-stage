import { Document } from 'mongoose';

export interface PspVerifyCore extends Document {
  readonly CommandID: number;
  readonly TraxID: number;
  readonly CardNum: number;
  readonly TermID: number;
  readonly Merchant: number;
  readonly ReceiveDt: string;
  readonly Track2: string;
  readonly Pin: string;
  readonly TermType: string;
  readonly data: any;
  readonly inCome: any;
  RsCode: number;
  user: string;
}
