import { Injectable } from '@vision/common';
import axios, { AxiosInstance } from 'axios';
import { BillInquiryConfigConst } from '../const/config.const';
import { BillIqnuiryCarCrimeRequestModel } from '../function/car-crime.func';

@Injectable()
export class BillInqiuryCarCrimeService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BillInquiryConfigConst.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getData(id: string): Promise<any> {
    const data = BillIqnuiryCarCrimeRequestModel(id);
    return this.client.post('TrafficFinesInquiry', data).then((res) => {
      console.log(res, 'res');
      return res.data;
    });
  }

  async getInfo(userid: string, type: number, id: string, referer: string): Promise<any> {
    const { Status, Parameters } = await this.getData(id);
  }
}
