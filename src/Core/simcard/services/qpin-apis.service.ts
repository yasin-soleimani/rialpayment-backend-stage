import Axios, { AxiosInstance } from 'axios';
import { Injectable } from '@vision/common';
import { QPIN_END_POINTS } from '../../../Api/charge/constants/qpin-endpoints';
import { SimcardOperatorIdEnum } from '../../../Api/charge/constants/simcard-operator-id.enum';
import { SimcardChargeQpinDto } from '../../../Api/charge/dto/simcard.dto';

@Injectable()
export class QPinApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = Axios.create({
      baseURL: process.env.QPIN_MICROSERVICE_URL.startsWith('http')
        ? process.env.QPIN_MICROSERVICE_URL
        : 'http://' + process.env.QPIN_MICROSERVICE_URL,
      timeout: 30000,
    });
  }

  async simcardRecharge(data: SimcardChargeQpinDto): Promise<any> {
    const baseUrl = process.env.QPIN_MICROSERVICE_URL.startsWith('http')
      ? process.env.QPIN_MICROSERVICE_URL
      : 'http://' + process.env.QPIN_MICROSERVICE_URL;
    return this.axios.post(baseUrl + '/' + QPIN_END_POINTS.recharge, data);
  }

  async getSimcardPackageCategories(mobileOperatorId: SimcardOperatorIdEnum): Promise<any> {
    const baseUrl = process.env.QPIN_MICROSERVICE_URL.startsWith('http')
      ? process.env.QPIN_MICROSERVICE_URL
      : 'http://' + process.env.QPIN_MICROSERVICE_URL;
    console.log(baseUrl);
    return this.axios.get(baseUrl + '/' + QPIN_END_POINTS.getPackageCategories, {
      params: { mobileOperatorId },
    });
  }

  async getSimcardPackages(categoryCode: number): Promise<any> {
    const baseUrl = process.env.QPIN_MICROSERVICE_URL.startsWith('http')
      ? process.env.QPIN_MICROSERVICE_URL
      : 'http://' + process.env.QPIN_MICROSERVICE_URL;
    console.log(baseUrl);
    return this.axios.get(baseUrl + '/' + QPIN_END_POINTS.getPackages, {
      params: { categoryCode },
    });
  }

  async purchaseSimcardPackage(data: any): Promise<any> {
    return this.axios.post(QPIN_END_POINTS.submitPackage, data);
  }
}
