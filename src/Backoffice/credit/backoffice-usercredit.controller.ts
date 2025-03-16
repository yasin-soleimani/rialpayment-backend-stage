import { Controller, Body, Req, Get, CreditChargeStatusEnums, successOpt, Post } from '@vision/common';
import { BackofficeUserCreditDto } from './dto/backoffice-usercredit.dto';
import { GeneralService } from '../../Core/service/general.service';
import { UserCreditCoreService } from '../../Core/credit/usercredit/credit-core.service';

@Controller('usercredit')
export class BackofficeUserCreditController {
  constructor(private readonly generalService: GeneralService, private readonly creditService: UserCreditCoreService) {}

  @Post()
  async addCredit(@Body() getInfo: BackofficeUserCreditDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.creditService.chargeUserCredit(
      getInfo.user,
      getInfo.amount,
      getInfo.start,
      getInfo.months,
      CreditChargeStatusEnums.Transferable
    );
  }
}
