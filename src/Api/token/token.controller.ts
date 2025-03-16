import { Body, Controller, Get, Post, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { TokenApiService } from './token.service';

@Controller('token')
export class TokenApiController {
  constructor(private readonly generalService: GeneralService, private readonly tokenService: TokenApiService) {}

  @Get('list')
  async getList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const token = req.header('Authorization').split(' ');
    return this.tokenService.getList(userId, page, token[1]);
  }

  @Get('terminateall')
  async terminateAll(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const token = req.header('Authorization').split(' ');
    return this.tokenService.terminateAll(userId, token[1]);
  }

  @Post('disable')
  async disable(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.tokenService.disable(userId, getInfo.id);
  }
}
