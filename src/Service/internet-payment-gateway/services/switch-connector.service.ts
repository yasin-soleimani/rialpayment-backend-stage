import { Injectable, successOpt, faildOpt } from '@vision/common';
import { InternetPaymentGatewayCardService } from './card.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { InternetPaymentGatewaySwitchFormatFunction } from '../function/switch-format.func';
import { ShaparakTerminalTypeConst } from '../const/terminal-type.const';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { InternetPaymentGatewayCommonService } from '../services/common.service';
import { SwitchService } from '../../../Switch/next-generation/switch.service';
import { IpgStatusCodeConst } from '../const/terminal-status-code.const';
import { SessionService } from '../../../Core/session/session.service';

@Injectable()
export class InternetPaymentGatewaySwitchConnectorService {
  constructor(
    private readonly cardService: InternetPaymentGatewayCardService,
    private readonly commonService: InternetPaymentGatewayCommonService,
    private readonly ipgService: IpgCoreService,
    private readonly switchService: SwitchService,
    private readonly sessionService: SessionService
  ) {}

  async getSwitch(getInfo): Promise<any> {
    const sessionInfo = await this.sessionService.getStatusById(getInfo.id);
    console.log('first session: ', sessionInfo);
    if (!sessionInfo) throw new UserCustomException('توکن نامعتبر', false, 400);
    const Json = JSON.parse(sessionInfo.session);

    if (Json.captcha != getInfo.captcha) throw new UserCustomException('کد امنیتی اشتباه می باشد');

    const ipgInfo = await this.ipgService.findByUserInvoice(getInfo.token);
    if (ipgInfo.userinvoice != getInfo.token) throw new UserCustomException('توکن نامعتبر', false, 400);
    const expireTime = await this.commonService.getDiff(ipgInfo.createdAt);
    if (expireTime > 9) throw new UserCustomException('توکن نامعتبر', false, 400);

    if (ipgInfo.confirm == true || ipgInfo.reverse == true || ipgInfo.details.type == 100)
      throw new UserCustomException('توکن نامعتبر', false, 400);

    const cardValidation = await this.cardService.cardValidation(
      getInfo.cardno,
      getInfo.pin,
      getInfo.expire,
      getInfo.cvv2
    );
    if (!cardValidation && cardValidation.status != 200) throw new UserCustomException('کارت نامعتبر', false, 400);

    const orderid = new Date().getTime();
    this.ipgService.addQuery(ipgInfo._id, { $set: { orderid: orderid } });
    const switchReq = InternetPaymentGatewaySwitchFormatFunction(
      104,
      orderid,
      cardValidation.cardno,
      cardValidation.track2,
      ipgInfo.terminalinfo.terminal,
      ipgInfo.terminalinfo.acceptorcode,
      new Date(),
      ipgInfo.amount,
      cardValidation.pin,
      ShaparakTerminalTypeConst.Internet
    );
    const res = await this.switchService.action(switchReq);
    return this.resultSwitch(res, ipgInfo, getInfo);
  }

  private async resultSwitch(res, ipgInfo, getInfo): Promise<any> {
    if (res.CommandID == 204 && res.rsCode == 20) {
      this.ipgService.addQuery(ipgInfo._id, {
        $set: {
          details: {
            type: 100,
            cardnumber: getInfo.cardno,
            respcode: 0,
            respmsg: 'عملیات با موفقیت انجام شد',
          },
        },
      });
      return successOpt();
    } else if (res.CommandID == 204 && res.rsCode == 11) {
      return {
        status: IpgStatusCodeConst.NotEnoughREsource,
        success: false,
        message: 'موجودی کافی نمی باشد',
      };
    } else {
      this.ipgService.addQuery(ipgInfo._id, {
        $set: {
          details: {
            type: 100,
            respcode: -10,
            respmsg: 'عملیات با خطا مواجه شده است',
          },
        },
      });
      return faildOpt();
    }
  }

  async cancelTransaction(token: string): Promise<any> {
    const traxInfo = await this.ipgService.findByUserInvoice(token);
    if (!traxInfo || traxInfo.userinvoice != token || traxInfo.confirm == true || traxInfo.reverse == true)
      throw new UserCustomException('تراکنش نامعتبر');
    const expireTime = await this.commonService.getDiff(traxInfo.createdAt);
    if (expireTime > 9) throw new UserCustomException('توکن نامعتبر', false, 400);
    this.ipgService.addQuery(traxInfo._id, {
      $set: {
        details: {
          type: 100,
          respcode: IpgStatusCodeConst.CancledByUSer,
          respmsg: 'تراکنش لغو شد',
        },
      },
    });

    return successOpt();
  }
}
