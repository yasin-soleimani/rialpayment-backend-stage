import { Module } from '@vision/common';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { ClubpPwaModule } from '../../Core/clubpwa/club-pwa.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { LeasingApplyCoreModule } from '../../Core/leasing-apply/leasing-apply.module';
import { LeasingContractCoreModule } from '../../Core/leasing-contract/leasing-contract.module';
import { LeasingFormCoreModule } from '../../Core/leasing-form/leasing-form.module';
import { LeasingInstallmentsCoreModule } from '../../Core/leasing-installments/leasing-installments.module';
import { LeasingOptionCoreModule } from '../../Core/leasing-option/leasing-option.module';
import { LeasingRefCoreModule } from '../../Core/leasing-ref/leasing-ref.module';
import { LeasingUserCreditCoreModule } from '../../Core/leasing-user-credit/leasing-user-credit.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { GeneralService } from '../../Core/service/general.service';
import { TurnOverCoreModule } from '../../Core/turnover/turnover.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { MipgServiceModule } from '../../Service/mipg/mipg.module';
import { LeasingApplyController } from './leasing-apply.controller';
import { LeasingApplyService } from './leasing-apply.service';
import { LeasingApplyCallbackService } from './services/leasing-apply-callback.service';
import { LeasingApplyClubService } from './services/leasing-apply-club.service';
import { LeasingApplyCommonService } from './services/leasing-apply-common.service';
import { LeasingApplyIpgService } from './services/leasing-apply-ipg.service';
import { LeasingApplyPublicService } from './services/leasing-apply-public.service';
import { LeasingApplySettlementService } from './services/leasing-apply-settlement.service';
import { LeasingApplyUtilityService } from './services/leasing-apply-utility.service';
import { ClubCoreModule } from '../../Core/customerclub/club.module';

@Module({
  imports: [
    LeasingApplyCoreModule,
    LeasingRefCoreModule,
    LeasingOptionCoreModule,
    LeasingFormCoreModule,
    LeasingContractCoreModule,
    LeasingUserCreditCoreModule,
    LeasingInstallmentsCoreModule,
    AccountModule,
    UserModule,
    ClubpPwaModule,
    AclCoreModule,
    MipgServiceModule,
    IpgCoreModule,
    LoggercoreModule,
    TurnOverCoreModule,
    ClubCoreModule,
  ],
  controllers: [LeasingApplyController],
  providers: [
    LeasingApplyService,
    GeneralService,
    LeasingApplyCommonService,
    LeasingApplyUtilityService,
    LeasingApplyPublicService,
    LeasingApplyClubService,
    LeasingApplyIpgService,
    LeasingApplyCallbackService,
    LeasingApplySettlementService,
  ],
})
export class LeasingApplyApiModule {}
