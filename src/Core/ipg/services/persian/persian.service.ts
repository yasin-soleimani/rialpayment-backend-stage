import { Injectable, InternalServerErrorException } from '@vision/common';
import * as soap from 'soap';
import * as moment from 'moment-timezone';
import { Credentials, PaymentRequestData, PaymentRequestParams } from './persian.class';
import * as Rijndael from 'rijndael-js';
import * as padder from 'pkcs7-padding';
import { PersianStatus } from './persian.consts';
import axios, { AxiosInstance } from 'axios';
import { ClubPwaService } from '../../../clubpwa/club-pwa.service';

@Injectable()
export class IpgPersianService {
  private MERCHANT_SERVICES: string = 'https://services.asanpardakht.net/paygate/merchantservices.asmx?wsdl';
  private MERCHANT_SERVICES_REST: string = 'https://ipgrest.asanpardakht.ir/';
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

  private axiosInstance: AxiosInstance;
  constructor(private readonly clubPwaService: ClubPwaService) {
    this.axiosInstance = axios.create({
      baseURL: this.MERCHANT_SERVICES_REST,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async newReq(
    orderid,
    amount,
    callbackurl,
    desc,
    merchantConfigurationId,
    merchantId,
    username,
    password,
    key,
    iv
  ): Promise<any> {
    let dateTime = moment().tz('Asia/Tehran').format('YYYYMMDD HHmmss');
    const orederid = Date.now();
    let paymentRequestParams = new PaymentRequestParams(
      username,
      password,
      orederid,
      amount,
      dateTime,
      desc,
      callbackurl
    );
    const encData = await this.encrypt(paymentRequestParams.toString(), key, iv);
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

  async newReqRest(
    orderid,
    amount,
    callbackurl,
    desc,
    merchantConfigurationId,
    merchantId,
    username,
    password,
    key,
    iv
  ): Promise<any> {
    let dateTime = moment().tz('Asia/Tehran').format('YYYYMMDD HHmmss');
    const orederid = Date.now();

    merchantConfigurationId = parseInt(merchantConfigurationId);
    amount = parseInt(amount);
    const data = {
      merchantConfigurationId: merchantConfigurationId,
      serviceTypeId: 1,
      localInvoiceId: orederid,
      amountInRials: amount,
      localDate: dateTime,
      additionalData: desc,
      callbackURL: callbackurl + '?tr=' + orederid,
      paymentId: '0',
    };

    console.log('asanpardakht Data::::::::::::::::::::::: ', data);
    try {
      const request = await this.axiosInstance.request({
        url: 'v1/Token',
        method: 'POST',
        headers: { usr: username, pwd: password },
        data,
      });
      return {
        token: request.data,
        type: 2,
        orderid: orederid,
      };
    } catch (e) {
      console.log('error getting asan pardakht token', e?.response?.data ?? e?.response);
      throw new InternalServerErrorException();
    }
  }

  async confirm(getInfo, ipgData) {
    console.log('in confirm:::::::::::::::');

    try {
      const res = await this.axiosInstance.request({
        url: `v1/TranResult?LocalInvoiceId=${ipgData.orderid}&MerchantConfigurationId=${ipgData.terminalinfo.merchantconfigid}`,
        method: 'GET',
        headers: {
          usr: ipgData.terminalinfo.username,
          pwd: ipgData.terminalinfo.password,
        },
      });
      console.log('resssss::::::::', res.data);
      return { status: res.status, data: res.data };
    } catch (e) {
      console.log('errr', e.response.data);
      if (e.response) return { status: e.response.status, data: e.response.data };
      else throw new InternalServerErrorException();
    }
  }

  async verify(ipgData, payGateTranId: number) {
    console.log('in verify:::::::::::::::');
    try {
      const res = await this.axiosInstance.request({
        url: `v1/Verify`,
        method: 'POST',
        headers: {
          usr: ipgData.terminalinfo.username,
          pwd: ipgData.terminalinfo.password,
        },
        data: {
          merchantConfigurationId: ipgData.terminalinfo.merchantconfigid,
          payGateTranId: payGateTranId,
        },
      });
      console.log('resssss verfiy::::::::', res.data);
      return { status: res.status, data: null };
    } catch (e) {
      console.log('errr', e.response.status);
      if (e.response) return { status: e.response.status, data: null };
      else throw new InternalServerErrorException();
    }
  }

  async settlement(ipgData, payGateTranId: number) {
    console.log('in settlement:::::::::::::::');
    try {
      const res = await this.axiosInstance.request({
        url: `v1/Settlement`,
        method: 'POST',
        headers: {
          usr: ipgData.terminalinfo.username,
          pwd: ipgData.terminalinfo.password,
        },
        data: {
          merchantConfigurationId: ipgData.terminalinfo.merchantconfigid,
          payGateTranId: payGateTranId,
        },
      });
      console.log('resssss settle::::::::', res.data);
      return { status: res.status, data: null };
    } catch (e) {
      console.log('errr', e.response.status);
      if (e.response) return { status: e.response.status, data: null };
      else throw new InternalServerErrorException();
    }
  }

  async checkout(getInfo, merchantConfigurationId, key, iv): Promise<any> {
    const decoded = await this.decode(getInfo.ReturningParams, key, iv);
    const sep = decoded.split(',');
    const state = PersianStatus[sep[3]];
    console.log(state, 'state');
    if (sep[3] == '0' || sep[3] == '00') {
      const cardsplit = sep[4].split(':');
      const res = await this.settle(getInfo, getInfo.PayGateTranID, merchantConfigurationId, key, iv);
      if (res.RequestVerificationResult == '500') {
        const conid = await this.reqCon(getInfo, getInfo.PayGateTranID, merchantConfigurationId, key, iv);
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

  private async settle(getInfo, transId, merchantConfigurationId, key, iv): Promise<any> {
    let credentials = new Credentials(this.username, this.password);
    const encryptedData = await this.encrypt(credentials.toString(), key, iv);

    const params = {
      merchantConfigurationID: merchantConfigurationId,
      encryptedCredentials: encryptedData,
      payGateTranID: transId,
    };

    let client = await soap.createClientAsync(this.MERCHANT_SERVICES);
    let result = await client.RequestVerificationAsync(params);
    return result[0];
  }

  async getClubPwa(traxInfo) {
    if (traxInfo.devicetype === 'mobile') {
      return 'app://ir.mersad.rialpayment';
    } else {
      const referer = JSON.parse(traxInfo.payload).referer;
      console.log('referrer after cb:::::::::::::::: ', referer);
      const clubPwaData = await this.clubPwaService.getClubPwaByReferer(referer);
      return clubPwaData ? clubPwaData.chargeCallback : '';
    }
  }

  private async reqCon(getInfo, transId, merchantConfigurationId, key, iv): Promise<any> {
    let credentials = new Credentials(this.username, this.password);
    const encryptedData = await this.encrypt(credentials.toString(), key, iv);

    const params = {
      merchantConfigurationID: merchantConfigurationId,
      encryptedCredentials: encryptedData,
      payGateTranID: transId,
    };

    let client = await soap.createClientAsync(this.MERCHANT_SERVICES);
    let result = await client.RequestReconciliationAsync(params);
    return result[0];
  }

  private async encrypt(data, key, iv): Promise<any> {
    const plainText = Buffer.from(data, 'utf8');
    const padded = padder.pad(plainText, 32); //Use 32 = 256 bits block sizes
    const cipher = new Rijndael(Buffer.from(key, 'base64'), 'cbc'); //CBC mode
    const encrypted = cipher.encrypt(padded, 256, Buffer.from(iv, 'base64'));
    return encrypted.toString('base64');
  }

  async decode(data, key, iv): Promise<any> {
    const decipher = new Rijndael(Buffer.from(key, 'base64'), 'cbc');
    const decryptedPadded = decipher.decrypt(Buffer.from(data, 'base64'), 256, Buffer.from(iv, 'base64'));
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
