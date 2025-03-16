import { Injectable } from '@vision/common';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { InternetPaymentGatewayGetTokenDto } from '../dto/internet-payment-gateway.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { IpgStatusCodeConst } from '../const/terminal-status-code.const';
import { MerchantCoreTerminalService } from '../../../Core/merchant/services/merchant-terminal.service';
import { InternetPaymentGatewayCommonService } from './common.service';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { InternetPaymentGatewayMipgFormatterFunction } from '../function/ipg-formatter.func';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as crypto from 'crypto';

@Injectable()
export class InternetPaymentGatewayGetToken {
  constructor(
    private readonly mipgService: MipgCoreService,
    private readonly ipgService: IpgCoreService,
    private readonly commonService: InternetPaymentGatewayCommonService
  ) {}

  async getToken(getInfo: InternetPaymentGatewayGetTokenDto, req): Promise<any> {
    if (Number(getInfo.amount) < 1000)
      throw new UserCustomException('مبلغ غیرمجاز', false, IpgStatusCodeConst.Internal);

    if (getInfo.callbackurl.length < 5)
      throw new UserCustomException('آدرس کال بک اشتباه می باشد', false, IpgStatusCodeConst.Internal);

    const terminalInfo = await this.mipgService.getInfo(getInfo.terminalid);
    if (!terminalInfo || terminalInfo.terminalid != getInfo.terminalid)
      throw new UserCustomException('پذیرنده نامعتبر', false, IpgStatusCodeConst.InvalidAcceptor);

    if (!terminalInfo.terminal)
      throw new UserCustomException('پذیرنده نامعتبر', false, IpgStatusCodeConst.InvalidAcceptor);

    if (
      terminalInfo.status == false ||
      terminalInfo.terminal.status == false ||
      terminalInfo.terminal.merchant.status == false
    )
      throw new UserCustomException('پذیرنده غیرفعال', false, IpgStatusCodeConst.DisabledAcceotor);
    console.log('end ip: ', req.ip);
    if (req.headers) {
      if (!req.headers.authorization && !req.headers.Authorization)
        throw new UserCustomException('احراز با خطا مواجه شد!', false, IpgStatusCodeConst.DisabledAcceotor);
      const auth = req.headers.authorization || req.headers.Authorization;
      console.log('auth key: ', auth);
      var shasum = crypto.createHash('sha1');
      shasum.update(terminalInfo._id.toString());
      const sha = shasum.digest('hex');
      console.log('sha ', sha);
      if (sha != auth)
        throw new UserCustomException('احراز با خطا مواجه شد!', false, IpgStatusCodeConst.DisabledAcceotor);
    }
    if (!getInfo.callbackurl.startsWith(terminalInfo.url))
      throw new UserCustomException('آدرس کالبک با آدرس ثبت شده مطابقت ندارد');
    //const invalidIp = await this.commonService.checkip(terminalInfo, req.ip);
    //if (invalidIp) throw new UserCustomException('آی پی نامعتبر', false, IpgStatusCodeConst.InvalidIp);

    const details = {
      status: -100,
      respmsg: 'توکن ایجاد شد',
    };

    const terminalInfoDetails = {
      acceptorcode: terminalInfo.terminal.merchant.merchantcode,
      terminal: terminalInfo.terminal.terminalid,
    };
    const format = InternetPaymentGatewayMipgFormatterFunction(
      terminalInfo.user,
      terminalInfo.ref,
      terminalInfo.terminalid,
      details,
      terminalInfoDetails,
      getInfo.amount,
      getInfo.paylaod,
      getInfo.callbackurl,
      getInfo.invoiceid
    );

    console.log(getInfo, 'getInfo');
    const data = await this.ipgService.newReqSubmit(format);
    if (data && !isEmpty(data.userinvoice)) {
      return {
        status: 0,
        success: true,
        message: 'عملیات با موفقیت انجام شد',
        token: data.userinvoice,
      };
    }
  }
}
