import { Injectable, CreditStatusEnums } from '@vision/common';
import { discountCalc } from '@vision/common/utils/discount';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';

@Injectable()
export class SwitchShetabService {
  constructor(private readonly loggerService: LoggercoreService, private readonly commonService: PayCommonService) {}

  async newPayment(getInfo, cardInfo, terminalInfo, discountInfo): Promise<any> {
    const value = discountCalc(getInfo.TrnAmt, discountInfo.nonebankdisc, discountInfo.bankdisc);
    const incomData = Array();
    const data = Array();
    data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
    data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
    data.push({ title: ' دریافتی پذیرنده', amount: value.amount.toLocaleString() });
    data.push({ title: 'امتیاز از این خرید', amount: 0 });

    // if ( value.discount > 0 ) {
    //   incomData.push({sheba: terminalInfo.cosheba, amount: value.discount});
    // }
    // incomData.push({ sheba: terminalInfo.sheba,  amount: value.amount });

    incomData.push({ total: Number(getInfo.TrnAmt), sheba: null });
    incomData.push({
      amount:
        Number(value.amount) +
        Number(value.nonebank) +
        Number(value.companywage) +
        Number(value.merchantref) +
        Number(value.cardref),
      sheba: null,
    });
    incomData.push({
      company: Number(value.nonebank) + Number(value.companywage) + Number(value.merchantref) + Number(value.cardref),
      sheba: terminalInfo.cosheba,
    });
    incomData.push({ merchant: value.amount, sheba: terminalInfo.sheba });

    const title =
      'خرید با کارت شتابی از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
    const logInfo = await this.loggerService.submitNewLogg(
      title,
      'POS',
      getInfo.TrnAmt,
      true,
      cardInfo.user._id,
      terminalInfo.merchant.user
    );
    const returnData = this.commonService.setDataShetab(getInfo, 20, null, value, data, incomData, cardInfo.user);
    this.commonService
      .submitDiscountRequest(
        value.companywage,
        value.cardref,
        value.merchantref,
        value.nonebank,
        value.bankdisc,
        value.discount,
        value.amount,
        0
      )
      .then((res) => {
        this.commonService.submitRequest(getInfo, data, incomData).then((res2) => {
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
