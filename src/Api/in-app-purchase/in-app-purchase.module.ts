import { Module } from "@vision/common";
import { InAppPurchaseCoreModule } from "../../Core/in-app-purchase/in-app-purchase.module";
import { IpgCoreModule } from "../../Core/ipg/ipgcore.module";
import { AccountModule } from "../../Core/useraccount/account/account.module";
import { InAppPurchaseApiController } from "./in-app-purchase.controller";
import { InAppPurchaseApiService } from "./in-app-purchase.service";
import { InAppPurcahseIpgCallBackApiService } from "./services/callback.service";

@Module({
  imports: [
    InAppPurchaseCoreModule,
    IpgCoreModule,
    AccountModule
  ],
  controllers: [
    InAppPurchaseApiController
  ],
  providers: [
    InAppPurchaseApiService,
    InAppPurcahseIpgCallBackApiService
  ]
})
export class InAppPurchaseApiModule { }