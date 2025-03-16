import { Injectable, Post, Controller, Body, Req, Put, Get } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { Roles } from '../../../Guard/roles.decorations';
import { CreditorSubjectBackofficeService } from '../services/subject.service';

@Controller('creditor/subject')
export class CreditorSubjectBackofficeController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly subjectService: CreditorSubjectBackofficeService
  ) {}

  @Get()
  @Roles('admin')
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);

    const page = await this.generalService.getPage(req);
    const id = await this.generalService.getID(req);
    return this.subjectService.getList(id, page);
  }

  @Post()
  @Roles('admin')
  async assNew(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.subjectService.addNew(getInfo, userid);
  }

  @Post('delete')
  @Roles('admin')
  async delete(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.subjectService.delete(getInfo);
  }

  @Post('status')
  @Roles('admin')
  async changeStatus(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.subjectService.changeStatus(getInfo);
  }
}
