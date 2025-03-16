import { Module } from "@vision/common"
import { DatabaseModule } from "../../Database/database.module"
import { LeasingInstallmentsCoreService } from "./leasing-installments.service"
import { LEASING_INSTALLMENTS_PROVIDERS } from "./leasing-installments.providers"

@Module({
  imports: [DatabaseModule],
  providers: [LeasingInstallmentsCoreService, ...LEASING_INSTALLMENTS_PROVIDERS],
  exports: [LeasingInstallmentsCoreService]
})
export class LeasingInstallmentsCoreModule {
}
