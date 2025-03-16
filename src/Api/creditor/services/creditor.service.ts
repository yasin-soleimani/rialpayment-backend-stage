import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { AnalyzeCardCoreService } from '../../../Core/analyze/card/services/analyze-card.service';
import { CreditorSubjectCoreService } from '../../../Core/creditor/services/creditor-subject.service';
import { CreditorCoreService } from '../../../Core/creditor/services/creditor.service';
import { PspVrifyRequestCoreService } from '../../../Core/psp/pspverify/services/request.service';
import { CreditorApiOutput, CreditorApiCalcPercent } from '../function/output.func';
import { CreditorTypeConst } from '../../../Core/creditor/const/creditor-type.const';
import { CardChargeHistoryCoreService } from '../../../Core/useraccount/card/services/card-history.service';
import { MerchantcoreService } from '../../../Core/merchant/merchantcore.service';
import { PspverifyCoreService } from '../../../Core/psp/pspverify/pspverifyCore.service';
import { Types } from 'mongoose';

@Injectable()
export class CreditorApiService {
  constructor(
    private readonly subjectService: CreditorSubjectCoreService,
    private readonly creditorService: CreditorCoreService,
    private readonly analyzeCardService: AnalyzeCardCoreService,
    private readonly pspVerifyService: PspVrifyRequestCoreService,
    private readonly pspVerifyCoreService: PspverifyCoreService,
    private readonly cardChargeService: CardChargeHistoryCoreService,
    private readonly merchantService: MerchantcoreService
  ) {}

  async getInfo(subjectid: string, userid: string): Promise<any> {
    const data = await this.subjectService.getInfoById(subjectid);

    // const cards = await this.analyzeCardService.getCalcTotal(data.group[0]._id);

    // return this.cardChargeService.getCharges( cards[0].cards, 11 );

    return successOptWithDataNoValidation(await this.calc(data, userid));
  }

  private async calc(data, userid): Promise<any> {
    let paidMerchants = Array();
    let groupInfo = Array();

    for (const info of data.group) {
      const cards = await this.analyzeCardService.getCalcTotal(info._id);
      if (cards.length > 0) {
        const pays = await this.pspVerifyService.getGroupCardInfoAll(cards[0].cards);
        const zero = await this.analyzeCardService.cardAmountWithZeroAmount(info._id);
        const data = await this.getAllMerchants(pays);
        paidMerchants = paidMerchants.concat(data);
        const firstCharge = await this.cardChargeService.getCharges(cards[0].cards, 11);
        // const yep = await this.cardChargeService.getChargesByGroups(cards[0].cards, 11);
        groupInfo.push(await this.calcGroups(info, cards, zero, firstCharge));
      }
    }
    paidMerchants = await this.getAllMerchants(paidMerchants);
    const initCharge = CreditorApiCalcPercent(groupInfo, data.percent);
    const debt = await this.calcDebt(data._id, paidMerchants, initCharge);

    const credit = await this.calcCredit(data._id, userid);
    return CreditorApiOutput(data.name, groupInfo, debt, credit);
  }

  private async getAllMerchants(data): Promise<any> {
    let output = [];

    for (const item of data) {
      // if (item.confirm == true) {
      const existing = output.filter((v) => {
        return v?.merchantcode == item?.merchantcode;
      });

      if (existing?.length) {
        const existingIndex: number = output.indexOf(existing[0]);
        output[existingIndex].amount += item.amount;
      } else {
        output.push(item);
      }

      // }
    }
    return output;
  }

  private async calcGroups(group, cards, zero, firstCharge): Promise<any> {
    console.log(firstCharge, ' firstCharge');
    return {
      title: group.title,
      first: {
        total: cards[0].cards.length,
        amount: firstCharge[0].amount,
      },
      used: {
        total: zero,
        amount: firstCharge[0].amount - cards[0].amount,
      },
      remain: {
        total: cards[0].cards.length - zero,
        amount: cards[0].amount,
      },
    };
  }

  private async calcDebt(subjectid, merchants, initCharge): Promise<any> {
    const debtPaids = await this.creditorService.getListBySubjectId(subjectid, CreditorTypeConst.Credit);

    return {
      balance: initCharge,
      merchants: merchants,
      paid: debtPaids,
    };
  }

  private async calcCredit(subjectid, userid): Promise<any> {
    const cerditPaids = await this.creditorService.getListBySubjectId(subjectid, CreditorTypeConst.Debt);
    const merchants = await this.getCreditMerchants(userid);

    return {
      merchants: merchants,
      paid: cerditPaids,
    };
  }

  private async getCreditMerchants(userid: string): Promise<any> {
    let ids = Array();
    let ObjId = Types.ObjectId;

    const merchants = await this.merchantService.getMerchantsByUserId(userid);
    for (const info of merchants) {
      ids.push(info.merchantcode);
    }

    return this.pspVerifyService.getBalances(ids);
  }
}
