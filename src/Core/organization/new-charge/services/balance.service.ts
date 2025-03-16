import { Injectable } from '@vision/common';
import { OrganizationNewChargeGetRemain } from '../function/get-last.func';
import { OrganizationNewChargeCoreCommonService } from './common.service';

@Injectable()
export class OrganizationNewChargeCoreBalanceService {
  constructor(private readonly commonService: OrganizationNewChargeCoreCommonService) { }

  async chargeCard(cardId: string, amount: number, refId: string, desc: string, poolId: string): Promise<any> {
    const query = { card: cardId, pool: poolId };
    const last = await this.commonService.getLastByQuery(query);
    const getRemain = OrganizationNewChargeGetRemain(last);
    const remain = getRemain + amount;
    return this.commonService.charge(refId, undefined, cardId, amount, 0, remain, desc, poolId);
  }

  async ChargeUser(userId: string, amount: number, refId: string, desc, poolId: string): Promise<any> {
    const query = { user: userId, pool: poolId };
    const last = await this.commonService.getLastByQuery(query);
    const getRemain = OrganizationNewChargeGetRemain(last);
    const remain = getRemain + Number(amount);

    return this.commonService.charge(refId, userId, undefined, amount, 0, remain, desc, poolId);
  }

  async dechargeCard(cardId: string, amount: number, refId, desc: string, poolId: string): Promise<any> {
    const query = { card: cardId, pool: poolId };

    const last = await this.commonService.getLastByQuery(query);
    const getRemain = OrganizationNewChargeGetRemain(last);

    if (getRemain < amount) return false;
    const remain = getRemain - Number(amount);

    return this.commonService.charge(refId, undefined, cardId, 0, amount, remain, desc, poolId);
  }

  async dechargeUser(userId: string, amount: number, refId: string, desc: string, poolId: string): Promise<any> {
    const query = { user: userId, pool: poolId };

    let last = await this.commonService.getLastByQuery(query);
    if (!last) {
      last = await this.commonService.getLastByQuery({ user: userId })
    }
    const getRemain = OrganizationNewChargeGetRemain(last);

    // if (getRemain < amount) return false;
    const remain = getRemain - Number(amount);

    return this.commonService.charge(refId, userId, undefined, 0, amount, remain, desc, poolId);
  }

  async getCardBalance(cardId: string): Promise<any> {
    return this.commonService.getLastByQuery({ card: cardId });
  }

  async getUserBalance(userId: string, poolId: string): Promise<any> {
    let remain = await this.commonService.getLastByQuery({ user: userId, pool: poolId });
    if (!remain) {
      remain = await this.commonService.getLastByQuery({ user: userId });
    }

    return remain;

  }

  async getBalanceByUserIdAndPoolId(userId: string, poolId: string): Promise<any> {
    return this.commonService.getLastByQuery({ user: userId, pool: poolId });
  }
}
