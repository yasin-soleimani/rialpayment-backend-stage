import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MerchantCoreTerminalInfoService } from '../../../Core/merchant/services/merchant-terminal-info.service';
import * as mongoose from 'mongoose';
import { MerchantShareService } from '../../../Core/merchant/services/merchant-share.service';
import { MerchantCoreTerminalService } from '../../../Core/merchant/services/merchant-terminal.service';

@Injectable()
export class UserMerchantTerminalService {
  constructor(
    private readonly terminalInfoService: MerchantCoreTerminalService,
    private readonly merchantShareService: MerchantShareService
  ) {}

  async getAllTerminalsByUserId(userId: string): Promise<any> {
    const shares = await this.merchantShareService.getSharesByToId(userId);
    const array = [mongoose.Types.ObjectId(userId)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.sharedMerchant as string));
    const data = await this.terminalInfoService.getMerchantsAllTerminal(array, 1, true, false);
    if (!data) throw new UserCustomException('ترمینال یافت نشد', false, 404);
    let tmpArray = Array();

    for (const item of data) {
      if (item.merchant) {
        tmpArray.push({
          _id: item._id,
          terminal: item.terminalid,
          merchantcode: item.merchant.merchantcode,
          title: item.title,
          merchantTitle: item.merchant.title,
        });
      }
    }

    return successOptWithDataNoValidation(data);
  }
}
