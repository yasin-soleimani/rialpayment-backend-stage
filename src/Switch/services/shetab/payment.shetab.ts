import { Injectable, CreditStatusEnums } from '@vision/common';
import { NewSwitchDto } from '../../dto/new-switch.dto';
import { CardmanagementcoreService } from '../../../Core/cardmanagement/cardmanagementcore.service';
import { PayCommonService } from '../../../Core/pay/services/pay-common.service';
import { discountCalc } from '@vision/common/utils/discount';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';

@Injectable()
export class ShetabPaymentService {
  constructor(
    private readonly cardManagement: CardmanagementcoreService,
    private readonly commonService: PayCommonService,
    private readonly loggerService: LoggercoreService
  ) {}
  async Buy(getInfo: NewSwitchDto, terminalInfo): Promise<any> {
    const cardInfo = await this.cardManagement.getCardInfo(getInfo.CardNum);
    if (!cardInfo) return this.commonService.Error(getInfo, 4, null, null, null);

    const value = discountCalc(getInfo.TrnAmt, terminalInfo.discnonebank, terminalInfo.discbank);
    const data = Array();
    data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
    data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
    data.push({ title: 'امتیاز از این خرید', amount: 0 });
    const incomData = [
      {
        sheba: terminalInfo.cosheba,
        amount: value.discount,
      },
      {
        sheba: terminalInfo.sheba,
        amount: value.amount,
      },
    ];
    console.log(terminalInfo.merchant.user, 'tt');
    const title = 'خرید با کارت شتابی از فروشگاه ' + terminalInfo.title;
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
