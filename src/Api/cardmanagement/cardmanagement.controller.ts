import { Controller, Get, Post, Put, Req, Body, Delete, Res } from '@vision/common';
import { CardmanagementService } from './cardmanagement.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GeneralService } from '../../Core/service/general.service';
import { CardmanagementcoreService } from '../../Core/cardmanagement/cardmanagementcore.service';
import { CardmanagementDto } from './dto/cardmanagement.dto';
import { getMerchantInfo } from 'src/WSDL/common/getMerchantInfo';
import { CardManagementUsercardDto } from './dto/cardmanagement-closeloop.dto';

@Controller('card')
export class CardmanagementController {
  constructor(
    private readonly authService: CardmanagementService,
    private readonly generalService: GeneralService,
    private readonly cardManagmentCore: CardmanagementcoreService,
    private readonly cardManagement: CardmanagementService
  ) {}

  @Post('management')
  async insertCard(@Body() cardManagmentDto: CardmanagementDto, @Req() req) {
    const userid = await this.generalService.getUserid(req);
    cardManagmentDto.user = userid;
    return this.cardManagement.registerCard(cardManagmentDto);
  }

  @Put('management')
  async updateCard(@Body() cardManagmentDto: CardmanagementDto, @Req() req) {
    const userid = await this.generalService.getUserid(req);
    cardManagmentDto.user = userid;
    return await this.cardManagmentCore.updateCard(cardManagmentDto);
  }

  @Delete('management')
  async deleteCard(@Req() req) {
    const userid = await this.generalService.getUserid(req);
    const cardno = this.cardManagement.checkDeleteHeader(req);
    return this.cardManagement.deleteCard(cardno, userid);
  }

  @Post('management/otp')
  async getOtp(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.getOtp(userid, getInfo.cardno);
  }

  @Get('management/info')
  async getCardInfo(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const cardno = await this.generalService.getCardno(req);
  }
  @Get('management')
  async getList(@Req() req) {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.getAllCardsList(userid);
  }

  @Post('management/changestatus')
  async changeCardStatus(@Body() getInfo: CardManagementUsercardDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.changeStatus(getInfo, userid);
  }

  @Post('management/sendforgetpass')
  async forgetPass(@Body() getInfo: CardManagementUsercardDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.sendForgetPassword(getInfo, userid);
  }

  @Post('management/checkcode')
  async checkCode(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.checkCode(getInfo, userid);
  }

  @Post('management/setpassword')
  async setPassword(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.setPassword(getInfo, userid);
  }

  @Put('management/setpassword')
  async setPutPassword(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.setPassword(getInfo, userid);
  }

  @Post('management/changepassword')
  async changePassword(@Body() getInfo: CardManagementUsercardDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.cardManagement.changePassword(getInfo, userid);
  }

  @Get('update')
  async update(): Promise<any> {
    this.cardManagement.registerAll();
  }
}
