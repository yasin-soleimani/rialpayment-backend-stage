import { Controller, Post, Body } from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { ActivateDto } from '../dto/activate.dto';
import { GeneralService } from '../../../Core/service/general.service';
import { ClubCoreService } from '../../../Core/customerclub/club.service';

@Controller('activeuser')
export class ActiveuserController {
  constructor(
    private readonly userService: UserService,
    private readonly generalService: GeneralService,
    private readonly clubService: ClubCoreService
  ) {}

  @Post('')
  async activeuser(@Body() actrivateDto: ActivateDto): Promise<any> {
    const activeUser = await this.userService.activateUser(actrivateDto);

    const user = await this.userService.findByMobile(actrivateDto.mobile);
    const clubInfo = await this.clubService.getClubInfoByOwner(user.ref);
    console.log('clubinfo::::::::::::::::::: ', clubInfo);
    if (clubInfo) {
      const msg =
        'به ' +
        clubInfo.title +
        '  خوش آمدید \n' +
        'جهت کسب اطلاعات بیشتر به آدرس ذیل مراجعه نمایید \n' +
        '' +
        clubInfo.clubinfo.website +
        ' \n' +
        'پشتیبانی: ' +
        '\n' +
        `0${clubInfo.clubinfo.tell}`;

      this.generalService.AsanaksendSMS('', '', '', '0' + user.mobile.toString(), msg);
    }

    return activeUser;
  }
}
