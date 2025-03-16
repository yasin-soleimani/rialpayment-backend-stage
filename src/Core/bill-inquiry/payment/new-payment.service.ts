import { Injectable } from '@vision/common';
import axios, { AxiosInstance } from 'axios';
import * as uid from 'uniqid';

@Injectable()
export class BillInquiryNewPaymentCoreService {
  private url: string = 'https://ib.ebanksepah.ir/';
  private ApiKey: string = 'c45e672a-288b-4565-8927-3dd340512a53';
  private OrgCode: string = '2696';
  private account: string = '1686301517606';

  private axiosInstance: AxiosInstance;
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.url,
      headers: { ApiKey: this.ApiKey },
    });

/*    setTimeout(async () => {
      await this.payment('9068053304121', '27011204', 270000);
    }, 5000);*/
  }

  async payment(billId: string, payId: string, amount: number): Promise<any> {
    const TransactionId = this.generateTransactionCode(this.OrgCode);
    const dataToSend = {
      TransactionId: TransactionId,
      PaymentId: payId,
      BillId: billId,
      Amount: amount,
      DepositNumber: this.account,
      TraceNo: Math.floor(Math.random() * 999999999) + 1000000000 + '',
      ReferenceNo: Math.floor(Math.random() * 999999999) + 1000000000 + '',
      TerminalType: '12',
    };
    const signature = this.generateSignedData(dataToSend, this.OrgCode);
    console.log(signature);
    try {
      const req = await this.axiosInstance.request({
        method: 'post',
        url: 'BillCharge/BillPaymentWithAccount',
        headers: { Signature: signature.signed },
        data: dataToSend,
      });
      console.log('dotin data ::::::::::::::::: ', req);
    } catch (e) {
      console.log('dotin err ::::::::::::::::::::::: ', e.response);
    }
  }

  generateTransactionCode(OrgCode): string {
    const orgArray = OrgCode.split('');
    const randomChars = uid();
    const randomArray = randomChars.split('');
    let sum = 0;
    for (const i of orgArray) sum += i.charCodeAt();
    for (const i of randomArray) sum += i.charCodeAt();
    return OrgCode + '-' + randomChars + '-' + sum;
  }

  generateSignedData(data, OrgCode): { notSigned: string; signed: string } {
    data = JSON.stringify(data);
    const toBeSigned = `POST#BillCharge/BillPaymentWithAccount#${this.ApiKey}#${data}`;
    const signed = this.testSignature(toBeSigned);
    return {
      notSigned: toBeSigned,
      signed: signed,
    };
  }

  testSignature(data, sherkat = 'mersad') {
    const crypto = require('crypto');
    const fs = require('fs');
    const privateKey = fs.readFileSync(__dirname + '/' + sherkat + '/private_key.pem', 'utf8');
    const sign = crypto.createSign('SHA1');
    sign.write(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
  }
}
