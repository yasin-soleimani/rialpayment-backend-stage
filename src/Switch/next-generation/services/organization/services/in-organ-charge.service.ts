import { Injectable, CreditStatusEnums } from '@vision/common';
import { PayCommonService } from '../../../../../Core/pay/services/pay-common.service';
import { SwitchRequestDto } from '../../../dto/SwitchRequestDto';
import { OrganizationChargeService } from '../../../../../Core/organization/charge/organization-charge.service';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';

@Injectable()
export class InOrganizationChargeSwitchService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly orgChargeService: OrganizationChargeService,
    private readonly accountService: AccountService
  ) {}

  async buy(stMode, terminalInfo, cardInfo, getInfo: SwitchRequestDto): Promise<any> {
    let data = Array();
    const balance = await this.orgChargeService.getBalance(cardInfo.user._id);
    if (balance.amount < getInfo.TrnAmt) return this.commonService.Error(getInfo, 11, cardInfo.user._id);

    data.push({ title: ' کسر از اعتبار سازمانی ', amount: getInfo.TrnAmt });

    this.orgChargeService.decharge(cardInfo.user._id, getInfo.TrnAmt);
    this.accountService.dechargeAccount(cardInfo.user._id, 'org', getInfo.TrnAmt);
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
        0,
        0,
        getInfo.TrnAmt,
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
