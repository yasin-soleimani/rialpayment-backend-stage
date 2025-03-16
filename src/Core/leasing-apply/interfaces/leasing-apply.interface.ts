import { Document } from 'mongoose';
import { LeasingForm } from '../../leasing-form/interfaces/leasing-form.interface';
import { LeasingOption } from '../../leasing-option/interfaces/leasing-option.interface';
import { LeasingApplyStatusEnum } from '../enums/leasing-apply-status.enum';
import { LeasingApplyAccept } from './leasing-apply-accept.interface';
import { LeasingApplyDecline } from './leasing-apply-decline.interface';
import { LeasingInfo } from '../../leasing-info/interfaces/leasing-info.interface';

export type LeasingApplyFormField = Pick<LeasingForm, 'title' | 'type' | 'key' | 'required'> & {
  value: string;
  link?: string;
  _id?: string;
};

export interface LeasingApply {
  leasingUser: any;
  applicant: any;
  leasingOption: string | LeasingOption;
  status: LeasingApplyStatusEnum;
  deleted: boolean;
  declineReasons: LeasingApplyDecline[];
  confirmDescription: LeasingApplyAccept;
  form: LeasingApplyFormField[];
  isOnProgress: boolean;
  paidByLeasing: boolean;
  invoiceId: any;
  leasingInfo: LeasingInfo;
}

export interface LeasingApplyDocument extends Readonly<LeasingApply>, Document {}
