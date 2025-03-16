import { Injectable } from '@vision/common';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import { SEPID_MICROSERVICE_END_POINTS } from '../constants/sepid-end-points';
import { GetTaxiInformationDto } from '../dto/taxi-get-information.dto';
import { TaxiPayDto } from '../dto/taxi-pay.dto';

@Injectable()
export class SepidApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = Axios.create({
      baseURL: process.env.SEPID_MICROSERVICE_URL,
      timeout: 30000,
    });
  }

  async getTaxiInfo(normalizedData: any, userId: string): Promise<AxiosResponse<any>> {
    return this.axios.get(SEPID_MICROSERVICE_END_POINTS.getTaxiInfo, {
      params: {
        terminalId: normalizedData.terminalID,
        instituteId: normalizedData.instituteId,
      },
      headers: {
        user: userId,
      },
    });
  }

  async pay(payInfo: TaxiPayDto, userId: string): Promise<AxiosResponse<any>> {
    return this.axios.post(SEPID_MICROSERVICE_END_POINTS.taxiPayment, payInfo, {
      headers: {
        user: userId,
      },
    });
  }
}
