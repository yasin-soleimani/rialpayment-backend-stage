import { Injectable, successOptWithDataNoValidation, InternalServerErrorException } from '@vision/common';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { ChargeIpgServiceDto } from '../dto/charge-ipg.dto';
import { PayIpgModel } from '../../../Api/basket/vitrin/services/pay.model';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { MipgService } from '../../../Service/mipg/mipg.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { ChargeServiceReturnModel } from '../func/return-model.func';
import { CardChargeHistoryCoreService } from '../../../Core/useraccount/card/services/card-history.service';
import { CardChargeHistoryTypeConst } from '../../../Core/useraccount/card/const/card-charge-type.const';

@Injectable()
export class ChargeIpgService {
  private baseUrl = 'https://charge.rialpayment.ir/transaction-status?';

  constructor(
    private readonly mipgService: MipgService,
    private readonly ipgService: IpgCoreService,
    private readonly cardService: CardService,
    private readonly accountService: AccountService,
    private readonly cardHistory: CardChargeHistoryCoreService
  ) {}

  async getTokenIpg(getInfo: ChargeIpgServiceDto): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(getInfo.cardno);

    if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);
    if (!cardInfo.user) {
      const modelData = ChargeServiceReturnModel(cardInfo);
      if (modelData.remain < getInfo.amount) throw new UserCustomException('مبلغ نامعتبر');
      if (getInfo.amount <= 10000)
        throw new UserCustomException('حداقل مبلغ شارژ بیش از 10000 ریال می باشد ', false, 500);
    }

    const callback = 'https://service.rialpayment.ir/charge/callback';

    return this.getTokenUserMode(getInfo, cardInfo, callback);
    1;
  }

  private async getTokenUserMode(getInfo: ChargeIpgServiceDto, cardInfo, callback): Promise<any> {
    let payload;
    if (cardInfo.user) {
      payload = JSON.stringify({
        card: cardInfo.cardno,
        user: cardInfo.user._id,
      });
    } else {
      payload = JSON.stringify({
        card: cardInfo.cardno,
      });
    }

    const ipgModel = PayIpgModel(
      process.env.CARD_CHARGE_IPG,
      Number(getInfo.amount),
      callback,
      payload,
      'ChargeCard-' + new Date().getTime(),
      true
    );
    const data = await this.mipgService.validateIn(ipgModel);
    if (!data.invoiceid) throw new UserCustomException('شارژ با خطا مواجه شده است');
    return successOptWithDataNoValidation(data.invoiceid);
  }

  async callback(getInfo, res): Promise<any> {
    console.log('charge callback started:::::::::::::::::::::::::::::::::::::::::::::::>>>>>>>>>>>>>>>');
    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    console.log('payInfo:::::::::::::::::::::::::::::::::::::::::::::::>>>>>>>>>>>>>>>', payInfo);

    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد');
    let parsed;

    if (payInfo.payload && payInfo.payload.length > 1) {
      parsed = JSON.parse(payInfo.payload);
    } else {
      throw new UserCustomException('تراکنش با خطا مواجه شده است', false, 500);
    }
    console.log('after payload:::::::::::::::::::::::::::::::::::::::::::::::>>>>>>>>>>>>>>>');
    let amount = payInfo.amount;
    if (payInfo.total) {
      amount = payInfo.total;
    }
    if (getInfo.respcode == 0) {
      const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
      if (!verify) throw new InternalServerErrorException();

      if (verify.status == 0 && verify.success == true) {
        if (payInfo.retry < 2) {
          if (parsed.user) {
            await this.accountService.chargeAccount(parsed.user, 'wallet', amount).then((res) => {
              const title = ' شارژ کارت ' + parsed.card;
              this.accountService.accountSetLoggWithRef(title, payInfo.invoiceid, amount, true, null, parsed.user);
            });
          } else {
            const cardInfo = await this.cardService.getCardInfo(parsed.card);
            if (!cardInfo) throw new InternalServerErrorException();

            await this.cardService.chargeCard(cardInfo._id, amount);
            const title = 'شارژ کارت توسط درگاه اینترنتی ' + payInfo.invoiceid;
            await this.cardHistory.addNew(
              null,
              cardInfo._id,
              amount,
              title,
              CardChargeHistoryTypeConst.UserCharge,
              cardInfo.cardno
            );
          }
        }

        res.redirect(
          301,
          this.baseUrl + 'refid=' + payInfo.invoiceid + '&status=true&amount=' + amount + '&cardno=' + parsed.card
        );
        return res.end();
      } else {
        const url = 'refid=' + payInfo.invoiceid + '&status=false&amount=' + amount + '&cardno=' + parsed.card;
        res.redirect(301, this.baseUrl + url);
        return res.end();
      }
    } else {
      console.log('in failed:::::::::::::::::::::::::::::::::::::::::::::::>>>>>>>>>>>>>>>');
      const url = 'refid=' + payInfo.invoiceid + '&status=false&amount=' + amount + '&cardno=' + parsed.card;
      res.redirect(301, this.baseUrl + url);
      return res.end();
    }
  }
}
