import { Injectable } from '@vision/common';
import { Request } from 'express';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { InternalServerErrorException } from '@vision/common/exceptions/internal-server-error.exception';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { LeasingApplyUtilityService } from './leasing-apply-utility.service';
import { LeasingApplySettlementService } from './leasing-apply-settlement.service';

@Injectable()
export class LeasingApplyCallbackService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly userService: UserService,
    private readonly applyUtilityService: LeasingApplyUtilityService,
    private readonly settlementService: LeasingApplySettlementService
  ) {}

  async payment(getInfo: any, req: Request, res: any): Promise<any> {
    // get the transaction information
    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد');

    // parse the transaction payload data
    const payload = JSON.parse(payInfo.payload) as { _id: string; userId: string };

    // get the user info who has the transaction
    const userInfo = await this.userService.getInfoByUserid(payInfo.user);
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد ', false, 404);

    // get the leasing apply information
    const applyData = await this.applyUtilityService.getApplyById(payload._id);
    if (!applyData) throw new UserCustomException('اطلاعات اعتبار یافت نشد ', false, 404);

    const clientCallbackAddress = process.env.LECREDIT_APPLY_PAY_IPG_CALLBACK_CLIENT;

    if (getInfo.respcode == 0) {
      const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
      if (!verify) throw new InternalServerErrorException();

      let url = '';
      if (verify.status == 0 && verify.success == true) {
        await this.settlementService.actionIPG(applyData);
        url = '?refid=' + payInfo.userinvoice + '&status=true&amount=' + payInfo.total;
        console.log('leasingApplyPay callback::::: ', url, clientCallbackAddress);
      } else {
        url = '?refid=' + payInfo.userinvoice + '&status=false&amount=' + payInfo.total;
        console.log('leasingApplyPay callback::::: ', url, clientCallbackAddress);
      }

      res.writeHead(301, { Location: clientCallbackAddress + url });
      res.end();
    } else {
      const url = '?refid=' + payInfo.userinvoice + '&status=false&amount=' + payInfo.total;
      console.log('leasingApplyPay callback::::: ', url, clientCallbackAddress);
      res.writeHead(301, { Location: clientCallbackAddress + url });
      res.end();
    }
  }
}
