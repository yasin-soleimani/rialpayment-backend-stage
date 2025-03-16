import { Injectable } from '@vision/common';
import { isEmpty } from '../../../../../@vision/common/utils/shared.utils';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';

@Injectable()
export class SwitchLeasingTerminalBalanceService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly accountService: AccountService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService
  ) {}

  async getTerminalBalance(getInfo: SwitchRequestDto, cardInfo, terminalInfo): Promise<any> {
    return 0;

    const balanceInStore = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user._id);
    const balanceinstore = await this.getDiscount(cardInfo, balanceInStore);

    if (!balanceinstore || !balanceinstore.amount)
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    if (balanceinstore.amount < 100) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    if (Number(getInfo.TrnAmt) > balanceinstore.amount)
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);

    const bis = await this.accountService.getBalance(cardInfo.user, 'discount');
  }

  private async getDiscount(cardInfo, balanceInStore): Promise<any> {
    const discount = await this.accountService.getBalance(cardInfo.user._id, 'discount');

    let BIS = {
      amount: 0,
    };
    if (!isEmpty(balanceInStore)) {
      BIS.amount = balanceInStore[0].amount;

      if (discount.balance < 100) {
        BIS.amount = 0;
      } else if (balanceInStore[0].amount < 10) {
        BIS.amount = 0;
      } else if (balanceInStore[0].amount > 100 && discount.balance > 100) {
        if (discount.balance < Number(balanceInStore[0].amount)) {
          BIS.amount = discount.balance;
        } else if (discount.balance < 10) {
          BIS.amount = 0;
        } else if (discount.balance < BIS.amount) {
          BIS.amount = discount.balance;
        }
      } else {
        BIS = {
          amount: 0,
        };
      }
    }
    return BIS;
  }
}
