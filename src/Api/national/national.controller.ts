import { Controller, Post, Body, Req, Get, Put } from '@vision/common';
import { NationalApiService } from './national.service';
import { NationalApiDto } from './dto/national.dto';
import { GeneralService } from '../../Core/service/general.service';

@Controller('national')
export class NationalController {
  constructor(private readonly nationalService: NationalApiService, private readonly generalService: GeneralService) {}

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.nationalService.getList(userid, page);
  }

  @Post()
  async submitNew(@Body() getInfo: NationalApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.ref = userid;
    return this.nationalService.submit(getInfo);
  }

  @Put()
  async update(@Body() getInfo: NationalApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    getInfo.id = id;
    return this.nationalService.update(getInfo, userid);
  }

  @Post('img')
  async updateImg(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.nationalService.uploadImg(getInfo, req, userid);
  }

  @Post('status')
  async changeStatus(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.nationalService.changeStatus(getInfo.id, getInfo.status, getInfo.description, userid);
  }
}
