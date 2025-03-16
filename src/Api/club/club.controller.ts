import { Controller, Post, Get, Body, Req } from '@vision/common';
import { CustomerClubService } from './club.service';
import { ClubDto } from './dto/club.dto';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { async } from 'rxjs/internal/scheduler/async';
import { Request } from 'express';

@Controller('club')
export class CustomerClubController {
  constructor(private readonly clubApiService: CustomerClubService, private readonly generalService: GeneralService) {}

  // Add new CustomerClub
  @Post()
  @Roles('agent')
  async submitNewClub(@Body() getInfo: ClubDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.ref = userid;
    return this.clubApiService.submitNewClub(getInfo);
  }

  @Get()
  @Roles('agent', 'customerclub', 'clubmanager')
  async getClubList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.clubApiService.getClubLists(userid, page);
  }

  @Get('remain')
  @Roles('customerclub')
  async getClubRemain(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.clubApiService.getClubRemain(userid);
  }

  @Get('details')
  @Roles('agent', 'customerclub', 'clubmanager')
  async getClubDetails(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const clubid = await this.generalService.getID(req);
    return this.clubApiService.getClubDetails(userid, clubid);
  }

  // Get Details & Total Amount of Customer Club
  @Post('getclubprice')
  @Roles('agent')
  async getClubPrice(@Body() getInfo: ClubDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.ref = userid;
    console.log(getInfo);
    return this.clubApiService.getClubPrice(getInfo);
  }

  // change customer club
  @Post('status')
  @Roles('agent')
  async changeStatus(@Body() getInfo: ClubDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.ref = userid;
  }

  @Get('info')
  @Roles('agent', 'customerclub')
  async clubInfo(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
  }

  @Post('upload/logo')
  @Roles('agent', 'customerclub')
  async uplaodLogo(@Body() getInfo, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.clubApiService.uploadLogo(getInfo.clubid, req);
  }

  // get Prices
  @Get('price')
  @Roles('agent')
  async getPrice(@Req() req): Promise<any> {
    await this.generalService.getUserid(req);
    return this.clubApiService.getPrice();
  }

  @Get('terminals')
  @Roles('agent')
  async getTerminals(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const clubid = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);
    return this.clubApiService.getTerminalsList(clubid, page);
  }
}
