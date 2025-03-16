import { LeasingApplyStatusEnum } from '../enums/leasing-apply-status.enum';

export class UpdateLeasingApplyDto {
  status: LeasingApplyStatusEnum;
  message: string;
}
