import { Injectable } from '@vision/common';
import { BackofficePoolChargeDto } from './dto/charge.dto';
import { BackofficePoolAddNewDto, BackofficePoolFilterDto } from './dto/pool.dto';
import { BackofficePoolBalanceService } from './services/balance.service';
import { BackofficePoolCommonService } from './services/common.service';
import { BackofficePoolSettingsService } from './services/settings.service';
import { BackofficePoolDeductionDto } from './dto/deduction.dto';

@Injectable()
export class BackofficePoolService {
  constructor(
    private readonly commonService: BackofficePoolCommonService,
    private readonly balanceService: BackofficePoolBalanceService,
    private readonly settingsService: BackofficePoolSettingsService
  ) {}

  async charge(getInfo: BackofficePoolChargeDto, userid: string): Promise<any> {
    return this.balanceService.charge(getInfo, userid);
  }

  async deduction(getInfo: BackofficePoolDeductionDto, userid: string): Promise<any> {
    return this.balanceService.deduction(getInfo, userid);
  }

  async getListPool(getInfo: BackofficePoolFilterDto, userid: string, page: number): Promise<any> {
    return this.commonService.getListPool(getInfo, userid, page);
  }

  async editPool(getInfo: BackofficePoolAddNewDto, userid: string): Promise<any> {
    return this.commonService.editPool(getInfo, userid);
  }

  async changeStatusPool(getInfo: BackofficePoolAddNewDto, userid: string): Promise<any> {
    return this.commonService.changeStatus(getInfo, userid);
  }

  async addNewPool(getInfo: BackofficePoolAddNewDto, userid: string): Promise<any> {
    return this.commonService.addNewPool(getInfo, userid);
  }

  async turnOverList(getInfo: BackofficePoolAddNewDto, userid: string, page: number): Promise<any> {
    return this.commonService.getTurnoverList(getInfo.id, page);
  }

  async getHistoryList(getInfo: BackofficePoolAddNewDto, page: number): Promise<any> {
    return this.commonService.getHistoryList(getInfo.id, page);
  }

  async setSettings(getInfo): Promise<any> {
    return this.settingsService.set(getInfo, getInfo.user);
  }
}
