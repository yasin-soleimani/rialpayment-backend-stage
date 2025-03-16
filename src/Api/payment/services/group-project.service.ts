import { Injectable } from '@vision/common';
import { GroupProjectTargetCoreService } from '../../../Core/group-project/services/group-project-target.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { VoucherCoreService } from '../../../Core/voucher/voucher.service';

@Injectable()
export class PaymentGroupProjectApiService {
  constructor(
    private readonly targetService: GroupProjectTargetCoreService,
    private readonly voucherService: VoucherCoreService
  ) {}

  async getInfo(userid: string, to: any): Promise<any> {
    const details = await this.voucherService.getVoucherDetailsByVoucherId(to);

    let tmp;
    const targetInfo = await this.targetService.getUserTarger(userid);
    if (!targetInfo) throw new UserCustomException('شما مجاز به استفاده از ووچر نیستید');

    for (const info of details.item) {
      if (String(info.product.group) == String(targetInfo.group)) {
        if (info.used == true) throw new UserCustomException('قبلا استفاده شده است');
        tmp = info;
        return tmp.amount * tmp.qty;
      }
    }

    throw new UserCustomException('شما مجاز به استفاده از ووچر نیستید');
  }

  async paymentTicket(userid, to): Promise<any> {
    await this.getInfo(userid, to);
    const details = await this.voucherService.getVoucherDetailsByVoucherId(to);

    let tmp = Array();
    let infx;
    const targetInfo = await this.targetService.getUserTarger(userid);
    if (!targetInfo) throw new UserCustomException('شما مجاز به استفاده از ووچر نیستید');

    for (const info of details.item) {
      if (String(info.product.group) == String(targetInfo.group)) {
        infx = info;
        tmp.push({
          used: true,
          _id: info._id,
          product: info.product._id,
          qty: info.qty,
          amount: info.amount,
          discount: info.discount,
          total: info.total,
        });
      } else {
        tmp.push(info);
      }
    }
    console.log(tmp);
    await this.voucherService.updateVoucherDetails(to, tmp);

    return infx;
  }
}
