import { Injectable } from '@vision/common';
import { SwitchMobileGateService } from './services/gate.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class SwitchMobileService {
  constructor(private readonly gateService: SwitchMobileGateService) {}

  async Buy(terminalInfo, userInfo, amount): Promise<any> {
    switch (terminalInfo.terminal.strategy[0].type) {
      case 800: {
        return this.gateService.buy(terminalInfo, userInfo);
      }

      default: {
        throw new UserCustomException('متاسفانه پذیرنده نامعتبر می باشد', false, 500);
      }
    }
  }
}
