import { Controller, Post, Get, Req, Body } from '@vision/common';
import { Roles } from '../../Guard/roles.decorations';
import { GeneralService } from '../../Core/service/general.service';
import { IpgBackofficeService } from './ipg.service';
import { IpgListBackofficeDto } from './dto/ipg-list.dto';

@Controller('Ipg')
export class IpgBackofficeController {
  constructor(private readonly generalService: GeneralService, private readonly ipgService: IpgBackofficeService) {}

  @Post()
  @Roles('agent')
  async addNewIpg(@Body() getInfo: IpgListBackofficeDto): Promise<any> {
    return this.ipgService.addNew(getInfo);
  }

  @Get()
  @Roles('agent')
  async getIpgList(@Req() req): Promise<any> {
    return this.ipgService.getList();
  }
}
