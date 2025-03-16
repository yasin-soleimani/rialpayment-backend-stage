import { LeasingRefStatusEnum } from '../../../Core/leasing-ref/enums/leasing-ref-status.enum';

export class GetAllLeasingRefsFilters {
  status?: LeasingRefStatusEnum;
  q?: string;
}
