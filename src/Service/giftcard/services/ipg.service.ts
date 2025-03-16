import { Injectable, InternalServerErrorException } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PayIpgModel } from '../../../Api/basket/vitrin/services/pay.model';
import { CoreGiftcardService } from '../../../Core/giftCard/card/giftcard.service';
import { CoreGiftCardReportService } from '../../../Core/giftCard/report/services/report.service';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { MipgService } from '../../mipg/mipg.service';

@Injectable()
export class GiftcardIpgService {
  constructor(
    private readonly mipgService: MipgService,
    private readonly ipgService: IpgCoreService,
    private readonly reportService: CoreGiftCardReportService,
    private readonly giftcardService: CoreGiftcardService
  ) {}

  async callback(getInfo, res): Promise<any> {
    if (getInfo.respcode != 0) {
      res.writeHead(301, {
        Location: process.env.GIFT_CARD_ADDRESS + '/payment-type?' + null,
      });
    }

    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    if (!payInfo) {
      res.writeHead(301, {
        Location: process.env.GIFT_CARD_ADDRESS + '/payment-type?' + null,
      });
    }
    const payload = JSON.parse(payInfo.payload);
    const report = await this.reportService.getInfoById(payload.id);

    if (!report) {
      res.writeHead(301, {
        Location: process.env.GIFT_CARD_ADDRESS + '/payment-type?' + null,
      });
    }

    const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
    if (!verify) {
      res.writeHead(301, {
        Location: process.env.GIFT_CARD_ADDRESS + '/payment-type?' + null,
      });
    }

    if (verify.status == 0 && verify.success == true) {
      const cardInfo = await this.giftcardService.generate(report._id, process.env.GIFT_CARD_USER, report.group, 0, 0);
      res.writeHead(301, {
        Location: process.env.GIFT_CARD_ADDRESS + '/payment-type?' + report._id,
      });
    } else {
      res.writeHead(301, {
        Location: process.env.GIFT_CARD_ADDRESS + '/payment-type?' + report._id,
      });
    }
  }
  async getToken(id: string, amount: number): Promise<any> {
    const ipgModel = PayIpgModel(
      process.env.GIFT_CARD_TERMINAL,
      amount,
      process.env.GIFT_CARD_CALLBACK,
      JSON.stringify({ id }),
      'GiftCard-' + new Date().getTime(),
      true
    );
    const result = await this.mipgService.validateIn(ipgModel);
    if (!result.invoiceid) throw new UserCustomException('شارژ با خطا مواجه شده است');
    return result.invoiceid;
  }
}
