import { Injectable, InternalServerErrorException, successOpt, UnauthorizedException } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { OrganizationPoolCoreService } from '../../../Core/organization/pool/pool.service';

@Injectable()
export class BackofficePoolSettingsService {
  constructor(private readonly orgPoolService: OrganizationPoolCoreService) {}

  async set(getInfo, userid: string): Promise<any> {
    const poolInfo = await this.orgPoolService.getPoolInfo(getInfo.id);
    if (!poolInfo) throw new UnauthorizedException();

    if (poolInfo.minremain != getInfo.minremain) {
      const remainUpdate = await this.orgPoolService.updateSettingsQuery(poolInfo._id, getInfo.minremain);
      if (!remainUpdate) throw new InternalServerErrorException();

      const titlex = 'اصلاح حداقل موجودی از مبلغ ' + poolInfo.minremain + ' به ' + getInfo.minremain;
      await this.orgPoolService.addHistory(poolInfo._id, userid, titlex);
    }

    if (poolInfo.charge != getInfo.charge) {
      const charge = await this.orgPoolService.updateSettingsQuery(poolInfo._id, { $set: { charge: getInfo.charge } });
      if (!charge) throw new InternalServerErrorException();
      let status = ' فعال ';
      if (getInfo.charge == false) status = ' غیرفعال ';
      const titlex = 'شارژ سیم کارت ' + status + ' شد ';
      await this.orgPoolService.addHistory(poolInfo._id, userid, titlex);
    }

    if ((poolInfo.bill = getInfo.bill)) {
      if (Number(getInfo.billwage) < 0) throw new UserCustomException('میلغ کارمزد وارد نشده است');

      const bill = await this.orgPoolService.updateSettingsQuery(poolInfo._id, {
        $set: { bill: getInfo.bill, billwage: getInfo.billwage },
      });
      if (!bill) throw new InternalServerErrorException();

      let status = ' فعال ';
      if (getInfo.charge == false) status = ' غیرفعال ';
      const titlex = 'پرداخت قبوض' + status + ' شد ';
      await this.orgPoolService.addHistory(poolInfo._id, userid, titlex);
    }

    return successOpt();
  }
}
