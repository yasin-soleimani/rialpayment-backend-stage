import { Module } from '@vision/common';
import { PspverifyCoreModule } from '../../../../Core/psp/pspverify/pspverifyCore.module';
import { CommonModule } from '../common/common.module';
import { SwitchMobileService } from './switch-mobile.service';
import { SwitchMobileGateService } from './services/gate.service';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { SwitchModule } from '../../switch.module';
import { CardModule } from '../../../../Core/useraccount/card/card.module';
import { UserModule } from '../../../../Core/useraccount/user/user.module';
import { MerchantcoreModule } from '../../../../Core/merchant/merchantcore.module';

@Module({
  imports: [
    PspverifyCoreModule,
    CommonModule,
    AccountModule,
    PspverifyCoreModule,
    PayCoreModule,
    SwitchModule,
    CardModule,
    UserModule,
    MerchantcoreModule,
  ],
  providers: [SwitchMobileService, SwitchMobileGateService],
  exports: [SwitchMobileService],
})
export class MobileSwitchModule {}
