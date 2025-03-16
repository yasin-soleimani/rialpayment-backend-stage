import { Injectable } from '@vision/common';
import { SwitchRequestDto } from '../dto/SwitchRequestDto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { PayCommonService } from '../../../Core/pay/services/pay-common.service';
import { SwitchCommonService } from './common/common.service';
import { switchPay } from '@vision/common/utils/PaySwitch';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { CardmanagementcoreService } from '../../../Core/cardmanagement/cardmanagementcore.service';
import { MerchantCoreTerminalService } from '../../../Core/merchant/services/merchant-terminal.service';
import { SwitchDiscountService } from './discount/discount.service';
import * as Sha256 from 'sha256';
import { SwitchCreditService } from './credit/credit.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { SwitchMainConfirmService } from './confirm/main-confirm.service';
import { OrganizationStrategyService } from '../../../Core/organization/startegy/organization-strategy.service';
import { GroupCoreService } from '../../../Core/group/group.service';
import { OrganizationSwitchService } from './organization/organization.service';
import { UserCreditCoreService } from '../../../Core/credit/usercredit/credit-core.service';
import { SwitchNewCreditService } from './credit/new-credit.service';
import { pinBlockFormat0 } from 'data-crypto';
import { NewOrganizationSwitchService } from './new-organization/organization.service';
import { SwitchLeasingService } from './leasing/leasing.service';

@Injectable()
export class SwitchMainService {
  constructor(
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly commonService: PayCommonService,
    private readonly switchCommonService: SwitchCommonService,
    private readonly cardService: CardService,
    private readonly shetabCardService: CardmanagementcoreService,
    private readonly discountService: SwitchDiscountService,
    private readonly creditService: SwitchCreditService,
    private readonly accountService: AccountService,
    private readonly confirmService: SwitchMainConfirmService,
    private readonly organService: OrganizationStrategyService,
    private readonly userCreditService: UserCreditCoreService,
    private readonly groupService: GroupCoreService,
    private readonly organSwitchService: OrganizationSwitchService,
    private readonly newSwirchCredit: SwitchNewCreditService,
    private readonly newOrgService: NewOrganizationSwitchService,
    private readonly leCreditService: SwitchLeasingService
  ) { }

  async opt(getInfo: SwitchRequestDto): Promise<any> {
    if (Number(getInfo.TrnAmt) < 1000) return this.commonService.Error(getInfo, 1, null, null, null);

    // check Merchant & Terminal
    const terminalInfo = await this.terminalService.findMerchantByTerminalId(getInfo.TermID);

    if (!terminalInfo.status || !terminalInfo.merchant.status) return this.commonService.Error(getInfo, 1, null, null, null);
    if (!terminalInfo) return this.commonService.Error(getInfo, 1, null, null, null);
    if (terminalInfo.merchant.merchantcode != getInfo.Merchant) return this.commonService.Error(getInfo, 1, null, null, null);
    return this.cardType(getInfo, terminalInfo);
  }

  async cardType(getInfo: SwitchRequestDto, terminalInfo: any): Promise<any> {
    const cardType = switchPay(getInfo.CardNum);
    switch (cardType) {
      case 'shetab': {
        return this.shetabPayment(getInfo, terminalInfo);
      }
      case 'closeloop': {
        return this.closeloopPayment(getInfo, terminalInfo);
      }
    }
  }

  // Payment Shetab
  async shetabPayment(getInfo: SwitchRequestDto, terminalInfo: any): Promise<any> {
    const cardInfo = await this.shetabCardService.getCardInfo(getInfo.CardNum);
    if (!cardInfo) return this.commonService.Error(getInfo, 1, null, null, null);
    const discountInfo = await this.switchCommonService.selectStrategy(
      cardInfo.user._id,
      terminalInfo._id,
      getInfo.TrnAmt
    );
    return this.discountService.newPayment('shetab', getInfo, cardInfo, terminalInfo, discountInfo);
  }

