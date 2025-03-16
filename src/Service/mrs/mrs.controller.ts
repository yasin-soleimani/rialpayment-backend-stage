import { Controller, successOptWithData, Post, Body } from '@vision/common';
import { UserService } from 'src/Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { ServiceMrsService } from './mrs.service';

@Controller('mrs')
export class ServiceMrsController {
  constructor(private readonly mrsService: ServiceMrsService) {}

  @Post('infobymobile')
  async getUserInfoByMobile(@Body() getInfo): Promise<any> {
    return this.mrsService.getUserInfoByMobile(getInfo.mobile);
  }

  @Post('setuseripg')
  async setUserIpg(@Body() getInfo): Promise<any> {
    return this.mrsService.setUSerTerminalIpg(getInfo);
  }
}
