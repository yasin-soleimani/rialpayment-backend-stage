import { Injectable, successOpt } from '@vision/common';
import { PosValidateService } from './services/pos-validate.service';
import { PosValidateServiceDto } from './dto/validate.dto';
import { PosPaymentService } from './services/payment.service';
import { PosPayRequestDto } from './dto/pay-req.dto';
import { PosQrScanService } from './services/qr-payment.service';
import { PosScanQrDto } from './dto/scan-qr.dto';
import { PosGetRemainSrevice } from './services/get-remain.service';
import { PosRegisterUserDto } from './dto/pos-register-user.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PosUserRegisterService } from './services/pos-user-register.service';

@Injectable()
export class PosService {
  constructor(
    private readonly validateService: PosValidateService,
    private readonly paymentService: PosPaymentService,
    private readonly qrServiec: PosQrScanService,
    private readonly getRemainServie: PosGetRemainSrevice,
    private readonly posUserRegisterService: PosUserRegisterService
  ) {}

  async posValidate(getInfo: PosValidateServiceDto): Promise<any> {
    return this.validateService.getInfo(getInfo);
  }

  async payment(getInfo: PosPayRequestDto): Promise<any> {
    return this.paymentService.pay(getInfo);
  }

  async scanQr(getInfo: PosScanQrDto): Promise<any> {
    return this.qrServiec.getCalc(getInfo);
  }

  async getRemain(getInfo: PosPayRequestDto): Promise<any> {
    return this.getRemainServie.getCalc(getInfo);
  }

  async register(getInfo: PosRegisterUserDto): Promise<any> {
    try {
      await this.posUserRegisterService.register(getInfo);
      return successOpt();
    } catch (e) {
      console.log(e);
      throw new UserCustomException('خطا هنگام ثبت‌نام');
    }
  }
}
