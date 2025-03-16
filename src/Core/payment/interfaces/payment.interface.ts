import { Document } from 'mongoose';

export interface Payment extends Document {
  readonly terminalid: number;
  readonly amount: number;
  readonly payload: string;
  readonly callbackurl: string;
  readonly invoiceid: number;
  readonly status?: number;
  readonly type?: number;
}
