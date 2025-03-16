import { Controller, Put, Req, Get, Post } from '@vision/common';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { GeneralService } from '../../Core/service/general.service';
import { UsercardDto } from './dto/usercard.dto';
import { CardService } from '../../Core/useraccount/card/card.service';
import { UsercardService } from './usercard.service';
import { Roles } from '../../Guard/roles.decorations';
import { ChargeCardsDto } from './dto/charge-cards.dto';
import { IpgParsianService } from '../../Core/ipg/services/parsian/parsian.service';

@Controller('usercard')
export class UsercardController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly cardService: CardService,
    private readonly usercardService: UsercardService,
    private readonly parsianService: IpgParsianService
  ) {}

  @Put('status')
  async updateComplete(@Body() getInfo: UsercardDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.cardService.changeStatus(getInfo.cardno, getInfo.status, userid, getInfo.password);
  }

  @Put('changepw')
  async changePassword(@Body() getInfo: UsercardDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.cardService.changePW(getInfo.cardno, getInfo.newpassword, userid, getInfo.password);
  }

  @Get('list')
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.cardService.getStatus(userid);
  }

  @Post('sendforgetpass')
  async forgetPassword(@Body() getInfo: UsercardDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.cardService.sendVerify(getInfo.cardno, userid);
  }

  @Post('checkcode')
  async checkcode(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.cardService.checkcode(getInfo.code, userid);
  }

  @Post('setpassword')
  async setpassword(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.cardService.activate(getInfo.code, getInfo.password, userid);
  }

  @Post('gensecpin')
  @Roles('agent', 'customerclub')
  async generateSecpin(@Body() getInfo, @Req() req): Promise<any> {
    const refid = await this.generalService.getUserid(req);
    const role = await this.generalService.getRole(req);
    return this.usercardService.generateSecpin(refid, getInfo.users, role);
  }

  @Post('giftcard')
  @Roles('agent', 'customerclub')
  async generateGiftCard(@Body() getInfo, @Req() req): Promise<any> {
    console.log(getInfo);
    const userid = await this.generalService.getUserid(req);
    return this.usercardService.generateGiftCard(getInfo.qty, userid, getInfo.group);
  }

  @Get('giftcard')
  @Roles('agent', 'customerclub')
  async giftcard(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const groupid = await this.generalService.getGID(req);
    return this.usercardService.getGiftCardList(userid, groupid, page);
  }

  @Post('charge')
  @Roles('agent', 'customerclub')
  async chargecard(@Body() getInfo: ChargeCardsDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.usercardService.chargeCard(getInfo, userid);
  }

  @Post('changepw')
  async changePass(@Body() getInfo): Promise<any> {
    return this.usercardService.changeCardPW(getInfo.group);
  }

  @Get('update')
  async updateCard(): Promise<any> {
    return this.usercardService.updateCard();
  }

  @Post('makecard')
  async makeCard(@Body() getInfo): Promise<any> {
    return this.usercardService.makeCard(getInfo.userid);
  }
}
