import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { LeasingOption } from '../../leasing-option/interfaces/leasing-option.interface';
import { LeasingApply } from '../../leasing-apply/interfaces/leasing-apply.interface';

export interface LeasingUserCredit {
  amount: number;
  user: any;
  leasingOption: string | ObjectId | LeasingOption;
  leasingApply: string | ObjectId | LeasingApply;
  leasingUser: any;
  block: boolean;
}

export interface LeasingUserCreditDocument extends Readonly<LeasingUserCredit>, Document {}
