import { Injectable, InternalServerErrorException } from '@vision/common';
import { Request } from 'express';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { LeasingInstallmentsUtilityService } from './leasing-installments-utility.service';
import { LeasingInstallmentsSettlementService } from './leasing-installments-settlement.service';
import { LeasingInstallmentsPayIpgPayloadDto } from '../dto/leasing-installments-pay-ipg-payload.dto';
import { ClubPwaService } from '../../../Core/clubpwa/club-pwa.service';

@Injectable()
export class LeasingInstallmentsCallbackService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly userService: UserService,
    private readonly leasingInstallmentsUtilityService: LeasingInstallmentsUtilityService,
    private readonly settlementService: LeasingInstallmentsSettlementService,
    private readonly clubPwaService: ClubPwaService
  ) {}

  async paymentCallback(getInfo: any, req: Request, res: any): Promise<any> {
    // get the transaction information
    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد');

    // parse the transaction payload data
    const payloadDto = JSON.parse(payInfo.payload) as LeasingInstallmentsPayIpgPayloadDto;

    // get the user info who has the transaction
    const userInfo = await this.userService.getInfoByUserid(payInfo.user);
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد ', false, 404);

    const clientCallbackAddress = await this.getCorrectCallbackAddress(payloadDto);

    if (getInfo.respcode == 0) {
      const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
      if (!verify) throw new InternalServerErrorException();

      let url = '';
      if (verify.status == 0 && verify.success == true) {
        await this.settlementService.actionIpg(payloadDto.installments, payloadDto, userInfo, getInfo.ref);
        url = 'refid=' + payInfo.userinvoice + '&status=true&amount=' + payInfo.total;
        console.log('leasingApplyPay callback::::: ', url, clientCallbackAddress);
      } else {
        url = 'refid=' + payInfo.userinvoice + '&status=false&amount=' + payInfo.total;
        console.log('leasingApplyPay callback::::: ', url, clientCallbackAddress);
      }

      res.writeHead(301, { Location: clientCallbackAddress + url });
      res.end();
    } else {
      const url = 'refid=' + payInfo.userinvoice + '&status=false&amount=' + payInfo.total;
      console.log('leasingApplyPay callback::::: ', url, clientCallbackAddress);
      res.writeHead(301, { Location: clientCallbackAddress + url });
      res.end();
    }
  }

  private async getCorrectCallbackAddress(payloadDto: LeasingInstallmentsPayIpgPayloadDto): Promise<string> {
    const { devicetype, referer } = payloadDto;
    // TODO: mobile urls must be added
    // NOTE: pwa and web are ok!
    switch (devicetype) {
      case 'pwa': {
        if (referer) {
          const clubPwaData = await this.clubPwaService.getClubPwaByReferer(referer);
          if (clubPwaData) {
            return clubPwaData.leCreditInstallmentsCallbackUrl;
          }
        }

        return 'https://pwa.rialpayment.ir/i/services/leasing-user-installments-pay-result?';
      }
      case 'mobile':
        return 'app://ir.mersad.rialpayment/leasing?';
      case 'mobile_google':
        return 'app://com.mersad.rialpayment/leasing?';
      case 'web':
        return 'https://portal.rialpayment.ir/i/leasing-user-installments-pay-result?';
      default:
        return 'https://portal.rialpayment.ir/i/leasing-user-installments-pay-result?';
    }
  }
}
