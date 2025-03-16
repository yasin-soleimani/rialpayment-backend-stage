import { Document } from 'mongoose';

export interface CardManagmenet extends Document {
  user: string;
  readonly cardno: number;
  readonly cardowner: boolean;
  readonly cardrelatione: string;
  readonly cardownerfullname: string;
  readonly organ: boolean;
}
