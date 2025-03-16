import { Injectable } from '@vision/common';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { NewSwitchDto } from '../../../dto/new-switch.dto';
import { PspverifyCoreService } from '../../../../Core/psp/pspverify/pspverifyCore.service';

@Injectable()
export class CreditPaymentConfirmService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly pspverifyService: PspverifyCoreService
  ) {}

  async creditConfirm(dataInfo, getInfo: NewSwitchDto): Promise<any> {
    if (dataInfo.confirm === true || dataInfo.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }

    const confirm = await this.pspverifyService.confirm(dataInfo.TraxID);
    if (confirm) {
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      return this.commonService.Error(getInfo, 10, dataInfo.user.id);
    }
  }
}
