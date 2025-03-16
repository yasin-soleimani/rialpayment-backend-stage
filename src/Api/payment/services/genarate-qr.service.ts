import { Injectable, NotFoundException, successOptWithDataNoValidation } from '@vision/common';
import axios, { AxiosInstance } from 'axios';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { Sio5 } from '@vision/common/utils/month-diff.util';
import * as qs from 'querystring';
import { getMacAddress } from '@vision/common/services/get-mac.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import crypto from 'crypto';
import { encryptionString } from '../crypto/crypto';

@Injectable()
export class PaymentGenerateQrService {
  private Client: AxiosInstance;

  constructor(private readonly userService: UserService) {
    this.Client = axios.create({
      baseURL: 'http://localhost:8001/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async newQr(userid): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new NotFoundException();

    const mac = getMacAddress(userInfo.hmac);
    const qr = this.qrModel(userInfo._id, mac);
    //const format = await this.make(qr, userInfo.hek);

    //const res = await this.Client.post('/api/v1/enc', format);
    //if (res.status != 200) throw new UserCustomException('متاسفانه عملیات با خطا با مواجه شده است', false, 500);

    const dataMsg = await encryptionString(JSON.stringify(qr), userInfo.hek);
    console.log('data:::::::::::::::::', JSON.stringify(qr), userInfo.hek);
    const data = '0' + userInfo.mobile + dataMsg;

    return successOptWithDataNoValidation(data);
  }

  private qrModel(userid, mac) {
    return {
      ty: 101,
      to: userid,
      ti: Sio5(),
      u: mac,
    };
  }

  private async make(qr, hek): Promise<any> {
    return qs.stringify({
      key: hek,
      text: JSON.stringify(qr),
    });
  }
}
