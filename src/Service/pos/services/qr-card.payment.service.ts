import { Injectable } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { AccountService } from "../../../Core/useraccount/account/account.service";
import { CardService } from "../../../Core/useraccount/card/card.service";
import { CardQrCoreService } from "../../../Core/useraccount/card/services/card-qr.service";
import { PosScanQrDto } from "../dto/scan-qr.dto";
import { PosSwitchFormatFunction } from "../function/switch-format.function";
import { PosSwitchService } from "./pos-switch.service";
import * as Sha256 from 'sha256';

@Injectable()
export class PosQrCardScanService {

  private minAmount: number = 1000;
  private maxAmount: number = 1000000;

  constructor(
    private readonly cardService: CardService,
    private readonly cardQrService: CardQrCoreService,
    private readonly switchService: PosSwitchService,
    private readonly accountService: AccountService
  ) { }

  async getPayment(cardno, getInfo: PosScanQrDto, posInfo): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo) throw new UserCustomException('بارکد نامعتبر', false, 404);
    console.log(cardInfo)
    const length = getInfo.barcode.length;

    const content = getInfo.barcode.substr(16, length);
    const data = await this.cardQrService.QrDec(cardInfo.cardno, content);
    if (data != cardno) throw new UserCustomException('بارکد نامعتبر', false, 404);

    const amount = await this.getAmount(cardInfo);

    const track2 = cardInfo.cardno + '=' + cardInfo.secpin;
    const reqInfo = PosSwitchFormatFunction(
      104,
      new Date().getTime(),
      Number(cardInfo.cardno),
      track2,
      posInfo.terminal.terminalid,
      posInfo.terminal.merchant.merchantcode,
      new Date(),
      Number(getInfo.amount),
      Sha256(cardInfo.pin),
      14
    );

    return this.switchService.payment(reqInfo);
  }

  private async getAmount(cardInfo: any): Promise<any> {

    if (cardInfo.user) {
      const wallet = await this.accountService.getBalance(cardInfo.user._id, 'wallet');
      console.log(wallet, 'wallet');
      let org = await this.accountService.getBalance(cardInfo.user._id, 'org');
      if (!org) org = { balance: 0 }
      const total = wallet.balance + org.balance;
      console.log(total);
      if (total < this.minAmount) throw new UserCustomException('موجودی ناکافی');
      if (total > this.maxAmount) { return 1000000 } else return total;
    } else {
      if (cardInfo.amount < this.minAmount) throw new UserCustomException('موجودی ناکافی');
      if (cardInfo.amount > this.maxAmount) { return 1000000 } else return cardInfo.amount
    }
  }
}