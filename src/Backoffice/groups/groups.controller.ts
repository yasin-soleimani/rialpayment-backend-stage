import { Controller, Get, Req } from '@vision/common';
import { Roles } from '../../Guard/roles.decorations';
import { GeneralService } from '../../Core/service/general.service';
import { GroupsBackofficeService } from './services/groups.service';

@Controller('groups')
export class GroupsBackofficeController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly groupService: GroupsBackofficeService
  ) {}

  @Get('user')
  @Roles('admin')
  async getListOfUserGroups(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.groupService.getAllListByUserId(id);
  }
}
