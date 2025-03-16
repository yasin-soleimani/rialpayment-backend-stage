import { Controller, Post, Req, Body, Get } from '@vision/common';
import { SitadApiDto } from './dto/sitad-api.dto';
import { getUsernamPassword } from '@vision/common/utils/load-package.util';
import { SitadApiService } from './sitad.service';

@Controller('sitad')
export class SitadApiController {
  constructor(private readonly sitadapiService: SitadApiService) {}

  @Post()
  async getResult(@Req() req, @Body() getInfo: SitadApiDto): Promise<any> {
    const userpass = getUsernamPassword(req);
    return await this.sitadapiService.getInformation(getInfo, userpass.username, userpass.password, req);
  }
}
