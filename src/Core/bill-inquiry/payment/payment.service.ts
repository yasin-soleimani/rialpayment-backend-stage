import { Injectable } from '@vision/common';
import * as soap from 'soap';

@Injectable()
export class BillInquiryPaymentCoreService {
  private url: string = 'https://ib.ebanksepah.ir/ws/SepahFinancialWebServiceGate?wsdl';
  private username: string = '295700319';
  private password: string = '70629669';
  private staticpin: string = '68401272';
  private account: string = '1686301495904';
  private accountType: string = 'ABER_BANK_TALAEI';

  constructor() {}

  async payment(billId: string, payId: string, amount: number): Promise<any> {
    const client = await soap.createClientAsync(this.url);
    if (!client) return false;

    const loginInfo = await client.loginAsync({ arg0: this.username, arg1: this.password });

    const args = {
      arg0: loginInfo[0].return.sessionId,
      arg1: this.staticpin,
      arg2: this.accountType,
      arg3: this.account,
      arg4: amount,
      arg5: billId,
      arg6: payId,
    };
    console.log(args, 'args');
    const data = await client.billPaymentWithSepahAccountAsync(args).catch((err) => {
      return [
        {
          return: {
            traceNumber: 0,
            description: err.body,
          },
        },
      ];
    });
    console.log(data, 'data');

    return data[0].return;
  }
}
