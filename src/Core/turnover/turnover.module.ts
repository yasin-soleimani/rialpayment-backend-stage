import { Module } from "@vision/common";
import { DatabaseModule } from "../../Database/database.module";
import { MerchantcoreModule } from "../merchant/merchantcore.module";
import { TurnoverBalanceCoreService } from "./services/balance.service";
import { TurnoverCommonCoreService } from "./services/common.service";
import { TurnoverProviders } from "./turnover.providers";

@Module({
  imports: [
    DatabaseModule,
    MerchantcoreModule
  ],
  providers: [
    ...TurnoverProviders,
    TurnoverCommonCoreService,
    TurnoverBalanceCoreService
  ],
  exports: [
    TurnoverBalanceCoreService,
  ]
})
export class TurnOverCoreModule { }