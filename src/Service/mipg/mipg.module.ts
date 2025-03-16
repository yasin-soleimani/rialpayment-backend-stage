import { Module, forwardRef } from '@vision/common';
import { MipgController } from './mipg.controller';
import { DatabaseModule } from '../../Database/database.module';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { IpgCoreProviders } from '../../Core/ipg/ipgcore.providers';
import { GeneralService } from '../../Core/service/general.service';
import { CardcounterService } from '../../Core/useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../../Core/useraccount/cardcounter/cardcounter.providers';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { LoggercoreProviders } from '../../Core/logger/loggercore.providers';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { MipgService } from './mipg.service';
import { PaymentCoreService } from '../../Core/payment/payment.service';
import { MipgCoreProviders } from '../../Core/mipg/mipg.providers';
import { PaymentProviders } from '../../Core/payment/payment.providers';
import { CategorycoreService } from '../../Core/category/categorycore.service';
import { CategorycoreProviders } from '../../Core/category/categorycore.providers';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { ChargeModule } from '../../Api/charge/charge.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgAuthService } from '../../Core/mipg/services/mipg-auth.service';
import { MipgSharingService } from '../../Core/mipg/services/mipg-sharing.service';
import { ShaparakSettlementModule } from '../../Core/shaparak/settlement/settlement.module';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { MipgServiceAuthService } from './service/auth.service';

@Module({
  imports: [
    DatabaseModule,
    AccountModule,
    UserModule,
    ChargeModule,
    IpgCoreModule,
    ShaparakSettlementModule,
    AclCoreModule,
  ],
  controllers: [MipgController],
  providers: [
    CategorycoreService,
    LoggercoreService,
    CardcounterService,
    MipgServiceAuthService,
    GeneralService,
    MipgCoreService,
    MipgService,
    PaymentCoreService,
    MipgAuthService,
    MipgSharingService,
    ...CategorycoreProviders,
    ...CardcounterProviders,
    ...LoggercoreProviders,
    ...MipgCoreProviders,
    ...PaymentProviders,
  ],
  exports: [MipgCoreService, MipgService],
})
export class MipgServiceModule {}
