import { Document } from 'mongoose';

export interface Merchant extends Document {
  readonly user: string;
  readonly name: string;
  readonly address: string;
  readonly tell: number;
  readonly mobile: number;
}
