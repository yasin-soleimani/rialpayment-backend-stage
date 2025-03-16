import { Document } from 'mongoose';

export interface Mipg extends Document {
  readonly user: number;
  readonly title: string;
  readonly category: string;
  readonly logo: string;
  readonly ip: string;
  readonly terminalid?: string;
  readonly url: string;
}
