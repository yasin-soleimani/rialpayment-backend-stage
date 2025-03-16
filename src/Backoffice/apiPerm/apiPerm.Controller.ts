import { Controller, Post, Body } from '@vision/common';
import { ApiPermDto } from './dto/apiPerm.dto';
import { ApiPermService } from './apiPerm.Service';

@Controller('apiperm')
export class ApiPermController {
  constructor(private readonly apiPermService: ApiPermService) {}

  @Post()
  async addAcl(@Body() getInfo: ApiPermDto): Promise<any> {
    return await this.apiPermService.newPermission(getInfo);
  }
}
