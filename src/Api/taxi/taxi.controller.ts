import { Request, Response } from 'express';
import { Body, Controller, Get, Param, Post, Req, Res } from '@vision/common';
import { TaxiService } from './taxi.service';
import { GetTaxiInformationDto } from '../../Core/taxi/dto/taxi-get-information.dto';
import { TaxiPayDto } from '../../Core/taxi/dto/taxi-pay.dto';

@Controller('taxi')
export class TaxiContoller {
  constructor(private readonly taxiService: TaxiService) {}

  @Post('information')
  async getTaxiInformation(@Body() barcode: GetTaxiInformationDto, @Req() req: Request): Promise<any> {
    return this.taxiService.getTaxiInformation(barcode, req);
  }

  @Post('payment')
  async payTaxi(@Body() payInfo: TaxiPayDto, @Req() req: Request): Promise<any> {
    return this.taxiService.pay(payInfo, req);
  }

  @Post('payment/callback')
  async payTaxiCallback(@Body() payInfo: TaxiPayDto, @Res() req: Response): Promise<any> {
    return this.taxiService.inAppCallback(payInfo, req);
  }
  @Get('payment/list')
  async getPaymentInformation(@Req() req: Request): Promise<any> {
    return this.taxiService.getPaymentInformation(req);
  }

  @Get('payment/:id')
  async getPaymentInformationById(@Req() req: Request, @Param('id') id: string): Promise<any> {
    return this.taxiService.getPaymentInformationById(req, id);
  }
}
