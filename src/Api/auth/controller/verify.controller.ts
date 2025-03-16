import { Controller, Get, Res, Post, Body, UseGuards } from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { ActivateDto } from '../dto/activate.dto';

@Controller('verifycode')
export class VerifyCodeController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  async verify(@Body() activateDto: ActivateDto): Promise<any> {
    return await this.userService.verifyForgetCode(activateDto);
  }
}
