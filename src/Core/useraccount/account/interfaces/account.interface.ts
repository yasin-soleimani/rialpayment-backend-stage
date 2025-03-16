import { Document } from 'mongoose';

export interface Account extends Document {
  readonly type: string;
  readonly balance: number;
  readonly currency: string;
  readonly user: string;
}
