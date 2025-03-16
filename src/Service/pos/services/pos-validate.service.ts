import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { PosValidateServiceDto } from '../dto/validate.dto';
import { MerchantTerminalPosInfoService } from '../../../Core/merchant/services/merchant-terminal-pos-info.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PosServiceStatusCode } from '../const/status-code.const';
import { imageTransform } from '@vision/common/transform/image.transform';
import { returnPosValidateServiceSuccess } from '../function/PosValidate.function';

@Injectable()
export class PosValidateService {
  constructor(private readonly terminalInfo: MerchantTerminalPosInfoService) {}

  async getInfo(getInfo: PosValidateServiceDto): Promise<any> {
    console.log(getInfo, 'getInfo');
    const data = await this.terminalInfo.getInfo(getInfo.serial, getInfo.modelname, getInfo.mac);
    console.log(data, 'data ');
    if (!data || data.serial != getInfo.serial)
      throw new UserCustomException('تنظیمات یافت نشد', false, PosServiceStatusCode.settingsNotFound);

    if (data.terminal.status == false || data.terminal.merchant.status == false)
      throw new UserCustomException('پایانه غیرفعال', false, PosServiceStatusCode.disabledTerminal);

    return returnPosValidateServiceSuccess(data);
  }
}
