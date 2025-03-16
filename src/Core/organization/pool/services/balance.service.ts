import { Injectable } from '@vision/common';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { OrganizationPoolRemainFunc } from '../function/remain.func';
import { OrganizationPoolCoreCommonService } from './common.service';

@Injectable()
export class OrganizationPoolCoreBalanceService {
  constructor(private readonly commonService: OrganizationPoolCoreCommonService) {}

  async charge(pool: string, amount: number, userid: string, desc: string, card: string, ref: string): Promise<any> {
    const last = await this.commonService.getLastTurnOver(pool);
    const remain = OrganizationPoolRemainFunc(last, amount);

    return this.commonService.submitTurnover(userid, pool, amount, 0, remain, desc, card, ref);
  }

  async decharge(pool: string, amount: number, userid: string, desc: string, card: string, ref: string): Promise<any> {
    const last = await this.commonService.getLastTurnOver(pool);
    if (!last) throw new notEnoughMoneyException();

    if (Number(amount) > last.remain) throw new UserCustomException('موجودی ناکافی');
    const remain = last.remain - Number(amount);

    return this.commonService.submitTurnover(userid, pool, 0, amount, remain, desc, card, ref);
  }
}
