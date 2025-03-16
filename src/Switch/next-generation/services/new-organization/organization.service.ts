import { Injectable } from '@vision/common';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { NewOrganizationSwitchGiftCardService } from './services/gift-card.service';
import { NewOrganizationSwitchUserCardService } from './services/user-card.service';
import { OrganizationPoolCoreService } from '../../../../Core/organization/pool/pool.service';
import { NewOrganizationSwitchCommonService } from './services/common.service';
import { OrganizationNewChargeCoreService } from '../../../../Core/organization/new-charge/charge.service';
import { UserService } from '../../../../Core/useraccount/user/user.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { isEmpty } from '@vision/common/utils/shared.utils';

@Injectable()
export class NewOrganizationSwitchService {
  constructor(
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly giftCardService: NewOrganizationSwitchGiftCardService,
    private readonly commonService: PayCommonService,
    private readonly userService: UserService,
    private readonly poolService: OrganizationPoolCoreService,
    private readonly orgCommonService: NewOrganizationSwitchCommonService,
    private readonly orgChargeService: OrganizationNewChargeCoreService,
    private readonly userSwitchService: NewOrganizationSwitchUserCardService,
    private readonly accountService: AccountService
  ) {}

  async newPayment(getInfo: SwitchRequestDto, cardInfo, terminalInfo, discountInfo): Promise<any> {
    const pool = await this.checkPool(cardInfo.user._id, Number(getInfo.TrnAmt));
    if (!pool) return this.commonService.Error(getInfo, 1, null, null, null);
    if (!cardInfo.user) {
      return this.giftCardService.payment(getInfo, cardInfo, terminalInfo, discountInfo);
    }

    const balanceInStore = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user._id);
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

    switch (true) {
      case Number(getInfo.TrnAmt) <= BIS.amount: {
        return this.userSwitchService.fromBalance(getInfo, cardInfo, terminalInfo, BIS);
      }

      default: {
        return this.Payment(getInfo, cardInfo, terminalInfo, BIS, discountInfo, pool);
      }
    }
  }

  private async Payment(
    getInfo: SwitchRequestDto,
    cardInfo,
    terminalInfo,
    balanceInStore,
    discountInfo,
    pool
  ): Promise<any> {
    const orgWallet = await this.orgChargeService.getUserBalance(cardInfo.user._id, pool._id);
    let orgBalance = 0;
    if (orgWallet) orgBalance = orgWallet.remain;

    switch (true) {
      case Number(getInfo.TrnAmt) <= orgBalance: {
        return this.userSwitchService.fromOrgCharge(getInfo, cardInfo, terminalInfo, discountInfo, pool);
      }

      case balanceInStore.amount == 0: {
        return this.userSwitchService.fromTwice(getInfo, cardInfo, terminalInfo, discountInfo, pool);
      }

      case balanceInStore.amount > 0: {
        return this.userSwitchService.fromThird(getInfo, cardInfo, terminalInfo, balanceInStore, discountInfo, pool);
      }

      default: {
        return this.userSwitchService.fromTwice(getInfo, cardInfo, terminalInfo, discountInfo, pool);
      }
    }
  }

  async checkPool(userid: string, amount: number): Promise<any> {
    const poolInfo = await this.orgCommonService.checkPoolByUserId(userid, amount);
    if (!poolInfo) return false;
    return poolInfo;
  }
}
