import { Document } from 'mongoose';

export interface MerchantCore extends Document {
  readonly user: string;
  readonly ref?: string;
  readonly name: string;
  readonly address: string;
  readonly tell: number;
  readonly mobile: number;
  readonly autoSettle?: boolean;
  readonly autoSettlePeriod?: number;
}
