import { Injectable } from '../../../../../@vision/common';
import { terminalSelector } from '../../../../../@vision/common/utils/terminal-type-selector.util';
import { LeasingUserCreditCoreService } from '../../../../Core/leasing-user-credit/leasing-user-credit.service';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { TurnoverBalanceCoreService } from '../../../../Core/turnover/services/balance.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { CreditLeasingStatusEnums } from './const/credit.enum';
import { SwitchLeasingTerminalBalanceService } from './terminal-balance.service';

@Injectable()
export class SwitchLeasingService {
  constructor(
    private readonly terminalBalanceService: SwitchLeasingTerminalBalanceService,
    private readonly creditService: LeasingUserCreditCoreService,
    private readonly accountService: AccountService,
    private readonly turnOverService: TurnoverBalanceCoreService,
    private readonly loggerService: LoggercoreService,
    private readonly commonService: PayCommonService
  ) {}

  async payment(getInfo: SwitchRequestDto, cardInfo, terminalInfo): Promise<any> {
    const resultData = {
      terminalBalance: 0,
      organization: 0,
      credit: 0,
      wallet: 0,
      amount: getInfo.TrnAmt,
      remain: getInfo.TrnAmt,
    };

    const terminalBalance = await this.terminalBalanceService.getTerminalBalance(getInfo, cardInfo, terminalInfo);

    const creditBalance = await this.getBalance(cardInfo.user._id, terminalInfo);
    const wallet = await this.accountService.getBalance(cardInfo.user._id, 'wallet');

    if (creditBalance < 10) return null;
    if (creditBalance + terminalBalance + wallet.balance < Number(getInfo.TrnAmt)) return null;
    const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
    const termType = terminalSelector(getInfo.termType);
    const logInfo = await this.loggerService.submitNewLogg(
      title,
      termType,
      getInfo.TrnAmt,
      true,
      cardInfo.user._id,
      null
    );
    const resultDecrease = await this.deCrease(Number(getInfo.TrnAmt), getInfo, cardInfo, terminalInfo, [], logInfo);

    const returnData = this.commonService.setDataCloseLoop(getInfo, resultDecrease.data, null, null, 20);
    await this.commonService
      .submitDiscountRequest(0, 0, 0, 0, 0, 0, resultDecrease.wallet, 0, 0, [], resultDecrease.leCredits)
      .then(async (res) => {
        await this.commonService.submitRequest(getInfo, resultDecrease.data, null).then(async (res2) => {
          await this.commonService.submitMainRequest(
            cardInfo.user,
            cardInfo.user.ref,
            terminalInfo.merchant._id,
            terminalInfo.merchant.ref,
            terminalInfo._id,
            getInfo,
            terminalBalance,
            res2._id,
            returnData,
            CreditLeasingStatusEnums.Leasing,
            logInfo._id,
            null,
            res._id
          );
        });
      });

    return returnData;
  }

  private async getBalance(userId: string, terminalInfo: any): Promise<any> {
    const credits = await this.creditService.getUserCreditList(userId, '');
    if (credits.length < 1) return 0;

    let total = 0;
    for (const item of credits) {
      const checkValidateTerminal = this.checkTerminal(item.leasingOption.terminals, terminalInfo._id);
      if (checkValidateTerminal) {
        total = total + item.amount;
      }
    }

    return total;
  }

  private async deCrease(amount, getInfo, cardInfo, terminalInfo, data: any, logInfo): Promise<any> {
    const credits = await this.creditService.getUserCreditList(cardInfo.user._id, 'block: false, amount: { $gt: 100 }');
    let Remain = Number(amount);
    let Amount = Number(amount);
    const leCredits = Array();
    for (const item of credits) {
      const checkValidateTerminal = this.checkTerminal(item.leasingOption.terminals, terminalInfo._id);
      if (checkValidateTerminal) {
        if (Remain > 0) {
          if (item.amount >= Remain) {
            Amount = amount;
            Remain = 0;
          } else {
            Amount = item.amount;
            Remain = Remain - item.amount;
          }
          const title = 'برداشت از اعتبار لیزینگ در فروشگاه ' + terminalInfo.title;
          this.turnOverService.deChargeUserLecredit(
            'lecredit',
            cardInfo.user._id,
            Amount,
            logInfo.ref,
            title,
            item.leasingUser,
            item.leasingApply
          );
          leCredits.push({
            leasingUserCredit: item._id,
            amount: Amount,
          });
          this.creditService.decreaseUserCreditsById(item._id, Amount);
          this.accountService.dechargeAccount(cardInfo.user._id, 'lecredit', Amount);
        }
      }
    }
    if (Remain < 1) {
      data.push({
        title: 'اعتبار لیزینگ',
        amount: amount,
      });
    } else {
      data.push({
        title: 'اعتبار لیزینگ',
        amount: amount - Remain,
      });
      data.push({
        title: 'کیف پول',
        amount: Remain,
      });
    }

    this.accountService.dechargeAccount(cardInfo.user._id, 'wallet', Remain);
    return {
      data,
      leCredits,
      wallet: Remain,
    };
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
