import { Controller, Post, Req } from '@vision/common';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BackofficeLoginDto } from './dto/login.dto';
import { BackofficeAuthService } from './auth.service';

@Controller('auth')
export class BackofficeAuthController {
  constructor(private readonly authService: BackofficeAuthService) {}

  @Post('login')
  async login(@Body() getInfo: BackofficeLoginDto, @Req() req): Promise<any> {
    return this.authService.login(getInfo, req);
  }

  @Post('login/verify')
  async verify(@Body() getInfo: BackofficeLoginDto, @Req() req): Promise<any> {
    return this.authService.verify(getInfo, req);
  }
}
