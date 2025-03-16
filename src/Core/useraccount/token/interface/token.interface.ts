import { Document } from 'mongoose';

export interface IToken extends Document {
  user: string;
  status: boolean;
  token?: string;
  role: string;
  ip: string;
  userAgent: string;
  createdAt?: Date;
  updatedAt?: Date;
}
