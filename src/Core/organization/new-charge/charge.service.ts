import { Injectable } from '@vision/common';
import { OrganizationNewChargeCoreBalanceService } from './services/balance.service';
import { OrganizationNewChargeCoreCommonService } from './services/common.service';

@Injectable()
export class OrganizationNewChargeCoreService {
  constructor(
    private readonly commonService: OrganizationNewChargeCoreCommonService,
    private readonly balanceService: OrganizationNewChargeCoreBalanceService
  ) { }

  async getCardBalance(cardId: string, poolId: string): Promise<any> {
    return this.balanceService.getCardBalance(cardId);
  }

  async getUserBalance(userId: string, poolId: string): Promise<any> {
    return this.balanceService.getUserBalance(userId, poolId);
  }

  async getUserBalanceByPoolId(userId: string, poolId: string): Promise<any> {
    return this.balanceService.getBalanceByUserIdAndPoolId(userId, poolId);
  }

  async getList(query: any, page: number): Promise<any> {
    return this.commonService.getListByQuery(query, page);
  }

  async chargeCard(cardId: string, amount: number, refId: string, desc: string, poolId: string): Promise<any> {
    return this.balanceService.chargeCard(cardId, amount, refId, desc, poolId);
  }

  async chargeUser(userId: string, amount: number, refId: string, desc: string, poolId: string): Promise<any> {
    return this.balanceService.ChargeUser(userId, amount, refId, desc, poolId);
  }

  async dechargeCard(cardId: string, amount: number, refId: string, desc: string, poolId: string): Promise<any> {
    return this.balanceService.dechargeCard(cardId, amount, refId, desc, poolId);
  }

  async dechargeUser(userId: string, amount: number, refId: string, desc: string, poolId: string): Promise<any> {
    return this.balanceService.dechargeUser(userId, amount, refId, desc, poolId);
  }

  async getPoolsByUserId(userId: string): Promise<any> {
    return this.commonService.getPoolsByUserId(userId)
  }

  async getPoolsByCardId(cardId: string): Promise<any> {
    return this.commonService.getPoolsByUserId(cardId);
  }

}
