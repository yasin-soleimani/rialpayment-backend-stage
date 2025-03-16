import { Injectable } from '@vision/common';
import { PayCommonService } from '../../../Core/pay/services/pay-common.service';
import { PspverifyCoreService } from '../../../Core/psp/pspverify/pspverifyCore.service';
import { NewSwitchDto } from '../../dto/new-switch.dto';

@Injectable()
export class ShetabSwitchReverseService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly pspVerifyService: PspverifyCoreService
  ) {}

  async reverse(dataInfo, getInfo: NewSwitchDto): Promise<any> {}
}
