import { Injectable } from '@vision/common';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { CardService } from '../../../../Core/useraccount/card/card.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import * as Sha256 from 'sha256';
import { OrganizationChargeService } from '../../../../Core/organization/charge/organization-charge.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserCreditCoreService } from '../../../../Core/credit/usercredit/credit-core.service';
import { pinBlockFormat0 } from 'data-crypto';
import { LeasingUserCreditCoreService } from '../../../../Core/leasing-user-credit/leasing-user-credit.service';
@Injectable()
export class SwitchGetRemainService {
  constructor(
    private readonly cardService: CardService,
    private readonly commonService: PayCommonService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly userCreditService: UserCreditCoreService,
    private readonly accountService: AccountService,
    private readonly orgChargeService: OrganizationChargeService,
    private readonly creditService: LeasingUserCreditCoreService
  ) {}

  async getRemain(getInfo: SwitchRequestDto, terminalInfo): Promise<any> {
    // get Card Holder info
    const cardInfo = await this.cardService.getCardInfo(getInfo.CardNum);
    if (!cardInfo) return this.commonService.Error(getInfo, 10, cardInfo.user, ' ', ' ');
    // check Password
    const pindata = Sha256(cardInfo.pin);
    //  const pinblock = pinBlockFormat0( cardInfo.cardno, cardInfo.pin );
    //  if ( getInfo.Pin == pindata || getInfo.Pin.toUpperCase() == pinblock ) {
    if (getInfo.Pin == pindata) {
      if (!cardInfo.user) return this.giftCardRemain(getInfo, terminalInfo, cardInfo);
      //get Balance In Terminal
      const discount = await this.accountService.getBalance(cardInfo.user._id, 'discount');

      const discountBalance = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user._id);
      let discInMerchant;
      if (isEmpty(discountBalance)) {
        discInMerchant = 0;
      } else {
        if (discount.balance < discountBalance[0].amount) {
          discInMerchant = discount.balance;
        } else {
          discInMerchant = discountBalance[0].amount;
        }
      }

      // get Accounts Balance
      const wallet = await this.accountService.getBalance(cardInfo.user._id, 'wallet');
      const credit = await this.userCreditService.getCreditBalance(cardInfo.user._id);

      let myCredit = 0;
      if (!isEmpty(credit)) {
        myCredit = Math.floor(credit[0].balance);
      }

      const idm = await this.accountService.getBalance(cardInfo.user._id, 'idm');
      // set Logg In Database
      const title = 'کارمزد مانده حساب';
      const logInfo = await this.accountService.accountSetLogg(title, 'Wage', 0, true, cardInfo.user._id, null);
      let org;

      const orgBalance = await this.orgChargeService.getBalance(cardInfo.user._id);
      if (!orgBalance) {
        org = 0;
      } else {
        org = orgBalance.balance;
      }

      let leasingCredit = 0;
      const credits = await this.creditService.getUserCreditList(cardInfo.user._id, '');
      console.log('credits:::: ', credits);
      const leasingCreditAmount = await this.getLeasingRemain(credits, terminalInfo._id);
      if (leasingCreditAmount) leasingCredit = leasingCreditAmount;
      console.log('leCredits:::: ', leasingCredit);
      /*const leCredit = await this.accountService.getBalance(cardInfo.user._id, 'lecredit');
      console.log('leCredit:::: ', leCredit);
      if (leCredit) {
        leasingCredit = leCredit.balance;
      }*/

      // set Return Values
      const returnData = this.commonService.setRemain(
        getInfo,
        20,
        myCredit,
        Math.floor(discInMerchant),
        Math.floor(wallet.balance),
        idm.balance,
        org,
        0,
        leasingCredit
      );
      console.log('returnData:::: ', returnData);

      // submit Request In Database
      this.commonService
        .submitRequest(getInfo, null, null)
        .then((res2) => {
          this.commonService
            .submitMainRequest(
              cardInfo.user._id,
              cardInfo.user.ref,
              terminalInfo.merchant._id,
              terminalInfo.merchant.ref,
              terminalInfo._id,
              getInfo,
              discInMerchant,
              res2._id,
              returnData,
              null,
              logInfo._id,
              null,
              null
            )
            .catch((erro) => console.log('erro', erro));
        })
        .catch((error) => {
          console.log(error);
        });

      return returnData;
    } else {
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 12);
    }
  }

  private async giftCardRemain(getInfo: SwitchRequestDto, terminalInfo, cardInfo): Promise<any> {
    const balanceInStore = await this.balanceInStoreService.getBalanceInStoreWithCard(terminalInfo._id, cardInfo._id);
    let BIS,
      org = 0;
    if (balanceInStore.length < 1) {
      BIS = 0;
    } else {
      BIS = balanceInStore[0].amount;
    }

    const orgBalance = await this.orgChargeService.getCardBalance(cardInfo._id);
    if (!orgBalance) {
      org = 0;
    } else {
      org = orgBalance.amount;
    }
    const returnData = this.commonService.setRemain(getInfo, 20, 0, BIS, cardInfo.amount, 0, org, 0, 0);

    this.commonService
      .submitRequest(getInfo, null, null)
      .then((res2) => {
        this.commonService
          .submitMainRequest(
            null,
            null,
            terminalInfo.merchant._id,
            terminalInfo.merchant.ref,
            terminalInfo._id,
            getInfo,
            0,
            res2._id,
            returnData,
            null,
            null,
            null,
            null
          )
          .catch((erro) => console.log('erro', erro));
      })
      .catch((error) => {
        console.log(error);
      });

    return returnData;
  }

  private async getLeasingRemain(credits: any[], terminalId: string) {
    if (credits.length < 1) return 0;

    let total = 0;
    for (const item of credits) {
      const checkValidateTerminal = this.checkTerminal(item.leasingOption.terminals, terminalId);
      if (checkValidateTerminal) {
        total = total + item.amount;
      }
    }
    return total;
  }
  private checkTerminal(terminals, terminalId) {
    if (terminals.length < 1) return true;

    for (const terminal of terminals) {
      console.log(terminal.toString(), terminalId.toString());
      if (terminal.toString() == terminalId.toString()) return true;
    }

    return false;
  }
}
