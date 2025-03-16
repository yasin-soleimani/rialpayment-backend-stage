import { Injectable } from '@vision/common';
import { CoreGiftCardSettingsCommonService } from './common.service';

@Injectable()
export class CoreGiftCardSettingsService {
  constructor(private readonly commonService: CoreGiftCardSettingsCommonService) {}

  async addNew(userId: string, groupId: string, price: number, discount: number): Promise<any> {
    return this.commonService.addNew(userId, groupId, price, discount);
  }

  async edit(id: string, userId: string, groupId: string, price: number, discount: number): Promise<any> {
    return this.commonService.edit(id, userId, groupId, price, discount);
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.commonService.changeStatus(id, status);
  }

  async getListService(): Promise<any> {
    return this.commonService.getListService();
  }

  async getSettingByGroupId(groupId: string): Promise<any> {
    return this.commonService.getSettingByGroupId(groupId);
  }
}
