import { Controller, InternalServerErrorException, Post, Req } from '@vision/common';
import { BackofficeAccountService } from './account.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BackofficeAccountDto } from './dto/account.dto';
import { OperationAccountType } from './common/operationType.const';
import { Roles } from '../../Guard/roles.decorations';
import { Request } from 'express';

@Controller('account')
export class BackofficeAccountController {
  constructor(private readonly accountService: BackofficeAccountService) {}

  @Post()
  @Roles('admin')
  async opt(@Body() getInfo: BackofficeAccountDto, @Req() req: Request): Promise<any> {
    switch (Number(getInfo.type)) {
      case OperationAccountType.charge: {
        return this.accountService.Charge(getInfo.userid, getInfo.amount, getInfo.description);
      }

      case OperationAccountType.decharge: {
        return this.accountService.deCharge(getInfo.userid, getInfo.amount, getInfo.description);
      }

      default:
        throw new InternalServerErrorException();
    }
  }
}
