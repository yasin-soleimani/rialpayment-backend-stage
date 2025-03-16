import { Injectable, successOptWithPagination } from '@vision/common';
import { OrganizationNewChargeCoreService } from '../../../Core/organization/new-charge/charge.service';

@Injectable()
export class HistoryApiOrganizationService {
  constructor(private readonly orgService: OrganizationNewChargeCoreService) { }

  async getHistory(userid: string, page: number): Promise<any> {
    const query = { user: userid, in: { $gt: 0 } };
    console.log(query, 'query');
    const data = await this.orgService.getList(query, page);
    console.log(data, 'data');

    return successOptWithPagination(data);
  }

  async getTts(userId: string): Promise<any> {
    return this.orgService.getPoolsByUserId(userId);
  }
}
