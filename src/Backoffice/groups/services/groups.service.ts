import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { GroupsCommonBackofficeService } from './common.service';

@Injectable()
export class GroupsBackofficeService {
  constructor(private readonly commonService: GroupsCommonBackofficeService) {}

  async getAllListByUserId(userid: string): Promise<any> {
    const data = await this.commonService.getList(userid);
    return successOptWithDataNoValidation(data);
  }
}
