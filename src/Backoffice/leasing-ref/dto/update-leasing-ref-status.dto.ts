import { LeasingRefStatusEnum } from '../../../Core/leasing-ref/enums/leasing-ref-status.enum';

export class UpdateLeasingRefStatusDto {
  status: LeasingRefStatusEnum;
  message: string;
}
