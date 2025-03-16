import { Injectable } from '@vision/common';
import { PoolAddNewApiDto, PoolApiDto } from './dto/pool.dto';
import { PoolApiBalanceService } from './services/balance.service';
import { PoolApiCommonService } from './services/common.service';

@Injectable()
export class PoolApiService {
  constructor(
    private readonly balanceService: PoolApiBalanceService,
    private readonly commonService: PoolApiCommonService
  ) {}

  async charge(getInfo: PoolApiDto, userid: string): Promise<any> {
    return this.balanceService.charge(userid, getInfo);
  }

  async addNewPool(getInfo: PoolAddNewApiDto, userid: string): Promise<any> {
    return this.commonService.addNewPool(getInfo, userid);
  }

  async getPoolList(userid, page): Promise<any> {
    return this.commonService.PoolList(userid, page);
  }

  async getTurnOverList(poolid: string, userid: string, page: number): Promise<any> {
    return this.commonService.PoolTurnOverList(userid, poolid, page);
  }

  async udpateMinRemain(getInfo: PoolAddNewApiDto, userid: string): Promise<any> {
    return this.commonService.updateRemainPool(getInfo, userid);
  }
}
