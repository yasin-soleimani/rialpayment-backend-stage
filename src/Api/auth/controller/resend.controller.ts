import { Controller, Get, Res, Post, Body, UseGuards } from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { ActivateDto } from '../dto/activate.dto';

@Controller('resendactive')
export class ResendController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  async login(@Body() activateDto: ActivateDto): Promise<any> {
    return this.userService.resendActivation(activateDto);
  }
}
