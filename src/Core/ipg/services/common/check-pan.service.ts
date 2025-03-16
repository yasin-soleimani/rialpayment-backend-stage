import { Injectable, Inject } from '@vision/common';
import { AccountBlockService } from '../../../../Core/useraccount/account/services/account-block.service';
import { maskCardNumber } from '../../functions/mask-card.func';
import { nahabRequest } from '@vision/common/nahab/request';
import { UserService } from '../../../../Core/useraccount/user/user.service';

@Injectable()
export class IpgCoreCheckPanService {
  constructor(private readonly userService: UserService, private readonly accountBlockService: AccountBlockService) {}

  async validation(traxInfo, masketcardPsp): Promise<any> {
    if (!traxInfo.payload || traxInfo.payload.length != 16) {
      const title = 'عدم مطابقت کارت ثبت شده با کارت پرداختی';
      await this.accountBlockService.add(traxInfo.user, title, traxInfo.amount, 'wallet');
      return false;
    }

    const maskPan = maskCardNumber(traxInfo.payload);
    if (maskPan != masketcardPsp) {
      const title = 'عدم مطابقت کارت ثبت شده با کارت پرداختی';
      await this.accountBlockService.add(traxInfo.user, title, traxInfo.amount, 'wallet');
      return false;
    }

    const nahabReq = await nahabRequest(traxInfo.payload);
    if (nahabReq.resultCode != 0) {
      const title = 'عدم احراز هویت دارنده کارت';
      await this.accountBlockService.add(traxInfo.user, title, traxInfo.amount, 'wallet');
      return false;
    }

    const userInfo = await this.userService.getInfoByUserid(traxInfo.user);
    if (!userInfo || nahabReq.nationalCode != userInfo.nationalcode) {
      const title = 'عدم مطابقت دارنده کارت با صاحب حساب ریال پیمنت';
      await this.accountBlockService.add(traxInfo.user, title, traxInfo.amount, 'wallet');
      return false;
    }
  }
}
