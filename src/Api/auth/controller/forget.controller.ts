import { Controller, Get, Res, Post, Body, UseGuards } from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { ActivateDto } from '../dto/activate.dto';

@Controller('getforgetcode')
export class ForgetController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  async forget(@Body() activateDto: ActivateDto): Promise<any> {
    return this.userService.getForgetcode(activateDto);
  }
}
