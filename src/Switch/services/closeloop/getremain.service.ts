import { Injectable } from '@vision/common';
import { NewSwitchDto } from '../../dto/new-switch.dto';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { PayCommonService } from '../../../Core/pay/services/pay-common.service';
import * as Sha256 from 'sha256';
import { MerchantcoreService } from '../../../Core/merchant/merchantcore.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import { MerchantCoreTerminalBalanceService } from '../../../Core/merchant/services/merchant-terminal-balance.service';

@Injectable()
export class GetRemainService {
  constructor(
    private readonly cardService: CardService,
    private readonly commonService: PayCommonService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService
  ) {}

  async getRemain(getInfo: NewSwitchDto, terminalInfo): Promise<any> {
    // get Card Holder info
    const cardInfo = await this.cardService.getCardInfo(getInfo.CardNum);
    if (!cardInfo) return this.commonService.Error(getInfo, 10, cardInfo.user, ' ', ' ');

    // check Password
    const pindata = Sha256(cardInfo.pin);
    if (getInfo.Pin === pindata) {
      //get Balance In Terminal
      const discountBalance = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user);
      let discInMerchant;
      if (!discountBalance) {
        discInMerchant = 0;
      } else {
        discInMerchant = discountBalance.amount;
      }

      // get Accounts Balance
      const wallet = await this.accountService.getBalance(cardInfo.user, 'wallet');
      const credit = await this.accountService.getBalance(cardInfo.user, 'credit');
      const idm = await this.accountService.getBalance(cardInfo.user, 'credit');

      // set Logg In Database
      const logInfo = await this.loggerService.submitNewLogg(
        'کارمزد مانده',
        'Wage',
        1000,
        true,
        cardInfo.user._id,
        cardInfo.user._id
      );

      // set Return Values
      const returnData = this.commonService.setRemain(
        getInfo,
        20,
        credit.balance,
        discInMerchant,
        wallet.balance,
        idm.balance,
        0,
        0
      );

      // submit Request In Database
      this.commonService
        .submitRequest(getInfo, null, null)
        .then((res2) => {
          this.commonService
            .submitMainRequest(
              cardInfo.user,
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
    }
  }
}
