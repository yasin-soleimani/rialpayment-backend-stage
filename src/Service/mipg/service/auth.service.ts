import { Injectable, NotFoundException, successOpt, InternalServerErrorException } from '@vision/common';
import { MipgAuthService } from '../../../Core/mipg/services/mipg-auth.service';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { Sitad } from '@vision/common/utils/sitad.util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { nahabRequest } from '@vision/common/nahab/request';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { GeneralService } from '../../../Core/service/general.service';
import * as securePin from 'secure-pin';
import { SendAsanakSms } from '@vision/common/notify/sms.util';

@Injectable()
export class MipgServiceAuthService {
  constructor(
    private readonly mipgAuthService: MipgAuthService,
    private readonly ipgService: IpgCoreService,
    private readonly mipgService: MipgCoreService,
    private readonly generalService: GeneralService
  ) {}

  async getInfo(getInfo): Promise<any> {
    const traxInfo = await this.ipgService.findByUserInvoice(getInfo.token);
    if (!traxInfo) throw new NotFoundException();

    const mipgInfo = await this.mipgService.getInfo(traxInfo.terminalid);
    if (!mipgInfo) throw new NotFoundException();

    const authInfo = await this.mipgAuthService.getInfoByMipg(mipgInfo._id);
    if (!authInfo) throw new NotFoundException();

    return {
      sitad: authInfo.sitad,
      nationalcode: authInfo.nationalcode,
      mobile: authInfo.mobile,
      nahab: authInfo.nahab,
      shahkar: authInfo.shahkar,
      token: getInfo.token,
    };
  }

  async validat(getInfo): Promise<any> {
    const traxInfo = await this.ipgService.findByUserInvoice(getInfo.token);
    if (!traxInfo) throw new NotFoundException();

    const mipgInfo = await this.mipgService.getInfo(traxInfo.terminalid);
    if (!mipgInfo) throw new NotFoundException();

    const authInfo = await this.mipgAuthService.getInfoByMipg(mipgInfo._id);
    if (!authInfo) throw new NotFoundException();

    if (getInfo.mobile == 'undefined') {
      delete getInfo.mobile;
    }

    if (getInfo.shahkar == 'undefined') {
      delete getInfo.shahkar;
    }

    if (getInfo.cardnumber == 'undefined') {
      delete getInfo.shahkar;
    }

    if (getInfo.birthdate == 'undefined') {
      delete getInfo.shahkar;
    }
    if (getInfo.nationalcode == 'undefined') {
      delete getInfo.shahkar;
    }

    const sitad = new Sitad();
    if (authInfo.sitad == true) {
      await this.checkSitad(getInfo, sitad);
    }

    if (authInfo.mobile == true) {
      await this.checkMobile(getInfo);
    }

    if (authInfo.shahkar == true) {
      await this.checkShahkar(getInfo, sitad);
    }

    if (authInfo.nahab == true) {
      await this.checkNahab(getInfo);
    }

    return this.ipgService
      .addAuthInfo(getInfo.token, {
        authinfo: {
          birthdate: getInfo.birthdate,
          nationalcode: getInfo.nationalcode,
          mobile: getInfo.mobile,
          cardnumber: getInfo.cardnumber,
        },
      })
      .then((res) => {
        if (!res) throw new UserCustomException('عملیات با خطا مواجه شده است');
        return successOpt();
      });
  }

  // check nationalcode and birthdate with Sitad
  async checkSitad(getInfo, sitad): Promise<any> {
    const info = await sitad.getInfo(getInfo.nationalcode, getInfo.birthdate);
    if (!info) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    if (info.nin.length < 1) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    return true;
  }

  //cehck mobile number with nationalcode over Shahkar service
  async checkShahkar(getInfo, sitad): Promise<any> {
    const info = await sitad.shahkar(getInfo.mobile, getInfo.nationalcode);
    if (!info) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    if (!info.result) throw new UserCustomException('متاسفانه خطایی رخ داده است مجددا تلاش کنید');
    if (info.result == 'MISMATCH') throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    return true;
  }

  // check cardnumber with nationalcode with nahab service
  async checkNahab(getInfo): Promise<any> {
    const info = await nahabRequest(getInfo.cardnumber);
    if (!info) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    if (info.resultCode != 0) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    if (info.nationalCode < 1) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    if (info.nationalCode != getInfo.nationalcode) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    return true;
  }

  // check monile with verification code
  async checkMobile(getInfo): Promise<any> {
    const info = await this.ipgService.findByUserInvoice(getInfo.token);
    if (!info) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    if (info.authinfo.mobile != getInfo.mobile) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    if (info.authcode != getInfo.code) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد');
    return true;
  }

  async sendTokenSms(getInfo: any): Promise<any> {
    if (isEmpty(getInfo.mobile) || isEmpty(getInfo.token)) {
      throw new FillFieldsException();
    }

    const randno = securePin.generatePinSync(4);
    return this.ipgService
      .addAuthInfo(getInfo.token, {
        authcode: randno,
        authinfo: {
          mobile: getInfo.mobile,
        },
      })
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        // this.generalService.AsanaksendSMS('', '','', getInfo.mobile, randno );
        SendAsanakSms(
          process.env.ASANAK_USERNAME,
          process.env.ASANAK_PASSWORD,
          process.env.ASANAK_NUMBER,
          getInfo.mobile,
          randno
        );
        return successOpt();
      });
  }
}
