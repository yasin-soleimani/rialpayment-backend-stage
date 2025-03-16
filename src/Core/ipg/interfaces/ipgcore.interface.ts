import { Document } from 'mongoose';

export interface IpgCore extends Document {
  user: string;
  ref: string;
  amount: number;
  terminalid: number;
  callbackurl: string;
  invoiceid: string;
  payload: string;
  status: number;
}
