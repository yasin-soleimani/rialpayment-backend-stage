import { Document } from 'mongoose';

export interface Card extends Document {
  readonly user: string;
  readonly cardno: number;
  readonly pin: string;
  readonly expire: string;
  readonly cvv2: number;
  readonly status: boolean;
}
