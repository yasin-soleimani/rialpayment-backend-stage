import { Injectable, successOptWithPagination, CoBenefit } from '@vision/common';
import { CreditHistoryCoreService } from '../../Core/credit/history/credit-history.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { installDetailsSuccessOpt } from '@vision/common/messages/install';
import { daydiff, penaltyInstalls } from '@vision/common/utils/month-diff.util';
import { imageTransform } from '@vision/common/transform/image.transform';
import { roundFloor } from '@vision/common/utils/round.util';

@Injectable()
export class MemberCreditService {
  constructor(
    private readonly creditHistory: CreditHistoryCoreService,
    private readonly generalService: GeneralService
  ) {}

  async getList(userid, page, type): Promise<any> {
    const data = await this.creditHistory.getList(userid, page, type);
    let datax = Array();
    if (data) {
      for (let i = 0; i < data.docs.length; i++) {
        datax.push({
          _id: data.docs[i]._id,
          title: data.docs[i].terminal.title,
          amount: data.docs[i].amount,
          remain: data.docs[i].remain,
          type: data.docs[i].type,
          logo: imageTransform(data.docs[i].terminal.merchant.logo),
        });
      }
    }
    data.docs = datax;
    return successOptWithPagination(data);
  }

  async getDetails(shopid): Promise<any> {
    const data = await this.creditHistory.getShopDetails(shopid);
    let remainAmount = 0;
    let paidAmount = 0;
    let returnAmount;
    let remainInstallments = 0;
    let list = Array();
    let cobenefit = 0;

    if (!data) throw new UserCustomException('متاسفانه سند مورد نظر یافت نشد', false, 404);
    const tenDay = data.tenday;
    const tnyDat = data.tnyday;

    for (let i = 0; i < data.installs.length; i++) {
      let penalty = 0;
      let disAmt = 0;
      returnAmount = 0;
      cobenefit = 0;
      returnAmount = await this.selectorType(data.installs[i].date, tenDay, tnyDat, data.installs[i].amount, 2);
      if (data.installs[i].paid == true) {
        paidAmount = paidAmount + data.installs[i].paidamount;
      } else {
        remainAmount = remainAmount + data.installs[i].amount;
        remainInstallments++;
      }
      if (returnAmount.penalty > 0) {
        penalty = returnAmount.penalty;
      } else {
        penalty = returnAmount.penalty;
      }

      if (returnAmount.discAmount > 0) {
        disAmt = returnAmount.discAmount;
      } else {
        disAmt = returnAmount.discAmount;
      }
      list.push({
        _id: data.installs[i]._id,
        date: data.installs[i].date,
        amount: roundFloor(data.installs[i].amount),
        discAmount: roundFloor(disAmt),
        penalty: roundFloor(penalty),
        status: data.installs[i].paid,
        paidamount: roundFloor(data.installs[i].paidamount),
        cobenefit: roundFloor(returnAmount.coBenefit),
      });
    }
    const mainData = {
      logo: imageTransform(data.terminal.merchant.logo),
      title: data.terminal.title,
      type: data.type,
      totalInstalls: data.installs.length,
      remain: remainInstallments,
      prepayment: data.prepaid,
      date: data.createdAt || 0,
      paidAmount: paidAmount,
      cobenefit: data.cobenefit || 2.5,
      tenday: tenDay,
      tnyday: tnyDat,
      remainAmount: roundFloor(remainAmount),
      advance: data.advance,
      installs: list,
    };
    return installDetailsSuccessOpt(mainData);
  }

  private async selectorType(date, tenday, tnyday, amount, percent): Promise<any> {
    let penaltyAmount = 0;
    let disAmount;
    let disAmount2 = 0;
    let cobenefit = 0;
    let penalty = penaltyInstalls(date);

    if (penalty.month > 0 || penalty.days > 0) {
      penaltyAmount = amount;
      if (penalty.month > 0) {
        for (let i = 0; i < penalty.month; i++) {
          const penalty = Math.round((percent * penaltyAmount) / 100);
          penaltyAmount = penaltyAmount + penalty;
        }
      }
      if (penalty.days > 0) {
        for (let i = 0; i < penalty.days; i++) {
          const penalty = Math.round((percent * penaltyAmount) / 100 / 30);
          penaltyAmount = penaltyAmount + penalty;
        }
      }
    } else {
      disAmount = await this.discountInstall(date, tenday, tnyday, amount);
      cobenefit = disAmount.coBenefit || 0;
      disAmount2 = disAmount.disAmount || 0;
    }

    return {
      penalty: penaltyAmount || 0,
      discAmount: disAmount2 || 0,
      coBenefit: cobenefit || 0,
    };
  }

  private async discountInstall(date, tenday, tnyday, amount): Promise<any> {
    let disAmount;
    let date1 = new Date();
    let date2 = new Date(date);
    let diffDay = daydiff(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate(),
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate()
    );

    if (diffDay > 9 && diffDay < 21) {
      console.log('first opt');
      const permonthBenefiy = Math.round((tnyday * amount) / 100);
      disAmount = amount - permonthBenefiy;
    } else if (diffDay > 20 && diffDay < 32) {
      console.log('2 opt');
      const permonthBenefiy = Math.round((tenday * amount) / 100);
      disAmount = amount - permonthBenefiy;
    } else if (diffDay > 31) {
      console.log('3 opt');
      const permonthBenefiy = Math.round((tenday * amount) / 100);
      disAmount = amount - permonthBenefiy;
    } else if (diffDay < 10) {
      console.log('4 opt');
      disAmount = amount;
    }
    const primaryBenefit = Math.round((CoBenefit.PrimaryBenefit * amount) / 100);
    return {
      disAmount: disAmount,
      coBenefit: primaryBenefit,
    };
  }
}
