import { Injectable, InternalServerErrorException, successOptWithDataNoValidation, faildOpt } from '@vision/common';
import { BillIqnuiryElectricRequestModel, BillInquiryElectricSubmit } from '../function/electric.func';
import { BillInquiryStatusCodeConst } from '../const/status-code.const';
import axios, { AxiosInstance } from 'axios';
import { BillInquiryConfigConst } from '../const/config.const';
import { BillInquiryCommonService } from './common.service';

@Injectable()
export class BillInquiryElectricCoreService {
  private client: AxiosInstance;

  constructor(private readonly commonService: BillInquiryCommonService) {
    this.client = axios.create({
      baseURL: BillInquiryConfigConst.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getData(id: string): Promise<any> {
    const data = BillIqnuiryElectricRequestModel(id);
    console.log(data, 'data');
    return this.client.post('ElectricityBillInquiry', data).then((res) => {
      return res.data;
    });
  }

  async getInfo(userid: string, type: number, id: string, referer: string): Promise<any> {
    const { Status, Parameters } = await this.getData(id);
    console.log(Status, Parameters);
    if (Status.Code == BillInquiryStatusCodeConst.success) {
      const info = BillInquiryElectricSubmit(userid, type, Parameters, Status, referer);
      const data = await this.commonService.submit(info);

      if (!data) throw new InternalServerErrorException();

      return successOptWithDataNoValidation(data);
    } else {
      const info = BillInquiryElectricSubmit(userid, type, Parameters, Status, referer);
      const data = await this.commonService.submit(info);

      if (!data) throw new InternalServerErrorException();

      return faildOpt(data.description);
    }
  }
}
