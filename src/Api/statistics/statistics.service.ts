import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { AnalyzeCardCoreService } from '../../Core/analyze/card/services/analyze-card.service';
import { PspVrifyRequestCoreService } from '../../Core/psp/pspverify/services/request.service';
import { timestamoToISOStartDay, timestamoToISOEndDay } from '@vision/common/utils/month-diff.util';
import { StatisticsDateApiFunction } from './function/date.func';
import { StatisticsMakePdfApiService } from './services/make-pdf.service';
import { OrganizationNewChargeCoreAnalyzeService } from '../../Core/organization/new-charge/services/analyze.service';
import { mergeCards, organizationOutPut, statisticsAmountMemebr } from './function/merge-cards.func';

@Injectable()
export class StatisticsApiService {
  constructor(
    private readonly analyzeCardService: AnalyzeCardCoreService,
    private readonly pspRequestService: PspVrifyRequestCoreService,
    private readonly makePdfService: StatisticsMakePdfApiService,
    private readonly organizationChargeService: OrganizationNewChargeCoreAnalyzeService
  ) {}

  async getCalc(gid: string, from, to): Promise<any> {
    const fromx = new Date(from * 1000);
    const tox = new Date(to * 1000);
    const userCards = await this.analyzeCardService.getCardsList(gid);
    const data = await this.analyzeCardService.getCalcTotal(gid);

    const cards = mergeCards(userCards, data);

    const xdata = await this.pspRequestService.getGroupCardInfo(cards, fromx, tox);
    const zero = await this.analyzeCardService.cardAmountWithZeroAmount(gid);
    let usersId,
      cardsId = [];
    if (data.length > 0) {
      cardsId = data[0].cardsId;
    } else {
      cardsId = [];
    }
    if (userCards.length > 0) {
      usersId = userCards[0].users;
    } else {
      usersId = [];
    }

    const allOrganization = await this.organizationChargeService.getCalc(cardsId, usersId);

    const m = await this.pspRequestService.getMinAndMax(cards, fromx, tox);
    const memberWallet = statisticsAmountMemebr(data, zero);
    return {
      members: {
        total: cards.length,
        used: zero,
        mod: memberWallet.mod,
      },
      organization: organizationOutPut(allOrganization, m),
      amount: {
        mod: memberWallet.amount,
        paid: await this.getAmounts(xdata),
      },
      payment: xdata,
      paymentDate: StatisticsDateApiFunction(m),
    };
  }

  async getAmounts(data): Promise<any> {
    let amt = 0,
      org = 0;
    data.forEach((info) => {
      if (info.confirm == true) {
        amt = amt + info.amount;
        org = org + info.organization;
      }
    });
    return amt - org;
  }

  async getGroupList(userid: string): Promise<any> {
    const data = await this.analyzeCardService.getGroupList(userid);
    return successOptWithDataNoValidation(data);
  }

  async updateAmt(): Promise<any> {
    return this.pspRequestService.updateAmount();
  }

  async makeCardPdf(gid: string, from: any, to: any, res: any): Promise<any> {
    const data = await this.getCalc(gid, from, to);
    return this.makePdfService.cardMakePdf(data, res);
  }

  async testUSers(): Promise<any> {
    return this.analyzeCardService.getCardsList('5cd669dad5abc70f32c55d11');
  }
}
