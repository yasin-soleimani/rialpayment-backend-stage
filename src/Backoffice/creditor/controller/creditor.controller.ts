import { Controller, Get, Req, Post, Body } from '@vision/common';
import { Roles } from '../../../Guard/roles.decorations';
import { GeneralService } from '../../../Core/service/general.service';
import { CreditorBackofficeService } from '../services/creditor.service';

@Controller('creditor/details')
export class CreditorBackofficeController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly creditorService: CreditorBackofficeService
  ) {}

  @Get()
  @Roles('admin')
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const id = await this.generalService.getID(req);

    return this.creditorService.getList(id, page);
  }

  @Post()
  @Roles('admin')
  async addNew(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.creditorService.addNew(getInfo);
  }

  @Post('delete')
  @Roles('admin')
  async delete(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.creditorService.delete(getInfo);
  }

  @Post('status')
  @Roles('admin')
  async changeStatus(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.creditorService.changeStatus(getInfo);
  }
}
