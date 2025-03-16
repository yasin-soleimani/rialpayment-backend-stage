import { LeasingApplyStatusEnum } from '../../../Core/leasing-apply/enums/leasing-apply-status.enum';

export class GetApplyListForLeasingQueryParams {
  sortBy?: 'createdAt' | 'updatedAt';
  sortType?: 'ASC' | 'DESC';
  q?: string; // query by applicant mobile number or nationalcode or fullname
  status?: LeasingApplyStatusEnum;
}
