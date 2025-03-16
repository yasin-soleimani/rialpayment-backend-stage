import { Injectable } from '@vision/common';
import { OrganizationChargeService } from '../../../../Core/organization/charge/organization-charge.service';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { InOrganizationChargeSwitchService } from './services/in-organ-charge.service';
import { InTwoWayOrganizationSwitchService } from './services/in-twice.service';
import { InWalletOrganStrategySwitchService } from './services/in-wallet-mode.service';

@Injectable()
export class OrganizationSwitchService {
  constructor(
    private readonly organChargeService: OrganizationChargeService,
    private readonly oneWayService: InOrganizationChargeSwitchService,
    private readonly twoWayService: InTwoWayOrganizationSwitchService,
    private readonly walletWayService: InWalletOrganStrategySwitchService
  ) {}

  async buy(strategyInfo, cardInfo, terminalInfo, getInfo: SwitchRequestDto): Promise<any> {
    const userCharge = await this.organChargeService.getBalance(cardInfo.user._id);
    let amount = 0;
    if (userCharge) amount = userCharge.amount;
    switch (true) {
      case getInfo.TrnAmt < amount: {
        return this.oneWayService.buy(strategyInfo, terminalInfo, cardInfo, getInfo);
      }

      case amount > 0: {
        return this.twoWayService.buy(strategyInfo, terminalInfo, cardInfo, getInfo);
      }

      case amount < 1: {
        return this.walletWayService.buy(strategyInfo, terminalInfo, cardInfo, getInfo);
      }

      default: {
        return 'off';
      }
    }
  }
}
