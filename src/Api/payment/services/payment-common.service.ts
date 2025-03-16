import { Injectable } from '@vision/common';
import { CardService } from '../../../Core/useraccount/card/card.service';
import * as sha256 from 'sha256';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PaymentDto } from '../dto/payment.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { VoucherCoreService } from '../../../Core/voucher/voucher.service';
require('node-go-require');

@Injectable()
export class PaymentCommonService {
  constructor(
    private readonly cardService: CardService,
    private readonly userService: UserService,
    private readonly accountSerivce: AccountService,
    private readonly voucherService: VoucherCoreService
  ) {}

  async checkPin(userid, pin): Promise<any> {
    const cardInfo = await this.cardService.getCardByUserID(userid);
    if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);
    const cardPin = sha256(cardInfo.pin);
    if (cardPin != pin) throw new UserCustomException('رمز کارت اشتباه ', false, 500);
    return cardInfo;
  }

  async checkTransfer(getInfo: PaymentDto): Promise<any> {
    if (isEmpty(getInfo.payid) || isEmpty(getInfo.amount)) throw new FillFieldsException();
  }

  async getUserInfoByPayID(payid): Promise<any> {
    const info = await this.userService.getInfoByAccountNo(payid);
    if (!info) throw new UserNotfoundException();
    return info;
  }

  async getUserByUserID(userid): Promise<any> {
    const info = await this.userService.findByUseridAll(userid);
    if (!info) throw new UserNotfoundException();
    return info;
  }

  async checkBalance(user, amount): Promise<any> {
    const wallet = this.getWallet(user);
    if (user.accounts[wallet].balance < amount) throw new notEnoughMoneyException();
  }

  private getWallet(user: any) {
    for (const index in user.accounts) {
      if (user.accounts[index].type === 'wallet') {
        return index;
      }
    }
  }
}
