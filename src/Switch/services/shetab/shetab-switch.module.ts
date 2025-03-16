import { Module } from '@vision/common';
import { ShetabSwitchConfirm } from './confirm.shetab';
import { ShetabSwitchReverseService } from './reverse.shetab';
import { ShetabPaymentService } from './payment.shetab';

@Module({
  imports: [],
  providers: [ShetabSwitchConfirm, ShetabSwitchReverseService, ShetabPaymentService],
  exports: [ShetabSwitchConfirm, ShetabSwitchReverseService, ShetabPaymentService],
})
export class ShetabSwitchModule {}
