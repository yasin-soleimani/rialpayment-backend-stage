import { Injectable } from '@vision/common';
import { LeasingRef } from '../../../Core/leasing-ref/interfaces/leasing-ref.interface';
import { LeasingRefCoreService } from '../../../Core/leasing-ref/leasing-ref.service';

@Injectable()
export class LeasingApplyPublicService {
  constructor(private readonly leasingRefCoreService: LeasingRefCoreService) {}

  async getLeasingRefs(): Promise<LeasingRef[]> {
    return this.leasingRefCoreService.getPublicLeasingRefsForApplicant();
  }
}
