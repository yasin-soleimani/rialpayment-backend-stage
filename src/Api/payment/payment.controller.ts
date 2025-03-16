import { Controller, Post, Req, Body, Get, Param } from '@vision/common';
import { PaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';
import { GeneralService } from '../../Core/service/general.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { NewQrPaymentService } from './services/new-qr-payment.service';
import { NewPaymentService } from './services/new-payment.service';
import { PaymentGenerateQrService } from './services/genarate-qr.service';
import { PaymentOrganizationService } from './services/payment-organization.service';
import { PaymentInformationApiService } from './services/info.service';
import { getTokenIpg } from '../nationalInsurance/functions/payment.function';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly generalService: GeneralService,
    private readonly newPaymentService: NewPaymentService,
    private readonly qrService: NewQrPaymentService,
    private readonly qrGenService: PaymentGenerateQrService,
    private readonly organService: PaymentOrganizationService,
    private readonly infoService: PaymentInformationApiService
  ) {}

  @Post('getinfo')
  async getInfo(@Body() paymentDto: PaymentDto, @Req() req) {
    const userid = await this.generalService.getUserid(req);
    return await this.paymentService.getInfo(paymentDto, userid);
  }

  @Post('confirm')
  async updateCard(@Body() paymentDto: PaymentDto, @Req() req) {
    const userid = await this.generalService.getUserid(req);
    if (isEmpty(paymentDto.type)) {
      paymentDto.type = 2;
    }
    return await this.paymentService.confirmPayment(paymentDto, userid);
  }

  @Post('voucher')
  async getVoucherRemain(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.qrService.getRemain(getInfo.barcode, userid);
  }

  @Post('submit')
  async submitPayment(@Body() getInfo: PaymentDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    console.log(getInfo, 'getInfo');
    return this.newPaymentService.submit(getInfo, userid);
  }

  @Get('qr')
  async generateQr(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.qrGenService.newQr(userid);
  }

  @Get('organization')
  async getOrganizationList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const groupid = await this.generalService.getGID(req);
    return this.organService.getList(userid, page);
  }

  @Post('destinationinfo')
  async check(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.infoService.play(getInfo.query);
  }

  @Get('organization/store')
  async getOrganizationDetails(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const id = await this.generalService.getID(req);
    return this.organService.getDetails(userid, id, page);
  }

  @Get('terminalId/:terminalId')
  async getDetailsWithTerminalId(@Req() req: Request, @Param('terminalId') terminalId: string): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.paymentService.checkTerminalId(terminalId, req);
  }
}
