import { Injectable, InternalServerErrorException, successOptWithDataNoValidation, faildOpt } from '@vision/common';
import axios, { AxiosInstance } from 'axios';
import { BillInquiryConfigConst } from '../const/config.const';
import { BillIqnuiryGasRequestModel, BillInquiryGasSubmit } from '../function/gas.func';
import { BillInquiryCommonService } from './common.service';
import { BillInquiryStatusCodeConst } from '../const/status-code.const';

@Injectable()
export class BillInquiryGasCoreService {
  private client: AxiosInstance;
  constructor(private readonly commonService: BillInquiryCommonService) {
    this.client = axios.create({
      baseURL: BillInquiryConfigConst.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getData(id: string): Promise<any> {
    const data = BillIqnuiryGasRequestModel(id);
    return this.client.post('GasBillInquiry', data).then((res) => {
      return res.data;
    });
  }

  async getInfo(userid: string, type: number, id: string, referer: string): Promise<any> {
    const { Status, Parameters } = await this.getData(id);

    if (Status.Code == BillInquiryStatusCodeConst.success) {
      const info = BillInquiryGasSubmit(userid, type, Parameters, Status, referer);
      const data = await this.commonService.submit(info);

      if (!data) throw new InternalServerErrorException();

      return successOptWithDataNoValidation(data);
    } else {
      const info = BillInquiryGasSubmit(userid, type, Parameters, Status, referer);
      const data = await this.commonService.submit(info);

      if (!data) throw new InternalServerErrorException();

      return faildOpt(data.description);
    }
  }
}
