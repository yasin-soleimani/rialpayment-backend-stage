import { Injectable, CreditStatusEnums } from '@vision/common';
import { SwitchRequestDto } from '../../../dto/SwitchRequestDto';
import { discountCalc } from '@vision/common/utils/discount';
import { PayCommonService } from '../../../../../Core/pay/services/pay-common.service';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';

@Injectable()
export class InWalletOrganStrategySwitchService {
  constructor(private readonly commonService: PayCommonService, private readonly accountService: AccountService) {}

  async buy(stMode, terminalInfo, cardInfo, getInfo: SwitchRequestDto): Promise<any> {
    const walletBalance = await this.accountService.getBalance(cardInfo.user._id, 'wallet');

    if (walletBalance.balance < getInfo.TrnAmt) return this.commonService.Error(getInfo, 11, cardInfo.user._id);
    let data = Array();

    const cusWage = Math.round((stMode.customercharge * getInfo.TrnAmt) / 100);
    const discount = getInfo.TrnAmt - cusWage;

    data.push({ title: ' کسر از اعتبار سازمانی ', amount: cusWage });
    data.push({ title: 'کسر از کیف پول', amount: discount });

    this.accountService.dechargeAccount(cardInfo.user._id, 'wallet', discount);
    const logInfo = await this.accountService.accountSetLogg(
      ' خرید سازمانی',
      'OrgPay',
      getInfo.TrnAmt,
      true,
      cardInfo.user._id,
      terminalInfo.merchant.user
    );
    const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);

    this.commonService
      .submitOrganRequest(
        cardInfo.user._id,
        stMode._id,
        terminalInfo._id,
        getInfo.TrnAmt,
        getInfo.TrnAmt,
        0,
        0,
        stMode.user
      )
      .then((res) => {
        this.commonService.submitRequest(getInfo, data, null).then((res2) => {
          this.commonService.submitMainRequest(
            cardInfo.user,
            cardInfo.user.ref,
            terminalInfo.merchant,
            terminalInfo.merchant.ref,
            terminalInfo._id,
            getInfo,
            0,
            res2._id,
            returnData,
            CreditStatusEnums.SHETAB,
            logInfo._id,
            null,
            res._id
          );
        });
      });

    return returnData;
  }
}
