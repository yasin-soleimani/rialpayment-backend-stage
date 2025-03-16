import { Controller, Post, Body, Req, Put } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { ActivateDto } from '../dto/activate.dto';

@Controller('newpassword')
export class NewPasswordController {
  constructor(private readonly userService: UserService, private readonly generalService: GeneralService) {}

  @Post('')
  async newpassword(@Body() activateDto: ActivateDto): Promise<any> {
    return await this.userService.newPassword(activateDto);
  }

  @Put('change')
  async changePassword(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const token = req.header('Authorization').split(' ');
    return this.userService.changePassword(userId, getInfo.password, getInfo.newpassword, token[1]);
  }
}
