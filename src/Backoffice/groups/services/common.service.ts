import { Injectable } from '@vision/common';
import { GroupCoreService } from '../../../Core/group/group.service';

@Injectable()
export class GroupsCommonBackofficeService {
  constructor(private readonly groupService: GroupCoreService) {}

  async getList(userid: string): Promise<any> {
    return this.groupService.getAll(userid);
  }
}
