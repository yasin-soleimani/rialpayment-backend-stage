import {
  Injectable,
  InternalServerErrorException,
  successOpt,
  NotFoundException,
  wrongActivationCode,
  successOptWithDataNoValidation,
} from '@vision/common';
import { UserService } from '../../Core/useraccount/user/user.service';
import { ConfirmCoreService } from '../../Core/confirm/confirm.service';
import { TicketMobileDto } from './dto/ticket-mobile.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { ChargeTicketDto } from './dto/charge-dto';
import axios, { AxiosInstance } from 'axios';
import { makeTicketImage } from '@vision/common/utils/ticket-maker.util';
import { VoucherQrGenerator } from '../../Core/voucher/services/voucher-qr.service';
import { GeneralService } from '../../Core/service/general.service';
import { TicketPaymentService } from './services/ticket-payment.service';

@Injectable()
export class TicketService {
  private Client: AxiosInstance;

  constructor(
    private readonly generalService: GeneralService,
    private readonly confirmService: ConfirmCoreService,
    private readonly ipgService: IpgCoreService,
    private readonly voucherSrvice: VoucherQrGenerator,
    private readonly paymentService: TicketPaymentService
  ) {
    this.Client = axios.create({
      baseURL: 'http://localhost:8001/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async firstMobile(mobile: number): Promise<any> {
    if (isEmpty(mobile)) throw new FillFieldsException();
    const res = await this.confirmService.newReq(mobile);
    if (!res) throw new InternalServerErrorException();
    return successOpt();
  }

  async confirm(getInfo: TicketMobileDto): Promise<any> {
    const info = await this.confirmService.getAll(getInfo.mobile);
    if (!info) throw new NotFoundException();
    if (info.acode != getInfo.acode) return wrongActivationCode();
    return successOpt();
  }

  async payment(getInfo: TicketMobileDto): Promise<any> {
    const info = await this.confirmService.getAll(getInfo.mobile);
    if (!info) throw new NotFoundException();
    if (info.acode != getInfo.acode) return wrongActivationCode();
    return this.guestMode(getInfo.amount, getInfo.mobile);
  }

  async paymenRedirect(ref: string): Promise<any> {
    const refInfo = await this.ipgService.findByRef(ref);
    if (!refInfo) throw new NotFoundException();
    return refInfo;
  }

  async confirmPayment(getInfo): Promise<any> {
    // const data = await this.ipgService.findByInvoiceid(getInfo.invoiceid);
    return this.paymentService.getVerify(getInfo.token, getInfo.status);
    // return this.confirmRegistered(getInfo);
  }

  private async confirmRegistered(getInfo: ChargeTicketDto): Promise<any> {
    const data = await this.ipgService.addDetailsGuest(getInfo);
    return data;
  }

  private async guestMode(amount, mobile): Promise<any> {
    const invoiceid = 'Voucher-' + new Date().getTime();
    const callbackUrl = 'https://service.rialpayment.ir/ticket/payment/status';
    const ipg = await this.ipgService.guestMode(invoiceid, amount, mobile, callbackUrl);
    return this.successTransform(ipg);
  }

  async generateTicket(getInfo): Promise<any> {
    const data = await this.ipgService.getAll(getInfo.id);
    if (!data) throw new NotFoundException();
    const qr = await this.voucherSrvice.makeQrVoucher(
      data.amount,
      'IPG | ' + data.invoiceid,
      3,
      null,
      getInfo.amount,
      0,
      data.mobile
    );
    console.log(qr, 'qr');

    if (qr.status != 200) throw new InternalServerErrorException();
    const link = await makeTicketImage(qr.data, data.mobile, data.amount, qr.ref, qr.serial);
    const msg = ' لینک دانلود وچر شما : ' + 'http://service.rialpayment.ir/upload/' + link;
    this.generalService.AsanaksendSMS('sad', 'sad0', 's', '0' + data.mobile, msg);
    return successOptWithDataNoValidation(link);
  }

  async getsTick(id): Promise<any> {
    const qr = await this.voucherSrvice.JustMakeQr(id);
    const voucherInfo = await this.voucherSrvice.getInfoByData(id);
    console.log(voucherInfo, 'voucherInfo ');
    if (qr.status != 200) throw new InternalServerErrorException();
    const link = await makeTicketImage(qr.data, voucherInfo.mobile, voucherInfo.amount, qr.ref, qr.serial);
    const msg = ' لینک دانلود وچر شما : ' + 'http://192.168.0.199:5522/upload/' + link;
    this.generalService.AsanaksendSMS('sad', 'sad0', 's', '0' + voucherInfo.mobile, msg);
    return successOptWithDataNoValidation(link);
  }

  successTransform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: data.ref,
    };
  }
}
