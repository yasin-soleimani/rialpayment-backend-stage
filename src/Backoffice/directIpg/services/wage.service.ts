import { Injectable, InternalServerErrorException } from '@vision/common';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';

@Injectable()
export class DirectIpgWageService {
  constructor(private readonly accountService: AccountService, private readonly ipgService: IpgCoreService) {}

  async calcWage(traxInfo, terminalInfo) {
    if (!traxInfo.wagetype) throw new InternalServerErrorException();

    switch (traxInfo.wagetype) {
      case 1: {
        this.chargeWallet(traxInfo, terminalInfo);
        break;
      }
      case 2: {
        this.dechargeWallet(traxInfo, terminalInfo);
        break;
      }
      case 3: {
        this.dechargeWallet(traxInfo, terminalInfo);
        break;
      }
    }
  }

  async chargeWallet(traxInfo, terminalInfo): Promise<any> {
    if (traxInfo.discount > 0) {
      const wage = Math.round((65 * traxInfo.discount) / 100);
      const merchantWage = traxInfo.discount - wage;
      await this.accountService.chargeAccount(terminalInfo.ref, 'wallet', merchantWage);
      const title = ' کارمزد ثبت فروشگاه اینترنتی ' + terminalInfo.title;
      await this.accountService.accountSetLoggWithRef(
        title,
        traxInfo.userinvoice,
        merchantWage,
        true,
        null,
        terminalInfo.ref
      );
    }

    await this.ipgService.confirmTrax(traxInfo.terminalid, traxInfo.invoiceid);
    await this.accountService.chargeAccount(terminalInfo.user, 'wallet', traxInfo.amount);
    const title = ' خرید از فروشگاه اینترنتی با شماره کارت ' + traxInfo.details.cardnumber;
    await this.accountService.accountSetLoggWithRef(
      title,
      traxInfo.userinvoice,
      traxInfo.amount,
      true,
      null,
      terminalInfo.user
    );
  }

  async dechargeWallet(traxInfo, terminalInfo): Promise<any> {
    if (traxInfo.discount > 0) {
      const wage = Math.round((65 * traxInfo.discount) / 100);
      const merchantWage = traxInfo.discount - wage;
      await this.accountService.chargeAccount(terminalInfo.ref, 'wallet', merchantWage);
      const title = ' کارمزد ثبت فروشگاه اینترنتی ' + terminalInfo.title;
      await this.accountService.accountSetLoggWithRef(
        title,
        traxInfo.userinvoice,
        merchantWage,
        true,
        null,
        terminalInfo.ref
      );
    }

    await this.ipgService.confirmTrax(traxInfo.terminalid, traxInfo.invoiceid);
    await this.accountService.dechargeAccount(terminalInfo.user, 'wallet', traxInfo.discount);
    const title = ' خرید از فروشگاه اینترنتی با شماره کارت ' + traxInfo.details.cardnumber;
    await this.accountService.accountSetLoggWithRef(
      title,
      traxInfo.userinvoice,
      traxInfo.amount,
      true,
      null,
      terminalInfo.user
    );
    const titlex = 'کسر کارمزد خرید از فروشگاه اینترنتی با شماره کارت ' + traxInfo.details.cardnumber;
    await this.accountService.accountSetLoggWithRef(
      titlex,
      traxInfo.userinvoice,
      traxInfo.discount,
      true,
      terminalInfo.user,
      null
    );
  }
}
