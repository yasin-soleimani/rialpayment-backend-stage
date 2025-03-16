import { Document } from 'mongoose';

export interface Shaba extends Document {
  readonly bankname: string;
  readonly shaba: string;
}
