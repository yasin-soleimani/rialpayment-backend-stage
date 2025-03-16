import { Injectable } from '@vision/common';
import * as soap from 'soap';

@Injectable()
export class IpgSamanService {
  private readonly REDIRECT: string = 'https://sep.shaparak.ir/payment.aspx';
  private readonly SERVER_URL: string = 'https://sep.shaparak.ir/payments/referencepayment.asmx?wsdl';

  constructor() {}

  async newReq(): Promise<any> {
    return {
      token: 0,
      type: 3,
      orderid: 0,
    };
  }

  async checkout(getInfo): Promise<any> {
    const client = await soap.createClientAsync(this.SERVER_URL);
    let params = {
      String_1: getInfo.RefNum,
      String_2: getInfo.MID,
    };
    return client.verifyTransactionAsync(params);
  }
}
