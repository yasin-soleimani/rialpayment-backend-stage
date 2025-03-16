import { Injectable, InternalServerErrorException, successOptWithDataNoValidation, faildOpt } from '@vision/common';
import { BillInquiryCommonService } from './common.service';
import { BillIqnuiryMCIRequestModel, BillInquiryMCISubmit } from '../function/mobile.func';
import axios, { AxiosInstance } from 'axios';
import { BillInquiryConfigConst } from '../const/config.const';
import { BillInquiryStatusCodeConst } from '../const/status-code.const';
@Injectable()
export class BillInquiryMCICoreService {
  private client: AxiosInstance;

  constructor(private readonly commonService: BillInquiryCommonService) {
    this.client = axios.create({
      baseURL: BillInquiryConfigConst.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getData(id: string): Promise<any> {
    const data = BillIqnuiryMCIRequestModel(id);
    return this.client.post('MCIMobileBillInquiry', data).then((res) => {
      console.log(res, 'res');
      return res.data;
    });
  }

  async getInfo(userid: string, type: number, id: string, referer: string): Promise<any> {
    const { Status, Parameters } = await this.getData(id);

    let tmp = Array();
    if (Status.Code == BillInquiryStatusCodeConst.success) {
      if (Parameters.FinalTerm) {
        const info = BillInquiryMCISubmit(
          userid,
          type,
          Parameters.FinalTerm.Amount,
          Parameters.FinalTerm.BillID,
          Parameters.FinalTerm.PaymentID,
          Status.Description,
          Status.Code,
          id,
          referer,
          'Final'
        );
        const data = await this.commonService.submit(info);

        if (!data) throw new InternalServerErrorException();

        tmp.push(data);
      }

      if (Parameters.MidTerm) {
        const info = BillInquiryMCISubmit(
          userid,
          type,
          Parameters.MidTerm.Amount,
          Parameters.MidTerm.BillID,
          Parameters.MidTerm.PaymentID,
          Status.Description,
          Status.Code,
          id,
          referer,
          'Mid'
        );
        const data = await this.commonService.submit(info);

        if (!data) throw new InternalServerErrorException();

        tmp.push(data);
      }

      return successOptWithDataNoValidation(tmp);
    } else {
      const info = BillInquiryMCISubmit(userid, type, null, null, null, Status.Description, Status.Code, id, referer);
      const data = await this.commonService.submit(info);

      if (!data) throw new InternalServerErrorException();

      return faildOpt(data.description);
    }
  }
}
