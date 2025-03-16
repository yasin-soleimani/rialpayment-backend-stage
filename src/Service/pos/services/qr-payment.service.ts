import { Injectable } from '@vision/common';
import { PaymentType } from '@vision/common/constants/payment-type.const';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PosScanQrDto } from '../dto/scan-qr.dto';
import { MerchantTerminalPosInfoService } from '../../../Core/merchant/services/merchant-terminal-pos-info.service';
import { NewQrPaymentService } from '../../../Api/payment/services/new-qr-payment.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { VoucherCoreService } from '../../../Core/voucher/voucher.service';
import { PaymentGroupProjectApiService } from '../../../Api/payment/services/group-project.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { PosQrResponse } from '../function/switch-response.function';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { PosQrCardScanService } from './qr-card.payment.service';

@Injectable()
export class PosQrScanService {
  constructor(
    private readonly termninalService: MerchantTerminalPosInfoService,
    private readonly qrService: NewQrPaymentService,
    private readonly voucherService: VoucherCoreService,
    private readonly targetService: PaymentGroupProjectApiService,
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly cardQrPaymentService: PosQrCardScanService
  ) {}

  async getCalc(getInfo: PosScanQrDto): Promise<any> {
    if (getInfo.type != PaymentType.newQrPayment.toString()) throw new UserCustomException('بارکد نامعتبر', false, 500);

    const posInfo = await this.termninalService.getInfoByMac(getInfo.mac);
    if (!posInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 500);

    if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
      throw new UserCustomException('پذیرنده نامعتبر');

    const cardno = getInfo.barcode.substr(0, 16);
    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (cardInfo) return this.cardQrPaymentService.getPayment(cardno, getInfo, posInfo);
    return this.getDecodeQr(getInfo.barcode, posInfo.terminal.merchant.user);
  }

  async getDecodeQr(barcode: string, userid: string): Promise<any> {
    const info = await this.qrService.slipterEnc(barcode);
    if (info.mobile != '09363677791') throw new UserCustomException('ووچر نامعتبر');

    console.log(info, 'ingo');
    const dec = await this.qrService.decryptor(info.enc, 'MyVouCheR0');
    if (isEmpty(dec)) throw new UserCustomException('ووچر نامعتبر');

    const data = JSON.parse(dec);
    const Info = await this.voucherService.getInfo(data.to);

    const groupInfo = await this.targetService.paymentTicket(userid, data.to);
    const res = await this.voucherService.decrease(data.to, groupInfo.total);
    if (!res) throw new UserCustomException('ووچر نامعتبر');

    let mobile;
    if (!Info.mobile) {
      mobile = 0;
    } else {
      mobile = Info.mobile;
    }

    const title =
      'خرید از وچر' +
      Info.ref +
      ' مبلغ کل : ' +
      groupInfo.amount * groupInfo.qty +
      ' با  ' +
      groupInfo.discount +
      ' درصد تخفیف';
    // title, 'Voucher', groupInfo.total, true, null, userid, mobile
    const logInfo = await this.accountService.accountSetLoggWithRef(
      title,
      Info.ref,
      groupInfo.total,
      true,
      null,
      userid,
      mobile
    );
    await this.accountService.chargeAccount(userid, 'wallet', groupInfo.total);

    return PosQrResponse(groupInfo.total, Info.ref, [
      { title: 'مبلغ کل', amount: groupInfo.amount * groupInfo.qty },
      { title: 'تخفیف', amount: groupInfo.amount * groupInfo.qty - groupInfo.total },
      { title: 'تعداد', amount: groupInfo.qty },
    ]);
  }
}
