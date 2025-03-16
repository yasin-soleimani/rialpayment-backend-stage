import { Injectable } from '@vision/common';
import { AccountService } from '../useraccount/account/account.service';
import { MerchantcoreService } from '../merchant/merchantcore.service';
import { discountCalc } from '@vision/common/utils/discount';
import { PayCommonService } from './services/pay-common.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as Sha256 from 'sha256';
import { MerchantCoreTerminalBalanceService } from '../merchant/services/merchant-terminal-balance.service';

@Injectable()
export class PayActionService {
  constructor(
    private readonly accountService: AccountService,
    private readonly merchantService: MerchantcoreService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly commonService: PayCommonService
  ) {}

  async Buy(getInfo, cardInfo, merchantInfo): Promise<any> {
    const checkBalance = await this.commonService.checkMoney(getInfo.TrnAmt, cardInfo.user);
    if (!checkBalance) return this.commonService.Error(getInfo, 11, cardInfo.user);

    let securitypin = cardInfo.secpin;
    if (isEmpty(cardInfo.secpin)) {
      securitypin = 0;
    }

    const pindata = Sha256(cardInfo.pin);
    if (getInfo.Pin !== pindata) return this.commonService.Error(getInfo, 12, cardInfo.user);

    if (!this.commonService.checkPan(cardInfo.cardno, getInfo.Track2, securitypin))
      return this.commonService.Error(getInfo, 4, cardInfo.user);
    const storeInBalance = await this.balanceInStoreService.getBalanceInStore(merchantInfo._id, cardInfo.user);
    getInfo.storeinbalance = 0;

    if (storeInBalance && storeInBalance.amount > 0) {
      getInfo.storeinbalance = storeInBalance.amount;
      if (storeInBalance.amount >= getInfo.TrnAmt) {
        const data = [
          { title: 'کسر از اعتبار در فروشگاه', amount: getInfo.TrnAmt.toLocaleString() },
          { title: 'امتیاز از این خرید', amount: 0 },
        ];

        this.balanceInStoreService.dechargeStoreInBalnce(merchantInfo._id, cardInfo.user, getInfo.TrnAmt);
        // this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
        return this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
      } else {
        const payedFromBalanceInStore = getInfo.TrnAmt - storeInBalance.amount;
        const value = discountCalc(payedFromBalanceInStore, merchantInfo.discnonebank, merchantInfo.discbank);
        const data = [
          { title: 'کسر از اعتبار در فروشگاه', amount: storeInBalance.amount.toLocaleString() },
          {
            title: 'تخفیف نقدی',
            amount: value.bankdisc.toLocaleString(),
          },
          {
            title: 'تخفیف اعتباری',
            amount: value.nonebank.toLocaleString(),
          },
          {
            title: 'امتیاز از این خرید',
            amount: 0,
          },
        ];
        this.balanceInStoreService
          .dechargeStoreInBalnce(merchantInfo._id, cardInfo.user, storeInBalance.amount)
          .then((value) => {
            console.log(value);
          });
        this.accountService.dechargeAccount(cardInfo.user, 'wallet', payedFromBalanceInStore).then((value) => {
          console.log(value);
        });

        // this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
        return this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
      }
    } else {
      const value = discountCalc(getInfo.TrnAmt, merchantInfo.discnonebank, merchantInfo.discbank);

      this.accountService.dechargeAccount(cardInfo.user, 'wallet', getInfo.TrnAmt);

      const data = [
        { title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() },
        {
          title: 'تخفیف اعتباری',
          amount: value.nonebank.toLocaleString(),
        },
        { title: 'امتیاز از این خرید', amount: 0 },
      ];

      // this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
      return this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
    }
  }
}
