import { CreditStatusEnums, Injectable } from '@vision/common';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';
import { SwitchCreditCalcMozarebeCalcComponent } from './calc-mozarebe.component';
import { SwitchCreditCalcComponent } from './calc-credit.component';

@Injectable()
export class SwitchCommonCreditComponent {
  constructor(
    private readonly accountSevrice: AccountService,
    private readonly creditService: SwitchCreditCalcComponent,
    private readonly mozarebeService: SwitchCreditCalcMozarebeCalcComponent
  ) {}

  async selector(
    merchanttype,
    amount,
    month,
    benefit,
    freemonth,
    type,
    prepayment,
    userid,
    balanceinStore,
    terminalInfo
  ): Promise<any> {
    if (merchanttype === CreditStatusEnums.MOZAREBEH || merchanttype === CreditStatusEnums.CREDIT) {
      return this.mozarebeService.equal(
        amount,
        month,
        benefit,
        freemonth,
        merchanttype,
        prepayment,
        userid,
        balanceinStore,
        terminalInfo
      );
    } else {
      return this.creditService.equal(
        amount,
        month,
        benefit,
        freemonth,
        merchanttype,
        prepayment,
        userid,
        balanceinStore,
        terminalInfo
      );
    }
  }
}
