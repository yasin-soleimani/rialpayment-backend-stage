import { Controller, Post, Body, Req } from '@vision/common';
import { AsnafApiService } from './asnaf.service';
import { getUsernamPassword } from '@vision/common/utils/load-package.util';

@Controller('asnaf')
export class AsnafApiController {
  constructor(private readonly asnalService: AsnafApiService) {}

  @Post()
  async getAsnaf(@Body() getInfo, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);
    return this.asnalService.play(userpass.username, userpass.password, getInfo.idcode, req);
  }
}
