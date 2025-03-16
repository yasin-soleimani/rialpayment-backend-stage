import { CreditStatusEnums, faildOpt, Injectable, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';
import { PspverifyCoreService } from '../../../../../Core/psp/pspverify/pspverifyCore.service';
import { todayRange } from '@vision/common/utils/month-diff.util';
import { PayCommonService } from '../../../../../Core/pay/services/pay-common.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { SwitchService } from '../../../switch.service';
import { CardService } from '../../../../../Core/useraccount/card/card.service';
import { SwitchModel } from '../model/switch.model';
import * as sha256 from 'sha256';
import { TerminalType } from '@vision/common/enums/terminalType.enum';
import { UserService } from '../../../../../Core/useraccount/user/user.service';

@Injectable()
export class SwitchMobileGateService {
  constructor(
    private readonly accountService: AccountService,
    private readonly pspVerify: PspverifyCoreService,
    private readonly commonService: PayCommonService,
    private readonly switchMainService: SwitchService,
    private readonly cardService: CardService,
    private readonly userService: UserService
  ) {}

  async buy(terminalInfo, userInfo, amount?): Promise<any> {
    const Range = todayRange();
    if (terminalInfo.terminal.strategy[0].from == 0) {
      return this.newTrax(terminalInfo, userInfo);
    }
    const traxInfo = await this.pspVerify.findTraxByUserInfo(
      terminalInfo.terminal.merchant._id,
      userInfo.id,
      Range.start,
      Range.end,
      false
    );

    if (!traxInfo) return this.newTrax(terminalInfo, userInfo);
    return this.cashback(terminalInfo, userInfo, traxInfo);
  }

  // private async action(): Promise<any> {
  //   const data = await this.switchMainService.action()
  // }

  private async formater(terminalInfo, userInfo, amount, CommandID, traxid, rcdate): Promise<any> {
    const cardInfo = await this.cardService.getCardByUserID(userInfo._id);
    let model = new SwitchModel();
    model.TraxID = traxid;
    model.setCardNum = cardInfo.cardno;
    model.setCommandID = CommandID;
    model.setMerchant = terminalInfo.terminal.merchant.merchantcode;
    model.setPin = sha256(cardInfo.pin);
    model.setTermType = TerminalType.Mobile;
    model.setTermID = terminalInfo.terminal.terminalid;
    model.setTrack2 = cardInfo.cardno + '=' + cardInfo.secpin;
    model.setTrnAmt = amount;
    model.setReceiveDT = rcdate;
    return model;
  }

  // start payment new Transaction
  private async newTrax(terminalInfo, userInfo): Promise<any> {
    const amount = terminalInfo.terminal.strategy[0].to;
    const traxid = Math.round(new Date().getTime());
    const rcDate = new Date().getUTCDate();
    const info = await this.formater(terminalInfo, userInfo, amount, 104, traxid, rcDate);
    const datax = await this.switchMainService
      .action(info)
      .then((res) => {
        console.log(res, 'res');
        return res;
      })
      .catch((err) => {
        console.log(err, 'err');
      });
    if (datax.rsCode == 20) {
      const info = await this.formater(terminalInfo, userInfo, amount, 106, datax.TraxID, rcDate);
      await this.commonService.submitMainRequest(
        userInfo._id,
        null,
        null,
        terminalInfo.terminal.merchant._id,
        terminalInfo.terminal._id,
        { TraxID: traxid },
        0,
        null,
        null,
        CreditStatusEnums.STORE_IN_BALANCE,
        null,
        null,
        null
      );
      const nike = await this.switchMainService.action(info);
      return successOpt();
    }
    return faildOpt();
  }

  // cashback
  private async cashback(terminalInfo, userInfo, traxInfo): Promise<any> {
    const amount = terminalInfo.terminal.strategy[0].from;
    console.log(terminalInfo.terminal.strategy);
    const merchantBalance = await this.accountService.getBalance(terminalInfo.terminal.merchant.user, 'wallet');
    if (merchantBalance.balance < amount) throw new notEnoughMoneyException();
    this.accountService.dechargeAccount(terminalInfo.terminal.merchant.user, 'wallet', amount);
    this.accountService.chargeAccount(userInfo._id, 'wallet', amount);
    const title = 'برگشت مبلغ در' + terminalInfo.terminal.title;
    const logInfo = await this.accountService.accountSetLogg(
      title,
      'PayMobile',
      amount,
      true,
      terminalInfo.terminal.merchant.user,
      userInfo._id
    );
    this.pspVerify.confirmById(traxInfo._id);
    return successOptWithDataNoValidation(logInfo.ref);
  }
}
