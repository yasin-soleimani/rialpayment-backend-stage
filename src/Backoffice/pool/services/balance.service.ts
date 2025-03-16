import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { OrganizationPoolCoreService } from '../../../Core/organization/pool/pool.service';
import { BackofficePoolChargeDto } from '../dto/charge.dto';
import { BackofficePoolDeductionDto } from '../dto/deduction.dto';

@Injectable()
export class BackofficePoolBalanceService {
  constructor(private readonly orgPoolService: OrganizationPoolCoreService) {}

  async charge(getInfo: BackofficePoolChargeDto, userid: string): Promise<any> {
    const ref = 'SystemChargePool-' + new Date().getTime() + '1';
    const data = await this.orgPoolService.charge(
      getInfo.pool,
      Number(getInfo.amount),
      userid,
      getInfo.description,
      null,
      ref
    );
    if (!data) throw new InternalServerErrorException();

    const title = 'شارژ استخر توسط مدیریت';
    await this.orgPoolService.addHistory(getInfo.pool, userid, title);

    return successOpt();
  }

  async deduction(getInfo: BackofficePoolDeductionDto, userid: string): Promise<any> {
    const ref = 'SystemDeductionPool-' + new Date().getTime() + '1';
    const data = await this.orgPoolService.decharge(
      getInfo.pool,
      Number(getInfo.amount),
      userid,
      getInfo.description,
      null,
      ref
    );
    if (!data) throw new InternalServerErrorException();

    const title = 'کسر از استخر توسط مدیریت';
    await this.orgPoolService.addHistory(getInfo.pool, userid, title);

    return successOpt();
  }
}
