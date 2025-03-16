import { Module } from "@vision/common"
import { LeasingInstallmentsCoreModule } from "../../Core/leasing-installments/leasing-installments.module"
import { BackofficeLeasingInstallmentsController } from "./leasing-installments.controller"
import { BackofficeLeasingInstallmentsService } from "./leasing-installments.service"
import { GeneralService } from "../../Core/service/general.service"
import { LeasingUserCreditCoreModule } from "../../Core/leasing-user-credit/leasing-user-credit.module"

@Module({
  imports: [LeasingInstallmentsCoreModule, LeasingUserCreditCoreModule],
  controllers: [BackofficeLeasingInstallmentsController],
  providers: [BackofficeLeasingInstallmentsService, GeneralService]
})
export class BackofficeLeasingInstallmentsModule {}
