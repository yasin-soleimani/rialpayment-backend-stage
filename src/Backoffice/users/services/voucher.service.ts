import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { SafevoucherCoreService } from '../../../Core/safevoucher/safevoucher.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class BackofficeVoucherUserService {
  constructor(private readonly voucherService: SafevoucherCoreService) {}

  async getInfo(id: string) {
    const voucher = await this.voucherService.getInfoById(id);
    if (!voucher) throw new UserCustomException('یافت نشد', false, 404);

    let tmp = Array();

    for (const info of voucher.details) {
      tmp.push({
        fullname: info.user.fullname,
        amount: info.amount,
        mobile: info.user.mobile,
        createdAt: info.date,
      });
    }

    return successOptWithDataNoValidation(tmp);
  }
}
