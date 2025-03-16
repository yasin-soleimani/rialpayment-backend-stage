import { Injectable } from '@vision/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { SdkRegisterDto } from './dto/mobile-register.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MobileRequestDto } from './dto/mobile-request.dto';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { AccountService } from '../../Core/useraccount/account/account.service';
import * as UniqueNumber from 'unique-number';

@Injectable()
export class SdkService {
  private client: AxiosInstance;
  constructor() {
    // this.client = axios.create({
    //   baseURL: 'https://apms.asanpardakht.net/sdk/w10/1169/',
    //   headers: { 'Content-Type': 'text/plain' },
    //   httpsAgent: new https.Agent({
    //     rejectUnauthorized: false,
    //   }),
    // });
  }
  //
  // async register(getInfo: SdkRegisterDto): Promise<any>{
  //     if (isEmpty(getInfo.mobile)) throw new FillFieldsException();
  //     const timestamp =  Math.round(new Date().getTime() / 1000);
  //     const htran = 1214121516205841;
  //     // const data =   '{"hop":102,"htime":' + timestamp + ',"hi":157,"htran":' + htran + ',"hkey":"etak5psfedfph0088brjqg14se","mo":"' + getInfo.mobile.toString() + '"}';
  //     const datax = {hop:102,htime:timestamp,hi:1169,htran:htran,hkey:"frhuuhd2faroi39n5157dtmo0d",mo:getInfo.mobile};
  //     const data = JSON.stringify(datax);
  //     const sign = crypto.createSign('RSA-SHA256');
  //     sign.update(data);
  //     sign.end();
  //     const privateKey =  fs.readFileSync('/home/younes/Desktop/NG/keys/asanpardakht/privatekey.pem');
  //     const signdata = sign.sign(privateKey.toString(), 'base64');
  //     return {
  //       status: 200,
  //       success: true,
  //       message: 'عملیات با موفقیت انجام شد',
  //       sign: '1#1#' + signdata,
  //       hostrequest: data,
  //     };
  //   }
  //
  //   async payment(getInfo: SdkRegisterDto): Promise<any>{
  //     if (isEmpty(getInfo.mobile) || isEmpty(getInfo.amount)) throw new FillFieldsException();
  //     const timestamp =  Math.round(new Date().getTime() / 1000);
  //     const htran = 1214121516205841;
  //     // const data =   '{"hop":102,"htime":' + timestamp + ',"hi":157,"htran":' + htran + ',"hkey":"etak5psfedfph0088brjqg14se","mo":"' + getInfo.mobile.toString() + '"}';
  //     const datax = {hi:1169,htran:htran,htime:timestamp,hop:209,hkey:"frhuuhd2faroi39n5157dtmo0d","merch":"833930","pid":"",ao:getInfo.amount,"iban":"",mo:getInfo.mobile,"tkn":""};
  //     const data = JSON.stringify(datax);
  //     const sign = crypto.createSign('RSA-SHA256');
  //     sign.update(data);
  //     sign.end();
  //     const privateKey =  fs.readFileSync('/home/younes/Desktop/NG/keys/asanpardakht/privatekey.pem');
  //     const signdata = sign.sign(privateKey.toString(), 'base64');
  //     const HostSign = '"1#1#' + signdata + '"';
  //     return {
  //       status: 200,
  //       success: true,
  //       message: 'عملیات با موفقیت انجام شد',
  //       sign: '1#1#' + signdata,
  //       hostrequest: data,
  //     };
  //   }
  //
  //   async selectOpt(getInfo: SdkRegisterDto): Promise<any>{
  //     if (!isEmpty(getInfo.hop)){
  //       switch (getInfo.hop.toString()){
  //         case '102': {
  //           return await this.register(getInfo);
  //         }
  //         case '209': {
  //           return await this.payment(getInfo);
  //         }
  //         default: {
  //           throw new UserCustomException('متاسفانه عملیات با مشکل مواجه شده است', false, 404);
  //         }
  //       }
  //     }
  //   }
  // async verify(getInfo: MobileRequestDto, userid): Promise<any>{
  //     const re = /"/gi;
  //     const hdata = getInfo.hostsign.replace(re, '');
  //     const a = hdata.toString().split('#');
  //     const verify = crypto.createVerify('RSA-SHA256');
  //     verify.update(getInfo.hostrequest);
  //     verify.end();
  //     const publickeyAsan =  fs.readFileSync('/home/younes/Desktop/NG/keys/asanpardakht/asan-publickey.cer');
  //     if (verify.verify(publickeyAsan, a[2], 'base64')){
  //       const timestamp =  Math.round(new Date().getTime() / 1000);
  //       const htran = 1214121516205841;
  //       const hr = JSON.parse(getInfo.hostrequest);
  //       const datax = {hi:1169,htran:htran,htime:hr.htime,hop:2001,hkey:"frhuuhd2faroi39n5157dtmo0d",ao:hr.ao,stime:timestamp,utran:getInfo.uniqueid,stkn:hr.stkn};
  //       const data = JSON.stringify(datax);
  //       const sign = crypto.createSign('RSA-SHA256');
  //       sign.update(data);
  //       sign.end();
  //       const privateKey =  fs.readFileSync('/home/younes/Desktop/NG/keys/asanpardakht/privatekey.pem');
  //       const signdata = sign.sign(privateKey.toString(), 'base64');
  //       const out = await this.verifyAsan(data, signdata, '1.8.0');
  //       const outx = JSON.parse(out.hresp);
  //       if ( outx.st === 0) {
  //         const uniqueNumber = new UniqueNumber(true);
  //         const title = 'شارژ کیف پول از درگاه اینترنتی ';
  //         this.accountService.chargeAccount(userid, 'wallet', hr.ao);
  //         const ref = 'Charge-' + uniqueNumber.generate();
  //         const log = this.setLogg(title, ref, hr.ao, true, userid, userid);
  //         this.loggerService.newLogg(log);
  //         return {
  //           status : 200,
  //           success : true,
  //           message : 'عملیات با موفقیت انجام شد',
  //         };
  //       } else {
  //         return {
  //           status : 402,
  //           success : true,
  //           message : 'پرداخت با خطا مواجه شده است',
  //         };
  //       }
  //     } else {
  //       return {
  //         status : 402,
  //         success : true,
  //         message : 'پرداخت با خطا مواجه شده است',
  //       };
  //     }
  //   }
  //
  //   async verifyAsan(reqx, signx, verx): Promise<any> {
  //     const ttttt =  await this.client.post('1', {
  //       hreq: reqx,
  //       hsign: '1#1#' + signx,
  //       ver: verx,
  //     });
  //     return ttttt.data;
  //   }
  //
  //   private setLogg(titlex, refx, amountx, statusx, fromid, toid){
  //     return {
  //       title: titlex,
  //       ref: refx,
  //       amount: amountx,
  //       status: statusx,
  //       from: fromid,
  //       to: toid,
  //     };
  //   }
}
