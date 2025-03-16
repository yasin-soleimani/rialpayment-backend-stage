import { Controller, Get, Res, Post, Body, UseGuards, Render, Session, Req, Param, Query } from '@vision/common';
import { GetMipgDto } from './dto/get-mipg.dto';
import { MipgService } from './mipg.service';
import { ChargeService } from '../../Api/charge/charge.service';
import { MipgShaparakDto } from './dto/mipg-shaparak.dto';
import { async } from 'rxjs/internal/scheduler/async';
import { MipgServiceAuthService } from './service/auth.service';

@Controller('')
export class MipgController {
  constructor(
    private readonly mipgService: MipgService,
    private readonly mipgAuthService: MipgServiceAuthService,
    private readonly chargeService: ChargeService
  ) {}

  @Post()
  async create(@Body() getInfo: GetMipgDto, @Req() req): Promise<any> {
    return this.mipgService.validate(getInfo, req);
  }

  @Get('pay/:ref')
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
    return await this.mipgService.shaparakPay(ref, res);
  }

  @Post('pay')
  async postRedirect(@Body() getInfo, @Res() res): Promise<any> {
    return this.mipgService.shaparakPay(getInfo.invocieid, res);
  }

  @Post('pay/status')
  async verify(@Body() getInfo, @Req() req): Promise<any> {
    return this.mipgService.verify(getInfo.ref, getInfo.terminalid, req);
  }

  @Post('callback')
  @Render('IPG/callback')
  async checkout(@Body() getInfo: MipgShaparakDto): Promise<any> {
    return this.mipgService.callback(getInfo);
  }

  @Post('callback/parsian')
  @Render('IPG/callback')
  async checkoutParsian(@Body() getInfo): Promise<any> {
    return this.mipgService.callbackParsian(getInfo);
  }

  @Post('callback/persian/')
  @Render('IPG/callback')
  async checkoutPersian(@Body() getInfo, @Req() req, @Query('tr') tr): Promise<any> {
    getInfo.tr = tr;
    return this.mipgService.callbackPersian(getInfo, tr);
  }

  @Post('callback/saman')
  @Render('IPG/callback')
  async checkoutSaman(@Body() getInfo): Promise<any> {
    console.log(getInfo);
    return this.mipgService.callbackSaman(getInfo);
  }

  @Post('callback/pna')
  @Render('IPG/callback')
  async checkoutPna(@Body() getInfo): Promise<any> {
    console.log(getInfo);
    return this.mipgService.callbackPna(getInfo);
  }

  @Post('callback/behpardakht')
  @Render('IPG/behpardakht')
  async checkoutbehpardakht(@Body() getInfo): Promise<any> {
    console.log(getInfo);
    return this.mipgService.callbackBehpardakht(getInfo);
  }

  @Post('auth')
  @Render('auth/index')
  async mipgAuth(@Body() getInfo): Promise<any> {
    return this.mipgAuthService.getInfo(getInfo);
  }

  @Post('auth/validate')
  async checkValiate(@Body() getInfo): Promise<any> {
    return this.mipgAuthService.validat(getInfo);
  }

  @Post('auth/sendtoken')
  async sendTokenSms(@Body() getInfo): Promise<any> {
    return this.mipgAuthService.sendTokenSms(getInfo);
  }
}
