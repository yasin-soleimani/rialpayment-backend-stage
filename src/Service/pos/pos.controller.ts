import { Controller, Post, Body } from '@vision/common';
import { PosValidateServiceDto } from './dto/validate.dto';
import { PosService } from './pos.service';
import { PosPayRequestDto } from './dto/pay-req.dto';
import { PosScanQrDto } from './dto/scan-qr.dto';
import { NewQrPaymentService } from '../../Api/payment/services/new-qr-payment.service';
import { PosReportService } from './services/report.service';
import { PosPayReportDto } from './dto/pay-report.dto';
import { PosRegisterUserDto } from './dto/pos-register-user.dto';

@Controller('pos')
export class PosServiceController {
  constructor(private readonly posService: PosService, private readonly reportService: PosReportService) {}

  @Post('validate')
  async getValidate(@Body() getInfo: PosValidateServiceDto): Promise<any> {
    return this.posService.posValidate(getInfo);
  }

  @Post('pay')
  async getPayment(@Body() getInfo: PosPayRequestDto): Promise<any> {
    console.log(getInfo, 'getInfo');
    return this.posService.payment(getInfo);
  }

  @Post('remain')
  async getRemain(@Body() getInfo: PosPayRequestDto): Promise<any> {
    return this.posService.getRemain(getInfo);
  }

  @Post('scan')
  async getScan(@Body() getInfo: PosScanQrDto): Promise<any> {
    return this.posService.scanQr(getInfo);
  }

  @Post('report/last')
  async getLast(@Body() getInfo: PosPayRequestDto): Promise<any> {
    return this.reportService.getLastTransaction(getInfo);
  }

  @Post('report')
  async getReport(@Body() getInfo: PosPayReportDto): Promise<any> {
    return this.reportService.getReport(getInfo);
  }

  @Post('register')
  async register(@Body() getInfo: PosRegisterUserDto): Promise<any> {
    return this.posService.register(getInfo);
  }
}
