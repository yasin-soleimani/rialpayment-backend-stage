import { Controller, Post, Body, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { MemberService } from './member.service';

@Controller('member')
export class MemberController {
  constructor(private readonly generalService: GeneralService, private readonly memberService: MemberService) {}

  @Post('register')
  async register(@Body() getInfo, @Req() req): Promise<any> {
    const referer = req.headers.referer;
    return this.memberService.register(getInfo, referer);
  }

  @Post('auth')
  async authUser(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.memberService.authUser(getInfo, userid);
  }

  @Post('sms')
  async setSms(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.memberService.setUserSmsStatus(userid, getInfo.status);
  }
}
