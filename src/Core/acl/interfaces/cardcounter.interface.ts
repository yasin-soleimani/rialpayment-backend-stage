import { Document } from 'mongoose';

export interface CardCounter extends Document {
  readonly _id: string;
  readonly seq: number;
  readonly acc: number;
}