  // Payment Closeloop
  async closeloopPayment(getInfo: SwitchRequestDto, terminalInfo: any): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(getInfo.CardNum);
    if (!cardInfo) return this.commonService.Error(getInfo, 1, null, null, null);
    const pinblock = pinBlockFormat0(cardInfo.cardno.toString(), cardInfo.pin);
    let userCardHolderId = null;
    if (cardInfo.user) {
      userCardHolderId = cardInfo.user._id;
    }
    if (!cardInfo.pin) return this.commonService.Error(getInfo, 1, null, null, null);
    const pindata = Sha256(cardInfo.pin);
    if (getInfo.Pin !== pindata || getInfo.Pin.toUpperCase() == pinblock) {
      return this.commonService.Error(getInfo, 12, userCardHolderId);
    }

    if (!cardInfo.user) {
      const discountInfo = await this.switchCommonService.selectStrategy(
        userCardHolderId,
        terminalInfo._id,
        getInfo.TrnAmt
      );
      return this.discountService.newPayment('closeloop', getInfo, cardInfo, terminalInfo, discountInfo);
    }

    if (cardInfo.user.block == true) return this.commonService.Error(getInfo, 1, null, null, null);

    const leCredit = await this.accountService.getBalance(cardInfo.user._id, 'lecredit');
    if (leCredit && leCredit.balance > 10) {
      const resultLeCredit = await this.leCreditService.payment(getInfo, cardInfo, terminalInfo);
      if (resultLeCredit) return resultLeCredit;
    }
    const discountInfo = await this.switchCommonService.selectStrategy(
      cardInfo.user._id,
      terminalInfo._id,
      getInfo.TrnAmt
    );

    const stMode = await this.checkOrganization(cardInfo, getInfo.TrnAmt);
    if (stMode) {
      // return this.organSwitchService.buy(stMode, cardInfo, terminalInfo, getInfo);
      return this.newOrgService.newPayment(getInfo, cardInfo, terminalInfo, discountInfo);
    }

    const checkCredit = await this.userCreditService.getCreditBalance(cardInfo.user._id);
    if (
      !isEmpty(checkCredit) &&
      checkCredit[0].balance > 0 &&
      terminalInfo.iscredit === true &&
      getInfo.TrnAmt > 5000000
    ) {
      const reData = await this.newSwirchCredit.Payment(getInfo, cardInfo, terminalInfo);
      if (reData !== false) return reData;
    }
    return this.discountService.newPayment('closeloop', getInfo, cardInfo, terminalInfo, discountInfo);
  }

  // getRemain
  async getRemain(getInfo: SwitchRequestDto): Promise<any> {
    const terminalInfo = await this.terminalService.findMerchantByTerminalId(getInfo.TermID);
    if (!terminalInfo) return this.commonService.Error(getInfo, 1, null, null, null);
    return this.switchCommonService.getRemain(getInfo, terminalInfo);
  }

  async confirm(getInfo: SwitchRequestDto): Promise<any> {
    return this.confirmService.setConfirm(getInfo);
  }

  // async checkOrganization( terminalInfo, cardInfo, getInfo: SwitchRequestDto ): Promise<any> {
  //   let terminal = Array();
  //   let group =Array();
  //   terminal.push(terminalInfo._id);
  //   const groupData = await this.groupService.getUserGroups( cardInfo.user._id );
  //   if ( isEmpty(groupData) ) return null;
  //   // check groupData !!!!!!
  //   for( let i = 0; groupData.length > i; i++ ) {
  //     group.push( groupData[i].group );
  //   }
  // return this.organService.getOrganStrategy(group, terminal);
  // }

  async checkOrganization(cardInfo: any, amount: number): Promise<any> {
    // const orgWallet = await this.accountService.getBalance(cardInfo.user._id, 'org');
    // if (orgWallet.balance < amount) return false;

    const orgWallet = await this.accountService.getBalance(cardInfo.user._id, 'org');
    if (!orgWallet) return false;
    if (orgWallet.balance > 1000) return true;
    return false;
  }
}
