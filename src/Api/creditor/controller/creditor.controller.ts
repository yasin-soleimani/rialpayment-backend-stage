import { Controller, Get, Req } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { CreditorApiService } from '../services/creditor.service';

@Controller('creditor/details')
export class CreditorApiController {
  constructor(private readonly generalService: GeneralService, private readonly creditorService: CreditorApiService) {}

  @Get('test')
  async getTest(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.creditorService.getInfo(id, userid);
  }
  @Get()
  async getInfo(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.creditorService.getInfo(id, userid);
  }
}
