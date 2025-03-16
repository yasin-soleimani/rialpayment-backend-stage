import { Inject, Injectable, InternalServerErrorException } from '@vision/common';
import { PnaInquiryByFollowUpCode } from '../../api/novin-arian.api';

@Injectable()
export class MerchantPspCorePnaInquiryService {
  constructor(@Inject('MerchantPspRequestModel') private readonly requestModel: any) {}

  async getInfoByFollowUpCode(followupCode: string): Promise<any> {
    return this.requestModel.find({ $or: [{ followUpCode: followupCode }, { savedId: followupCode }] });
  }
  async getRequestDetailsByFollowUpCode(userId: string, followUpCode: string): Promise<any> {
    const { GetRequestDetailByFollowupCode } = await PnaInquiryByFollowUpCode(followUpCode);
    console.log(GetRequestDetailByFollowupCode);
    const { attributes } = GetRequestDetailByFollowupCode;
    if (attributes.Status == 'Successed') {
      return this.requestModel.findOneAndUpdate(
        { followUpCode },
        {
          workFlowCaption: attributes.WorkFlowCaption,
          terminalId: attributes.TerminalID,
        }
      );
    } else {
      throw new InternalServerErrorException();
    }
  }
}
