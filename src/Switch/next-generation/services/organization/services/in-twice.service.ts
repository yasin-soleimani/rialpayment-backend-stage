import { Injectable, CreditStatusEnums } from '@vision/common';
import { SwitchRequestDto } from '../../../dto/SwitchRequestDto';
import { PayCommonService } from '../../../../../Core/pay/services/pay-common.service';
import { OrganizationChargeService } from '../../../../../Core/organization/charge/organization-charge.service';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';

@Injectable()
export class InTwoWayOrganizationSwitchService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly organChargeService: OrganizationChargeService,
    private readonly accountService: AccountService
  ) {}

  async buy(stMode, terminalInfo, cardInfo, getInfo: SwitchRequestDto): Promise<any> {
    let data = Array();

    const orgBalance = await this.organChargeService.getBalance(cardInfo.user._id);

    const mod = getInfo.TrnAmt - orgBalance.amount;

    const cusWage = Math.round((stMode.customercharge * mod) / 100);
    const discount = mod - cusWage;

    const walletBalance = await this.accountService.getBalance(cardInfo.user._id, 'wallet');

    if (walletBalance.balance < discount) return this.commonService.Error(getInfo, 11, cardInfo.user._id);
    this.accountService.dechargeAccount(cardInfo.user._id, 'wallet', discount);
    this.organChargeService.decharge(cardInfo.user._id, orgBalance.amount);
    this.accountService.dechargeAccount(cardInfo.user._id, 'org', orgBalance.amount);

    data.push({ title: ' کسر از شارژ اعتبار سازمانی ', amount: orgBalance.amount });
    data.push({ title: ' کسر از اعتبار سازمانی ', amount: cusWage });
    data.push({ title: 'کسر از کیف پول', amount: discount });
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
        discount,
        cusWage,
        orgBalance.amount,
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
