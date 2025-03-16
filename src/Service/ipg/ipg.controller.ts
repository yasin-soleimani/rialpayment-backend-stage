import { Controller, Get, Render, Body, Post } from '@vision/common';
import { IpgFactoryService } from './ipg.service';

@Controller('newIPG')
export class IpgFactoryController {
  constructor(private readonly ipgFactoryService: IpgFactoryService) {}

  @Post()
  @Render('NewIpg/main')
  async Payment(@Body() getInfo): Promise<any> {
    console.log(getInfo);
    return this.ipgFactoryService.getInformation(getInfo);
  }

  @Post('info')
  async getInfo(@Body() getInfo): Promise<any> {
    return this.ipgFactoryService.getIpgInfo(getInfo.terminalid);
  }
}
