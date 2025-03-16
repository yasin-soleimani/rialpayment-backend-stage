import { Injectable } from '@vision/common';
import { switchPay } from '@vision/common/utils/PaySwitch';
import { NewSwitchDto } from '../dto/new-switch.dto';
import { ShetabPaymentService } from './shetab/payment.shetab';
import { CloseloopService } from './closeloop/closeloop.service';
import { ShetabSwitchReverseService } from './shetab/reverse.shetab';
import { DiscountSwitchReverseService } from './closeloop/discount/reverse.clooseloop';
import { CreditSwitchReverseService } from './closeloop/credit/reverse.credit';
import { PspverifyCoreService } from '../../Core/psp/pspverify/pspverifyCore.service';
import { PayCommonService } from '../../Core/pay/services/pay-common.service';

@Injectable()
export class switchOperationService {
  constructor(
    private readonly shetabService: ShetabPaymentService,
    private readonly closeloopService: CloseloopService,
    private readonly shetabReverseService: ShetabSwitchReverseService,
    private readonly closeloopReverseService: DiscountSwitchReverseService,
    private readonly creditReverseService: CreditSwitchReverseService,
    private readonly pspVerifyService: PspverifyCoreService,
    private readonly commonService: PayCommonService
  ) {}

  async Buy(getInfo: NewSwitchDto, terminalInfo): Promise<any> {
    // get card opt
    const SwitchData = switchPay(getInfo.CardNum);
    switch (SwitchData) {
      case 'closeloop': {
        return this.closeloopService.Buy(getInfo, terminalInfo);
      }
      case 'shetab': {
        return this.shetabService.Buy(getInfo, terminalInfo);
      }
    }
  }

  async confirm(getInfo: NewSwitchDto): Promise<any> {
    return this.closeloopService.confirm(getInfo);
  }

  async reverse(getInfo: NewSwitchDto): Promise<any> {
    const dataInfo = await this.pspVerifyService.findByTraxID(getInfo.TraxID, '');
    if (!dataInfo) return this.commonService.Error(getInfo, 19, null);

    // if ( dataInfo)
  }
}
