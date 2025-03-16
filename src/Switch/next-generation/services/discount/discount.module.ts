import { Module } from '@vision/common';
import { SwitchDiscountService } from './discount.service';
import { CommonModule } from '../common/common.module';
import { SwitchCloseloopService } from './closeloop.discount.service';
import { SwitchShetabService } from './shetab-discount.service';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { LoggercoreModule } from '../../../../Core/logger/loggercore.module';
import { MerchantcoreModule } from '../../../../Core/merchant/merchantcore.module';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';
import { CardModule } from '../../../../Core/useraccount/card/card.module';
import { GroupCoreModule } from '../../../../Core/group/group.module';
import { OrganizationStrategyModule } from '../../../../Core/organization/startegy/organization-startegy.module';
import { OrganizationChargeCoreModule } from '../../../../Core/organization/charge/organization-charge.module';
import { TurnOverCoreModule } from '../../../../Core/turnover/turnover.module';

@Module({
  imports: [
    CommonModule,
    PayCoreModule,
    LoggercoreModule,
    MerchantcoreModule,
    AccountModule,
    CardModule,
    GroupCoreModule,
    OrganizationStrategyModule,
    OrganizationChargeCoreModule,
    TurnOverCoreModule
  ],
  providers: [SwitchDiscountService, SwitchCloseloopService, SwitchShetabService],
  exports: [SwitchDiscountService],
})
export class DiscountModule { }
