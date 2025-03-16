import { Document } from 'mongoose';

export interface Shabacore extends Document {
  readonly bankname: string;
  readonly shaba: string;
}
