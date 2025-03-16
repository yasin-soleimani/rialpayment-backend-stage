import {
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithPagination,
  UnauthorizedException,
} from '@vision/common';
import { OrganizationPoolCoreService } from '../../../Core/organization/pool/pool.service';
import { PoolAddNewApiDto } from '../dto/pool.dto';

@Injectable()
export class PoolApiCommonService {
  constructor(private readonly orgPoolService: OrganizationPoolCoreService) {}

  async addNewPool(getInfo: PoolAddNewApiDto, userid: string): Promise<any> {
    const data = await this.orgPoolService.addPool(getInfo.groups, getInfo.title, userid, getInfo.minremain);
    if (!data) throw new InternalServerErrorException();
    const titlex = 'ساخت استخر پول توسط خود کاربر';
    await this.orgPoolService.addHistory(data._id, userid, titlex);
    return successOpt();
  }

  async updateRemainPool(getInfo: PoolAddNewApiDto, userid: string): Promise<any> {
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
      const bill = await this.orgPoolService.updateSettingsQuery(poolInfo._id, { $set: { bill: getInfo.bill } });
      if (!bill) throw new InternalServerErrorException();

      let status = ' فعال ';
      if (getInfo.charge == false) status = ' غیرفعال ';
      const titlex = 'پرداخت قبوض' + status + ' شد ';
      await this.orgPoolService.addHistory(poolInfo._id, userid, titlex);
    }

    return successOpt();
  }

  async PoolList(userid: string, page: number): Promise<any> {
    const query = { user: userid, status: true };
    const data = await this.orgPoolService.getListPool(query, page);

    return successOptWithPagination(data);
  }

  async PoolTurnOverList(userid: string, poolid: string, page): Promise<any> {
    const query = { pool: poolid };
    const data = await this.orgPoolService.getListTurnOver(query, page);

    return successOptWithPagination(data);
  }
}
