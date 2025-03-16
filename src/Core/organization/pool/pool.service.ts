import { Injectable } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GroupCoreService } from '../../../Core/group/group.service';
import { OrganizationPoolCoreBalanceService } from './services/balance.service';
import { OrganizationPoolCoreCommonService } from './services/common.service';

@Injectable()
export class OrganizationPoolCoreService {
  constructor(
    private readonly commonService: OrganizationPoolCoreCommonService,
    private readonly balanceService: OrganizationPoolCoreBalanceService,
  ) { }

  // Balance Opt
  async charge(pool: string, amount: number, userid: string, desc: string, card: string, ref: string): Promise<any> {
    return this.balanceService.charge(pool, amount, userid, desc, card, ref);
  }

  async decharge(pool: string, amount: number, userid: string, desc: string, card: string, ref: string): Promise<any> {
    return this.balanceService.decharge(pool, amount, userid, desc, card, ref);
  }

  // Pool Operation
  async getPoolInfo(id: string): Promise<any> {
    return this.commonService.getPoolInfo(id);
  }

  async getListPool(query: any, page: number): Promise<any> {
    return this.commonService.listPool(query, page);
  }
  async addPool(groups: any, title: string, userid: string, minremain: number): Promise<any> {
    for (const item of groups) {
      const group = await this.commonService.getPoolInfoByGroupId(item);
      if (group) {
        const message = ' برای ' + group.title + ' استخر پول ساخته شده است ';
        throw new UserCustomException(message, false, 500);
      }
    }
    return this.commonService.addPool(groups, userid, title, minremain);
  }

  async changeStatusPool(id: string, status: boolean): Promise<any> {
    return this.commonService.changeStatus(id, status);
  }

  async editPool(id: string, title: string, minremain: number): Promise<any> {
    return this.commonService.editPool(id, title, minremain);
  }

  async updateMinRemain(id: string, minremain: number): Promise<any> {
    return this.commonService.updatePoolMinRemain(id, minremain);
  }

  async updateSettingsQuery(id: string, query: any): Promise<any> {
    return this.commonService.updatePoolSettingsQuery(id, query);
  }

  async getPoolInfoByGroupId(groupid: string): Promise<any> {
    return this.commonService.getPoolInfoByGroupId(groupid);
  }

  // History
  async getListHistory(query: any, page: number): Promise<any> {
    return this.commonService.listHistory(query, page);
  }
  async addHistory(pool: string, userid: string, desc: string): Promise<any> {
    return this.commonService.addHistory(pool, userid, desc);
  }

  async changeVisibleHistory(id: string, visible: boolean): Promise<any> {
    return this.commonService.changeHistoryVisibility(id, visible);
  }

  // turnover Opt
  async getListTurnOver(query: any, page: number): Promise<any> {
    return this.commonService.listTurnOver(query, page);
  }

  async getLastTurnOver(pool: string): Promise<any> {
    return this.commonService.getLastTurnOver(pool);
  }
}
