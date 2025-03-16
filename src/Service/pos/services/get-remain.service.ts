import { Injectable } from '@vision/common';
import { PosSwitchService } from './pos-switch.service';
import { PosPayRequestDto } from '../dto/pay-req.dto';
import { PosCardService } from './card.service';
import { MerchantTerminalPosInfoService } from '../../../Core/merchant/services/merchant-terminal-pos-info.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PosSwitchFormatFunction } from '../function/switch-format.function';

@Injectable()
export class PosGetRemainSrevice {
  constructor(
    private readonly switchService: PosSwitchService,
    private readonly cardService: PosCardService,
    private readonly terminalService: MerchantTerminalPosInfoService
  ) {}

  async getCalc(getInfo: PosPayRequestDto): Promise<any> {
    console.log(getInfo);

    const posInfo = await this.terminalService.getInfoByMac(getInfo.mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);

    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');

    const cardInfo = await this.cardService.rfidCard(getInfo);
    const track2 = cardInfo.cardno + '=' + cardInfo.secpin;
    const reqInfo = PosSwitchFormatFunction(
      103,
      new Date().getTime(),
      Number(getInfo.cardno),
      track2,
      posInfo.terminal.terminalid,
      posInfo.terminal.merchant.merchantcode,
      new Date(),
      0,
      getInfo.pin,
      Number(getInfo.type)
    );

    return this.switchService.getRemain(reqInfo);
  }
}
