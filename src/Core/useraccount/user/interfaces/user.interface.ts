import { Document } from 'mongoose';

export interface User extends Document {
  readonly mobile: number;
  readonly nationalcode: number;
  readonly password: string;
}
