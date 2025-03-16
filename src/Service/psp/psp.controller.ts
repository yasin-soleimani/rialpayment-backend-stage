import { Controller, Get, Res, Post, Body, UseGuards, Render, InternalServerErrorException, Req } from '@vision/common';
import { GetPspDto } from './dto/get-psp.dto';
import { PspService } from './psp.service';
import { getUsernamPassword } from '@vision/common/utils/load-package.util';

@Controller('psp')
export class PspController {
  constructor(private readonly pspService: PspService) {}

  @Post()
  async checkOpt(@Body() getpspDto: GetPspDto, @Req() req): Promise<any> {
    const Up = getUsernamPassword(req);
    getpspDto.Username = Up.username;
    getpspDto.Password = Up.password;
    return await this.pspService.operator(getpspDto);
  }

  @Post('byip')
  async getInfoByIp(@Body() getInfo): Promise<any> {
    return this.pspService.getPspInfoByIp(getInfo.ip);
  }

  @Get('autoReverse')
  async autoReverse(): Promise<any> {}
}
