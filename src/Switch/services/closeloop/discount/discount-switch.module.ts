import { Module } from '@vision/common';
import { SwitchDiscountPaymentService } from './payment.closeloop';
import { SwitchDiscountConfirmService } from './confirm.closeloop';
import { DiscountSwitchReverseService } from './reverse.clooseloop';

@Module({
  imports: [],
  providers: [SwitchDiscountPaymentService, SwitchDiscountConfirmService, DiscountSwitchReverseService],
  exports: [SwitchDiscountConfirmService, SwitchDiscountPaymentService, DiscountSwitchReverseService],
})
export class DiscountSwitchModule {}
