import { Injectable, InternalServerErrorException } from '@vision/common';
import * as soap from 'soap';
import * as moment from 'moment-timezone';
import { PaymentRequestParams, PaymentRequestData, Credentials } from './persian.class';
import * as Rijndael from 'rijndael-js';
import * as padder from 'pkcs7-padding';
import { PersianStatus } from './persian.consts';

@Injectable()
export class IpgPersianService {
  private MERCHANT_SERVICES: string = 'https://services.asanpardakht.net/paygate/merchantservices.asmx?wsdl';
  private INTERNAL_UTILS: string = 'https://services.asanpardakht.net/paygate/internalutils.asmx?wsdl';
  private HOST_INFO: string = 'https://services.asanpardakht.net/utils/hostinfo.asmx?wsdl';
  private SERVER_TIME: string = 'https://services.asanpardakht.net/paygate/servertime.asmx?wsdl';
  private REDIRECT: string = 'https://asan.shaparak.ir';
  private STATUS_WATCH: string = 'https://services.asanpardakht.net/paygate/statuswatch.asmx?wsdl';
  private merchantId: '3883859';
  private merchantConfigurationId = '4982';
  private username = 'TAKHFIF833930';
  private password = 'we4Q9iU7pY2';
  private key = 'jTyoDI6/x8lkmoYkzmCYyCf3HSndgN6CfawAVVOII98=';
  private iv = '7UWGP1c+hENowdKm3Q6F32Pp3Qh759AOkkLgI79dZrc=';

  constructor() {}

  async newReq(orderid, amount, callbackurl, desc, merchantConfigurationId): Promise<any> {
    let dateTime = moment().tz('Asia/Tehran').format('YYYYMMDD HHmmss');
    const orederid = Date.now();
    let paymentRequestParams = new PaymentRequestParams(
      this.username,
      this.password,
      orederid,
      amount,
      dateTime,
      desc,
      callbackurl
    );
    const encData = await this.encrypt(paymentRequestParams.toString());
    let paymentRequestData = new PaymentRequestData(merchantConfigurationId, encData);

    const client = await soap.createClientAsync(this.MERCHANT_SERVICES);
    let result = await client.RequestOperationAsync(paymentRequestData);

    const resData = result[0].RequestOperationResult.split(',');
    if (resData.length > 1 && resData[0] == 0) {
      return {
        token: resData[1],
        type: 2,
        orderid: orederid,
      };
    } else {
      throw new InternalServerErrorException();
    }
  }

  async checkout(getInfo, merchantConfigurationId): Promise<any> {
    const decoded = await this.decode(getInfo.ReturningParams);
    const sep = decoded.split(',');
    const state = PersianStatus[sep[3]];
    console.log(state, 'state');
    if (sep[3] == '0' || sep[3] == '00') {
      const cardsplit = sep[4].split(':');
      const res = await this.settle(getInfo, getInfo.PayGateTranID, merchantConfigurationId);
      if (res.RequestVerificationResult == '500') {
        const conid = await this.reqCon(getInfo, getInfo.PayGateTranID, merchantConfigurationId);
        console.log(conid, 'coniffddddddddddddddddddddddddddddd');
        return {
          token: sep[2],
          respmsg: 'عملیات با موفقیت انجام شد',
          respcode: 0,
          rrn: sep[6],
          tracenumber: getInfo.PayGateTranID,
          cardnumber: this.cardno(cardsplit[1], sep[7]),
        };
      } else {
        return {
          token: sep[2],
          respmsg: state.cause || 'عملیات با خطا مواجه شده است',
          respcode: res.RequestVerificationResult || -10,
          rrn: sep[6],
          tracenumber: getInfo.PayGateTranID,
          cardnumber: this.cardno(cardsplit[1], sep[7]),
        };
      }
    } else {
      return {
        token: sep[2],
        respmsg: state.cause || 'عملیات با خطا مواجه شده است',
        respcode: state.code || -10,
      };
    }
  }

  private async settle(getInfo, transId, merchantConfigurationId): Promise<any> {
    let credentials = new Credentials(this.username, this.password);
    const encryptedData = await this.encrypt(credentials.toString());

    const params = {
      merchantConfigurationID: merchantConfigurationId,
      encryptedCredentials: encryptedData,
      payGateTranID: transId,
    };

    let client = await soap.createClientAsync(this.MERCHANT_SERVICES);
    let result = await client.RequestVerificationAsync(params);
    return result[0];
  }

  private async reqCon(getInfo, transId, merchantConfigurationId): Promise<any> {
    let credentials = new Credentials(this.username, this.password);
    const encryptedData = await this.encrypt(credentials.toString());

    const params = {
      merchantConfigurationID: merchantConfigurationId,
      encryptedCredentials: encryptedData,
      payGateTranID: transId,
    };

    let client = await soap.createClientAsync(this.MERCHANT_SERVICES);
    let result = await client.RequestReconciliationAsync(params);
    return result[0];
  }

  private async encrypt(data): Promise<any> {
    const plainText = Buffer.from(data, 'utf8');
    const padded = padder.pad(plainText, 32); //Use 32 = 256 bits block sizes
    const cipher = new Rijndael(Buffer.from(this.key, 'base64'), 'cbc'); //CBC mode
    const encrypted = cipher.encrypt(padded, 256, Buffer.from(this.iv, 'base64'));
    return encrypted.toString('base64');
  }

  async decode(data): Promise<any> {
    const decipher = new Rijndael(Buffer.from(this.key, 'base64'), 'cbc');
    const decryptedPadded = decipher.decrypt(Buffer.from(data, 'base64'), 256, Buffer.from(this.iv, 'base64'));
    const decrypted = padder.unpad(decryptedPadded, 32);
    const clearText = decrypted.toString('utf8');
    return clearText;
  }

  private cardno(six, four) {
    const f1 = six.substr(0, 4);
    const f2 = six.substr(4, 5);
    return f1 + f2 + '******' + four;
  }
}
