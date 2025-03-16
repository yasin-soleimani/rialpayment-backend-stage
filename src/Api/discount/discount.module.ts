import { Module } from "@vision/common";
import { GeneralService } from "../../Core/service/general.service";
import { TurnOverCoreModule } from "../../Core/turnover/turnover.module";
import { DiscountApiController } from "./discount.controller";
import { DiscountApiService } from "./discount.service";
import { MerchantcoreModule } from "../../Core/merchant/merchantcore.module";

@Module({
  imports: [
    TurnOverCoreModule,
    MerchantcoreModule
  ],
  controllers: [
    DiscountApiController
  ],
  providers: [
    GeneralService,
    DiscountApiService
  ]
})
export class DiscountApiModule { }