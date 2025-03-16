import { Injectable } from '@vision/common';
import { PosSwitchService } from './pos-switch.service';
import { MerchantTerminalPosInfoService } from '../../../Core/merchant/services/merchant-terminal-pos-info.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PosSwitchFormatFunction } from '../function/switch-format.function';
import { PosCardService } from './card.service';
import { PosPayRequestDto } from '../dto/pay-req.dto';

@Injectable()
export class PosPaymentService {
  constructor(
    private readonly switchService: PosSwitchService,
    private readonly termninalService: MerchantTerminalPosInfoService,
    private readonly cardService: PosCardService
  ) {}

  async pay(getInfo: PosPayRequestDto): Promise<any> {
    const posInfo = await this.termninalService.getInfoByMac(getInfo.mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);

    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');

    if (getInfo.amount < 1000) throw new UserCustomException('مبلغ نامعتبر');

    const cardInfo = await this.cardService.rfidCard(getInfo);
    const track2 = cardInfo.cardno + '=' + cardInfo.secpin;
    const reqInfo = PosSwitchFormatFunction(
      104,
      new Date().getTime(),
      Number(getInfo.cardno),
      track2,
      posInfo.terminal.terminalid,
      posInfo.terminal.merchant.merchantcode,
      new Date(),
      Number(getInfo.amount),
      getInfo.pin,
      Number(getInfo.type)
    );

    return this.switchService.payment(reqInfo);
  }
}
