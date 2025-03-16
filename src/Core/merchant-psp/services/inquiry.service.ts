import { Injectable, NotFoundException } from '@vision/common';
import { MerchantPspTypes } from '../const/psp.const';
import { MerchantPspCoreCommonService } from './common.service';
import { MerchantPspCorePnaInquiryService } from './pna/inquiry.service';

@Injectable()
export class MerchantPspCoreInquiryService {
  constructor(
    private readonly pnaInquiryService: MerchantPspCorePnaInquiryService,
    private readonly commonService: MerchantPspCoreCommonService
  ) {}

  async inquiryRequestByFollowUpCode(userId: string, followUpCode: string): Promise<any> {
    const reqInfo = await this.commonService.getRequestInfoByFollowUpCode(followUpCode);
    if (!reqInfo) throw new NotFoundException();

    if (reqInfo.type == MerchantPspTypes.NovinArian) {
      return this.pnaInquiryService.getRequestDetailsByFollowUpCode(userId, followUpCode);
    }
  }
}
