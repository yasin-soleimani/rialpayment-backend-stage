import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { InsuranceGetListApiService } from './services/get-list.service';
import { InsuranceApiListFunction } from './function/list-output.func';
import { InsuranceVerifyApiService } from './services/verify.service';

@Injectable()
export class InsuranceApiService {
  constructor(
    private readonly listService: InsuranceGetListApiService,
    private readonly verifyService: InsuranceVerifyApiService
  ) {}

  async getList(catCode: number): Promise<any> {
    const data = await this.listService.getList(catCode);
    return successOptWithDataNoValidation(InsuranceApiListFunction(data));
  }

  async paymentStatus(token, res): Promise<any> {
    return this.verifyService.getVerify(token, res);
  }
}
