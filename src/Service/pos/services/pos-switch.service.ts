import { Injectable } from '@vision/common';
import { SwitchService } from '../../../Switch/next-generation/switch.service';
import { PosSwitchDto } from '../dto/switch.dto';
import { PaySwitchResultConstType } from '../const/switch-result.const';
import { PosSuccess, PosInvalidPin, PosDefault, PosNotEnoughResource } from '../function/switch-response.function';
import { PosSwitchFormatFunction } from '../function/switch-format.function';

@Injectable()
export class PosSwitchService {
  constructor(private readonly switchService: SwitchService) {}

  async payment(getInfo: PosSwitchDto): Promise<any> {
    const res = await this.switchService.action(getInfo);

    if (res.rsCode == 20) {
      return this.confirm(res, getInfo);
    }
    return this.switchResult(res);
  }

  async confirm(result, getInfo: PosSwitchDto): Promise<any> {
    const reqInfo = PosSwitchFormatFunction(
      106,
      getInfo.TraxID,
      getInfo.CardNum,
      getInfo.Track2,
      getInfo.TermID,
      getInfo.Merchant,
      getInfo.ReceiveDT,
      getInfo.TrnAmt,
      getInfo.Pin,
      getInfo.termType
    );
    const res = await this.switchService.action(reqInfo);
    console.log(res, 'confirm');
    if (res.rsCode == 17) {
      return PosSuccess(result, 'پرداخت موفق');
    } else {
      return this.switchResult(result);
    }
  }

  async getRemain(getInfo: PosSwitchDto): Promise<any> {
    const res = await this.switchService.action(getInfo);
    if (res.rsCode == 20) {
      return PosSuccess(res, 'جزئیات');
    }
    return this.switchResult(res);
  }

  private switchResult(result) {
    switch (result.rsCode) {
      case PaySwitchResultConstType.InvalidPin: {
        return PosInvalidPin();
      }

      case PaySwitchResultConstType.NotEnoughResource: {
        return PosNotEnoughResource();
      }

      default:
        return PosDefault();
    }
  }
}
