import { Injectable, successOpt } from '@vision/common';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { SwitchService } from '../../../Switch/next-generation/switch.service';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { IpgStatusCodeConst } from '../const/terminal-status-code.const';
import { InternetPaymentGatewaySwitchFormatFunction } from '../function/switch-format.func';
import { ShaparakTerminalTypeConst } from '../const/terminal-type.const';
import { InternetPaymentGatewayCommonService } from './common.service';

@Injectable()
export class InternetPaymentGatewayVerifyService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly switchService: SwitchService,
    private readonly mipgService: MipgCoreService,
    private readonly commonService: InternetPaymentGatewayCommonService
  ) {}

  async submit(token: string, req): Promise<any> {
    const tokenInfo = await this.ipgService.findByUserInvoice(token);
    if (!tokenInfo || tokenInfo.userinvoice != token)
      throw new UserCustomException('توکن نامعتبر', false, IpgStatusCodeConst.InvalidToken);

    const mipgInfo = await this.mipgService.getInfo(tokenInfo.terminalid);
    if (!mipgInfo || mipgInfo.terminalid != tokenInfo.terminalid)
      throw new UserCustomException('پذیرنده نامعتبر', false, IpgStatusCodeConst.InvalidAcceptor);

    const ipInvalid = await this.commonService.checkip(mipgInfo, req.ip);
    if (ipInvalid == true) throw new UserCustomException('آی پی نامعتبر', false, IpgStatusCodeConst.InvalidIp);

    if (tokenInfo.details.respcode != 0) throw new UserCustomException('خطا', false, IpgStatusCodeConst.Internal);

    const switchReq = InternetPaymentGatewaySwitchFormatFunction(
      106,
      tokenInfo.orderid,
      tokenInfo.details.cardnumber,
      tokenInfo.details.cardnumber,
      tokenInfo.terminalinfo.terminal,
      tokenInfo.terminalinfo.acceptorcode,
      new Date(),
      tokenInfo.amount,
      tokenInfo.pin,
      ShaparakTerminalTypeConst.Internet
    );

    const result = await this.switchService.action(switchReq);
    this.ipgService.addQuery(tokenInfo._id, { $set: { confirm: true } });

    return this.rsSwitch(result.rsCode);
  }

  rsSwitch(rscode) {
    switch (rscode) {
      case 17: {
        return {
          status: IpgStatusCodeConst.Success,
          success: true,
          message: 'عملیات با موفقیت انجام شد',
        };
      }

      case 15: {
        return {
          status: IpgStatusCodeConst.Duplicate,
          success: false,
          message: 'رکورد تکراری',
        };
      }

      default: {
        return {
          status: IpgStatusCodeConst.Internal,
          success: false,
          message: 'خطا',
        };
      }
    }
  }
}
