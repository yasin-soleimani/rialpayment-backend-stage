import { Injectable, InternalServerErrorException } from '@vision/common';
import * as soap from 'soap';
import { ClientConfirmRequestData, ClientSalePaymentRequestData } from './parsian.class';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { ParsianStatus } from './parsian.const';

@Injectable()
export class IpgParsianService {
  private SaleService: string = 'https://pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx?wsdl';
  private ConfirmService: string = 'https://pec.shaparak.ir/NewIPGServices/Confirm/ConfirmService.asmx?wsdl';

  constructor() {}

  async newReq(orderid, amount, callbackurl, desc, LoginAccount): Promise<any> {
    const orderidx = Date.now();
    let clientSalePaymentRequestData = new ClientSalePaymentRequestData(
      LoginAccount,
      amount,
      orderidx,
      callbackurl,
      desc
    );

    const client = await soap.createClientAsync(this.SaleService);
    const data = await client.SalePaymentRequestAsync({ requestData: clientSalePaymentRequestData });
    if (isEmpty(data)) throw new InternalServerErrorException();

    if (data[0].SalePaymentRequestResult.Status != 0) throw new InternalServerErrorException();
    return {
      token: data[0].SalePaymentRequestResult.Token,
      type: 1,
      orderid: orderidx,
    };
  }

  async checkout(token, loginAccount): Promise<any> {
    let clientConfirmRequestData = new ClientConfirmRequestData(loginAccount, token);

    const client = await soap.createClientAsync(this.ConfirmService);
    return await client.ConfirmPaymentAsync({ requestData: clientConfirmRequestData }).then((res) => {
      return res;
    });
  }

  async messageSelector(code): Promise<any> {
    const msg = ParsianStatus[code];
    if (!msg) return 'تراکنش تکمیل نشده است';
    return msg;
  }
}
