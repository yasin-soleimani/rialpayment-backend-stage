import { Injectable, NotFoundException, faildOpt } from '@vision/common';
import { PaymentDto } from '../dto/payment.dto';
import { PaymentType } from '@vision/common/constants/payment-type.const';
import { TerminalPaymentService } from './terminal-payment.service';
import { PaymentsService } from './payments.service';
import { PaymentService } from '../payment.service';
import { NewQrPaymentService } from './new-qr-payment.service';
import { PaymentSafeService } from './payment-safe.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { PaymentRfidService } from './rfid-payment.service';

@Injectable()
export class NewPaymentService {
  constructor(
    private readonly terminalPayService: TerminalPaymentService,
    private readonly paymentService: PaymentsService,
    private readonly paymentOldService: PaymentService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly rfidPaymentService: PaymentRfidService,
    private readonly newQrService: NewQrPaymentService,
    private readonly safePaymentService: PaymentSafeService
  ) {}

  async submit(getInfo: PaymentDto, userid): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new NotFoundException();
    if (isEmpty(userInfo.fullname) || userInfo.block === true)
      throw new UserCustomException('شما مجاز به انجام تراکنش نمی باشید');

    switch (getInfo.type.toString()) {
      // terminal Payment
      case PaymentType.terminalPayment.toString(): {
        console.log('in terminal payment');
        return this.terminalPayService.pay(getInfo, userid);
      }

      case PaymentType.qrTicket.toString(): {
        return this.terminalPayService.payTicket(getInfo, userid);
      }

      case PaymentType.transfer.toString(): {
        await this.checkToday(getInfo, userid);
        return this.paymentService.checkWalletTransferType(getInfo, userid);
      }

      case PaymentType.wallet.toString(): {
        await this.checkToday(getInfo, userid);
        return this.paymentService.trasnfer(getInfo, userid);
      }

      case PaymentType.transfercredit.toString(): {
        return faildOpt();
      }

      case PaymentType.credit.toString(): {
        return faildOpt();
      }

      case PaymentType.newQrPayment.toString(): {
        return this.newQrService.pay(getInfo.barcode, userid, getInfo.amount);
      }

      case PaymentType.paymentInstallments.toString(): {
        return this.paymentOldService.installsPayment(getInfo, userid);
      }

      case PaymentType.safeModePayment.toString(): {
        return this.safePaymentService.IpgSafePayment(getInfo, userid);
      }

      case PaymentType.rfidPayment.toString(): {
        return this.rfidPaymentService.pay(
          userInfo,
          getInfo.amount,
          getInfo.payid,
          Number(getInfo.secpin),
          getInfo.cardno,
          getInfo.pin
        );
      }

      default: {
        throw new NotFoundException();
      }
    }
  }

  async checkToday(getInfo, userid): Promise<any> {
    const wallet = await this.accountService.getBalance(userid, 'wallet');
    const todayCharge = await this.accountService.getTodayCharge(userid);
    let todayAmount = 0;
    if (!isEmpty(todayCharge)) todayAmount = todayCharge[0].total;
    const cashoutable = wallet.balance - todayAmount;
    if (getInfo.amount > cashoutable) throw new UserCustomException('موجودی ناکافی', false, 701);
  }
}
