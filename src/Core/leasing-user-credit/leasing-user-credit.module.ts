import { Module } from '@vision/common';
import { DatabaseModule } from "../../Database/database.module"
import { LeasingUserCreditCoreService } from "./leasing-user-credit.service"
import { LEASING_USER_CREDIT_PROVIDERS } from "./leasing-user-credit.providers"

@Module({
  imports: [DatabaseModule],
  providers: [LeasingUserCreditCoreService, ...LEASING_USER_CREDIT_PROVIDERS],
  exports: [LeasingUserCreditCoreService],
})
export class LeasingUserCreditCoreModule {}
