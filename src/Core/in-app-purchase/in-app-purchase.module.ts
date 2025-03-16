import { Module } from "@vision/common";
import { MipgServiceModule } from "../../Service/mipg/mipg.module";
import { NewOrganizationSwitchModule } from "../../Switch/next-generation/services/new-organization/organization.module";
import { SwitchModule } from "../../Switch/next-generation/switch.module";
import { IpgCoreModule } from "../ipg/ipgcore.module";
import { LoggercoreModule } from "../logger/loggercore.module";
import { MerchantcoreModule } from "../merchant/merchantcore.module";
import { MipgModule } from "../mipg/mipg.module";
import { OrganizationNewChargeCoreModule } from "../organization/new-charge/charge.module";
import { PspverifyCoreModule } from "../psp/pspverify/pspverifyCore.module";
import { AccountModule } from "../useraccount/account/account.module";
import { CardModule } from "../useraccount/card/card.module";
import { InAppPurchaseCoreService } from "./in-app-purchase.service";
import { InAppPurchaseCallbackCoreService } from "./services/callback.service";
import { InAppPurchaseIpgCoreService } from "./services/ipg.service";
import { InAppPurchaseSwitchCoreService } from "./services/switch.service";

@Module({
  imports: [
    SwitchModule,
    IpgCoreModule,
    LoggercoreModule,
    CardModule,
    AccountModule,
    MipgModule,
    PspverifyCoreModule,
    MipgServiceModule,
    MerchantcoreModule,
    NewOrganizationSwitchModule,
    OrganizationNewChargeCoreModule
  ],
  providers: [
    InAppPurchaseCoreService,
    InAppPurchaseIpgCoreService,
    InAppPurchaseSwitchCoreService,
    InAppPurchaseCallbackCoreService
  ],
  exports: [InAppPurchaseCoreService]
})
export class InAppPurchaseCoreModule { }