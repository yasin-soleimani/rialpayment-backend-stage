import { Injectable } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { PayIpgModel } from "../../../Api/basket/vitrin/services/pay.model";
import { MipgService } from "../../../Service/mipg/mipg.service";
import { NewOrganizationSwitchService } from "../../../Switch/next-generation/services/new-organization/organization.service";
import { MerchantCoreTerminalBalanceService } from "../../merchant/services/merchant-terminal-balance.service";
import { MerchantCoreTerminalService } from "../../merchant/services/merchant-terminal.service";
import { OrganizationNewChargeCoreService } from "../../organization/new-charge/charge.service";
import { AccountService } from "../../useraccount/account/account.service";
import { InAppPurchasePaymentDto } from "../dto/paymend-details.dto";

@Injectable()
export class InAppPurchaseIpgCoreService {

  constructor(
    private readonly mipgService: MipgService,
    private readonly accountService: AccountService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly organizationChargeSWService: NewOrganizationSwitchService,
    private readonly orgChargeService: OrganizationNewChargeCoreService
  ) { }

  async getTokenIpg(getInfo: InAppPurchasePaymentDto): Promise<any> {
    return this.getTokenUserMode(getInfo);
  }

  private async getTokenUserMode(getInfo: InAppPurchasePaymentDto): Promise<any> {

    const wallet = await this.accountService.getBalance(getInfo.userId, 'wallet');
    const bis = await this.getBis(getInfo);
    const orgCharge = await this.getOrgCharge(getInfo);
    console.log(orgCharge, 'OrgCharge');
    const userTotal = wallet.balance + bis + orgCharge;
    const remain = Number(getInfo.amount) - userTotal;

    const ipgModel = PayIpgModel(
      getInfo.ipgTerminalId,
      remain,
      process.env.IN_APP_PURCHASE_CALLBACK,
      JSON.stringify(getInfo),
      'Charge-' + new Date().getTime(),
      true
    );


    const data = await this.mipgService.validateIn(ipgModel);
    if (!data.invoiceid) throw new UserCustomException('شارژ با خطا مواجه شده است');
    return data.invoiceid;
  }

  private async getBis(getInfo: InAppPurchasePaymentDto): Promise<any> {
    // [ { _id: null, amount: 200000 } ]
    const terminalInfo = await this.terminalService.getTerminalInfoByTerminalid(getInfo.terminalId);
    const bis = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, getInfo.cardInfo.user._id);
    if (bis && bis.length > 0) {
      return bis[0].amount;
    }
    return 0;
  }

  private async getOrgCharge(getInfo: InAppPurchasePaymentDto): Promise<any> {
    const pool = await this.organizationChargeSWService.checkPool(getInfo.cardInfo.user._id, Number(getInfo.amount));
    if (!pool) return 0;

    const orgWallet = await this.orgChargeService.getUserBalance(getInfo.cardInfo.user._id, pool._id);
    if (orgWallet) return orgWallet.remain;

    return 0;
  }
}