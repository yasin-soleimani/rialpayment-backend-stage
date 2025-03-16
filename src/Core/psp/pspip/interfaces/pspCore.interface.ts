import { Document } from 'mongoose';

export interface Card extends Document {
  readonly name: string;
  readonly ip: number;
}
