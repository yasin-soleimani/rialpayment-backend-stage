import { Controller, Get, Post, Body, Render, Req, Param, Res, Query } from '@vision/common';
import { GetChargeDto } from './dto/get-charge.dto';
import { ChargeService } from './charge.service';
import { GeneralService } from '../../Core/service/general.service';
import { ChargeDetailsDto } from './dto/charge-details.dto';
import { SimcardChargeServcie } from '../../Core/simcard/services/charge.service';
import { SimcardChargeDto, SimcardChargeQpinDto } from './dto/simcard.dto';
import { IpgParsianDto } from './dto/parsian.details.dto';
import { ChargeRfidService } from './services/charge-rfid.service';
import { ChargeIpgApiService } from './services/charge-ipg.service';
import { GetMipgChargeDto } from './dto/mipg-api.dto';
import { GroupCoreService } from '../../Core/group/group.service';
import { SimcardOperatorIdEnum } from './constants/simcard-operator-id.enum';
import { ApiSimcardService } from './simcard.service';
import { Request } from 'express';
import { PurchaseSimcardPackageDto } from './dto/buy-simcard-package.dto';

@Controller('payment')
export class ChargeController {
  constructor(
    private readonly chargeService: ChargeService,
    private readonly generalService: GeneralService,
    private readonly chargeRfidService: ChargeRfidService,
    private readonly groupCharge: GroupCoreService,
    private readonly ipgApiService: ChargeIpgApiService,
    private readonly simcardService: SimcardChargeServcie,
    private readonly apiSimcardService: ApiSimcardService
  ) {}

  @Post()
  async create(@Body() getInfo: GetChargeDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const referer = req.headers.referer;
    return this.ipgApiService.newReq(getInfo, userid, referer);
  }

  @Get('redirect/:ref')
  // @Render('Charge/charge')
  async redirect(@Param('ref') ref, @Req() req, @Res() res): Promise<any> {
    const protocol = req.protocol;
    let host = req.hostname;
    const url = req.originalUrl;
    if (!!host && !host.includes('sharjjet.ir')) {
      console.log('in redirect:::::::: ');
      let ex = host.split('.');
      ex[ex.length - 2] = 'sharjjet';
      host = ex.join('.');
      const fullUrl = `https://${host}${url}`;
      res.redirect(301, fullUrl);
      res.end();
      return;
    }
    return await this.ipgApiService.redirect(ref, res);
  }

  @Post('callback')
  @Render('Charge/callback')
  async callbackurl(@Body() chargeDetailsDto: ChargeDetailsDto): Promise<any> {
    return await this.chargeService.updateDetails(chargeDetailsDto);
  }

  @Post('callback/parsian')
  @Render('Charge/callback')
  async callbackurlParsian(@Body() chargeDetailsDto: IpgParsianDto): Promise<any> {
    return await this.chargeService.updateDetailsParsian(chargeDetailsDto);
  }

  @Post('callback/persian')
  @Render('Charge/callback')
  async callbackurlPersian(@Body() chargeDetailsDto, @Query('tr') transactionId): Promise<any> {
    chargeDetailsDto.tr = transactionId;
    return await this.chargeService.updateDetailsPersian(chargeDetailsDto);
  }

  @Post('callback/saman')
  @Render('Charge/callback')
  async callbackurlsaman(@Body() chargeDetailsDto): Promise<any> {
    return this.chargeService.updateDetailsSaman(chargeDetailsDto);
  }

  @Post('callback/behpardakht')
  @Render('Charge/callback')
  async callbackurlbehpardakht(@Body() chargeDetailsDto): Promise<any> {
    console.log(chargeDetailsDto, 'chargeDetailsDto');
    return this.chargeService.updateDetailsBehpardakht(chargeDetailsDto);
  }

  @Post('callback/pna')
  @Render('Charge/callback')
  async callbackurlPna(@Body() getInfo): Promise<any> {
    return this.chargeService.updateDetailsPna(getInfo);
  }

  @Post('safebox')
  async chargeSafebox(@Body() chargeDetailsDto: ChargeDetailsDto): Promise<any> {}

  @Post('simcard')
  async chargeSimcard(@Body() getInfo: SimcardChargeDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.simcardService.reqCharge(getInfo, userid);
  }

  @Post('simcard/recharge')
  async chargeSimcardQpin(@Body() getInfo: SimcardChargeQpinDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.apiSimcardService.rechargeSimcard(getInfo, userid);
  }

  @Get('simcard/packageCategories')
  async getSimcardPackageCategories(
    @Query('mobileOperatorId') mobileOperatorId: SimcardOperatorIdEnum,
    @Req() req: Request
  ): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.apiSimcardService.getSimcardPackageCategories(mobileOperatorId, userid);
  }

  @Get('simcard/packages')
  async getSimcardPackage(@Query('categoryCode') categoryCode: number, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.apiSimcardService.getSimcardPackages(categoryCode, userid);
  }

  @Post('simcard/package/submit')
  async submitSimcardPackage(@Body() body: PurchaseSimcardPackageDto, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.apiSimcardService.buySimcardPackage(body, userid);
  }

  @Post('charge/organization')
  async chargeOrganization(@Body() getInfo: any, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);

    return this.groupCharge.newOrganizationCharge(getInfo, userid);
  }

  @Post('charge/rfid')
  async chargeRfidCard(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.chargeRfidService.chargeRfid(getInfo, userid);
  }

  @Post('test/ttt')
  async getOrgan(@Body() getInfo, @Res() res): Promise<any> {
    return this.simcardService.testLimit(getInfo.user);
  }

  // TODO remove this scop
  @Post('today')
  async getTotal(@Body() getInfo): Promise<any> {
    return this.chargeService.todayTotal(getInfo.user);
  }

  @Post('tts')
  async tts(@Body() getInfo: GetMipgChargeDto, @Req() req): Promise<any> {
    // const userid = await this.generalService.getUserid( req );
    getInfo.invoiceid = '32432';
    const referer = req.headers.referer;
    return this.ipgApiService.newReq(getInfo, null, referer);
  }
}
