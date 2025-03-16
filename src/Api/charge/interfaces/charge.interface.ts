import { Document } from 'mongoose';

export interface Charge extends Document {
  user: string;
  ref: string;
  amount: number;
  terminalid: number;
  callbackurl: string;
  invoiceid: number;
  payload: string;
  status: number;
}
