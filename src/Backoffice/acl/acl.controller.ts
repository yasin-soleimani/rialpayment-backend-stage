import { Controller, Get, Post, Body, successOptWithDataNoValidation } from '@vision/common';
import { AcelBackOfficeDto } from './dto/acl.dto';
import { AclBackOfficeService } from './acl.service';
import { Roles } from '../../Guard/roles.decorations';
import { AclModuleList } from './const/acl.const';

@Controller('acl')
export class AclBackOfficeController {
  constructor(private readonly aclService: AclBackOfficeService) {}

  @Post()
  @Roles('admin')
  async addAcl(@Body() getInfo: AcelBackOfficeDto): Promise<any> {
    return await this.aclService.newPermission(getInfo);
  }

  @Get()
  @Roles('admin')
  async getModuleLists(): Promise<any> {
    return successOptWithDataNoValidation(AclModuleList);
  }
}
