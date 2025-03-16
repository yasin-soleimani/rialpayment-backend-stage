import { Module } from '@vision/common';
import { CreditPaymentConfirmService } from './confirm.credit';
import { SwitchCreditPaymentService } from './payment.credit';
import { CreditSwitchReverseService } from './reverse.credit';

@Module({
  imports: [],
  providers: [CreditPaymentConfirmService, SwitchCreditPaymentService, CreditSwitchReverseService],
  exports: [CreditPaymentConfirmService, SwitchCreditPaymentService, CreditSwitchReverseService],
})
export class CreditSwitchModule {}
