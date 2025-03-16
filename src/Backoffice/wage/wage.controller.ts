import { Controller, Get, Post, Body } from '@vision/common';
import { BackOfficeWageService } from './wage.service';
import { Req } from '@vision/common/decorators/http/route-params.decorator';
import { GeneralService } from '../../Core/service/general.service';

@Controller('wage')
export class BackofficeWageController {
  constructor(private readonly wageService: BackOfficeWageService, private readonly generalService: GeneralService) {}

  @Get()
  async getAll(): Promise<any> {
    return this.wageService.getAllIPg();
  }

  @Get('ipg/last')
  async getIpgLast(): Promise<any> {
    return this.wageService.getLastIpg();
  }

  @Get('webservice')
  async getWebserviceWage(): Promise<any> {
    return this.wageService.getCashout();
  }

  @Get('remove')
  async remove(): Promise<any> {
    return this.wageService.getRemove();
  }

  @Get('psp')
  async getPsp(): Promise<any> {
    return this.wageService.getPsp();
  }
  @Post()
  async getFilter(@Body() getInfo, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.wageService.getFilter(getInfo, page);
  }
}
