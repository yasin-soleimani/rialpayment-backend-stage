import { Document } from 'mongoose';

export interface CardManagement extends Document {
  readonly user: string;
  readonly cardno: number;
  readonly cardowner: boolean;
  readonly cardrelatione: string;
  readonly cardownerfullname: string;
  readonly organ: boolean;
}
