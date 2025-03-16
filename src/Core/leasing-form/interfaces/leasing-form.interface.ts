import { Document } from 'mongoose';
import { LeasingFormTypeEnum } from '../enums/leasing-form-type.enum';

export interface LeasingForm {
  leasingUser: any;
  type: LeasingFormTypeEnum;
  title: string;
  description: string;
  key: string;
  required: boolean;
  deleted: boolean;
}

export interface LeasingFormDocument extends Readonly<LeasingForm>, Document {}
