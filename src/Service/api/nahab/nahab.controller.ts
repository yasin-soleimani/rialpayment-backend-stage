import { Controller, Post, Req } from '@vision/common';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { getUsernamPassword } from '@vision/common/utils/load-package.util';
import { NahabService } from './nahab.service';

@Controller('nahab')
export class NahabController {
  constructor(private readonly nahabService: NahabService) {}

  @Post()
  async getInfo(@Body() getInfo, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);
    return this.nahabService.getInfo(getInfo.pan, userpass.username, userpass.password, req);
  }
}
