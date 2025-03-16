import { LeasingApplyFormField } from '../interfaces/leasing-apply.interface';

export class CreateLeasingApplyDto {
  leasingOption: string;
  applicant: string;
  leasingUser: string;
  form: LeasingApplyFormField[];
}
