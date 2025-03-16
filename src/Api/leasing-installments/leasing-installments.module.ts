import { Module } from '@vision/common';
import { LeasingUserCreditCoreModule } from '../../Core/leasing-user-credit/leasing-user-credit.module';
import { LeasingInstallmentsCoreModule } from '../../Core/leasing-installments/leasing-installments.module';
import { LeasingInstallmentsController } from './leasing-installments.controller';
import { LeasingInstallmentsService } from './leasing-installments.service';
import { GeneralService } from '../../Core/service/general.service';
import { LeasingInstallmentsIpgService } from './services/leasing-installments-ipg.service';
import { LeasingInstallmentsUtilityService } from './services/leasing-installments-utility.service';
import { LeasingInstallmentsCallbackService } from './services/leasing-installments-callback.service';
import { ClubpPwaModule } from '../../Core/clubpwa/club-pwa.module';
import { MipgServiceModule } from '../../Service/mipg/mipg.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { LeasingInstallmentsSettlementService } from './services/leasing-installments-settlement.service';
import { AccountModule } from '../../Core/useraccount/account/account.module';

@Module({
  imports: [
    LeasingUserCreditCoreModule,
    LeasingInstallmentsCoreModule,
    MipgServiceModule,
    ClubpPwaModule,
    IpgCoreModule,
    UserModule,
    AccountModule,
  ],
  controllers: [LeasingInstallmentsController],
  providers: [
    LeasingInstallmentsService,
    GeneralService,
    LeasingInstallmentsIpgService,
    LeasingInstallmentsUtilityService,
    LeasingInstallmentsCallbackService,
    LeasingInstallmentsSettlementService,
  ],
})
export class LeasingInstallmentsApiModule {}
