import { Injectable, InternalServerErrorException, successOptWithDataNoValidation, successOptWithPagination } from '@vision/common';
import { PspVrifyRequestCoreService } from '../../../Core/psp/pspverify/services/request.service';
import { MerchantCoreTerminalService } from '../../../Core/merchant/services/merchant-terminal.service';
import { GroupApiTerminalTypeConst } from '../const/terminal-type.const';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { CardChargeHistoryCoreService } from '../../../Core/useraccount/card/services/card-history.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardQrCoreService } from '../../../Core/useraccount/card/services/card-qr.service';
import * as momentjs from 'jalali-moment';

@Injectable()
export class GroupCardInfoApiService {
  constructor(
    private readonly requestService: PspVrifyRequestCoreService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly cardService: CardService,
    private readonly cardHistoryService: CardChargeHistoryCoreService,
    private readonly cardQrService: CardQrCoreService
  ) { }

  async getInfo(cardno, page: number): Promise<any> {
    const data = await this.requestService.getListByCardNum(cardno, page);

    let tmp = Array();

    for (const info of data.docs) {
      const ff = JSON.parse(info.req);
      const terminalInfo = await this.terminalService.getTerminalInfoByTerminalid(ff.TermID);
      tmp.push({
        _id: info._id,
        cardno: info.CardNum,
        terminalid: ff.TermID,
        merchantcode: info.Merchant,
        merchanttitle: terminalInfo.title,
        merchanttype: GroupApiTerminalTypeConst[info.TermType],
        createdAt: info.createdAt,
        amount: ff.TrnAmt,
      });
    }

    data.docs = tmp;

    return successOptWithPagination(data);
  }

  async getChargeInfo(cardno: number, page: number): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo) throw new UserCustomException('یافت نشد', false, 404);

    const data = await this.cardHistoryService.getList(cardInfo._id, page);

    return successOptWithPagination(data);
  }

  async makeQrDetails(cardno: number): Promise<any> {

    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo) throw new UserCustomException('یافت نشد', false, 404);

    const enc = await this.cardQrService.makeQrEnc(cardno);
    if (!enc) throw new InternalServerErrorException();

    return successOptWithDataNoValidation({
      cardno: cardInfo.cardno,
      cvv2: cardInfo.cvv2,
      expire: momentjs(Number(cardInfo.expire)).locale('fa').format('YY/MM'),
      content: cardInfo.cardno.toString() + enc
    })
  }
}
