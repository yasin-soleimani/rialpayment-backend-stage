import { Controller, Get, Req } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { CreditorSubjectApiService } from '../services/subject.service';

@Controller('creditor/subject')
export class CreditorSubjectApiController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly subjectService: CreditorSubjectApiService
  ) {}

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.subjectService.getListByUserId(userid, page);
  }
}
