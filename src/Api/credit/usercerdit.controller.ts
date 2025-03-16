import { Controller, Get, Post, Body } from '@vision/common';
import { Req } from '@vision/common/decorators/http/route-params.decorator';
import { GeneralService } from '../../Core/service/general.service';
import { MemberCreditService } from './usercredit.service';
import { getTypeFromHeader } from '@vision/common/utils/load-package.util';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Controller('membercredit')
export class MemberCreditControlller {
  constructor(
    private readonly generalService: GeneralService,
    private readonly userCreditService: MemberCreditService
  ) {}

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const type = getTypeFromHeader(req);
    return await this.userCreditService.getList(userid, page, type);
  }

  @Post('details')
  async getDetails(@Body() getInfo, @Req() req): Promise<any> {
    if (isEmpty(getInfo.invoiceid)) throw new FillFieldsException();
    const data = await this.userCreditService.getDetails(getInfo.invoiceid);
    return data;
  }
}
