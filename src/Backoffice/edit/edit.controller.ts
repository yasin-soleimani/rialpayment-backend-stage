import { Controller, Post, Get, Body, Req } from '@vision/common';
import { BackofficeEditDto } from './dto/edit.dto';
import { BackofficeEditService } from './edit.service';
import { GeneralService } from '../../Core/service/general.service';

@Controller('useredit')
export class BackofficeEditController {
  constructor(private readonly mainService: BackofficeEditService, private readonly generalService: GeneralService) {}

  @Post()
  async getInfo(@Body() getInfo: BackofficeEditDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.userid = userid;
    return this.mainService.getInfo(getInfo);
  }

  @Post('changemobile')
  async changeUserMobile(@Body() getInfo: BackofficeEditDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.userid = userid;
    return this.mainService.changeUserMobile(getInfo);
  }

  @Post('changebirthdate')
  async changeBirthdate(@Body() getInfo: BackofficeEditDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.userid = userid;
    return this.mainService.changeBirthdate(getInfo);
  }

  @Post('changecardno')
  async changeCardno(@Body() getInfo: BackofficeEditDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.userid = userid;
    return this.mainService.changeCard(getInfo);
  }
}
