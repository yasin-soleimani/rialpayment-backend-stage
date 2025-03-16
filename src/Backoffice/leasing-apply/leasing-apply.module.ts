import { Module } from '@vision/common';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { LeasingApplyCoreModule } from '../../Core/leasing-apply/leasing-apply.module';
import { LeasingContractCoreModule } from '../../Core/leasing-contract/leasing-contract.module';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { BackofficeLeasingApplyController } from './leasing-apply.controller';
import { BackofficeLeasingApplyService } from './leasing-apply.service';
import { LeasingUserCreditCoreModule } from '../../Core/leasing-user-credit/leasing-user-credit.module';
import { LeasingInstallmentsCoreModule } from '../../Core/leasing-installments/leasing-installments.module';
import { AccountModule } from "../../Core/useraccount/account/account.module"

@Module({
  imports: [
    LeasingApplyCoreModule,
    UserModule,
    AclCoreModule,
    LeasingContractCoreModule,
    LeasingUserCreditCoreModule,
    LeasingInstallmentsCoreModule,
    AccountModule,
  ],
  controllers: [BackofficeLeasingApplyController],
  providers: [BackofficeLeasingApplyService, GeneralService],
})
export class BackofficeLeasingApplyModule {}
