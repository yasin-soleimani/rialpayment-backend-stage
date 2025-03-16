import { Module } from "@vision/common";
import { DatabaseModule } from "../../Database/database.module";
import { MerchantcoreModule } from "../merchant/merchantcore.module";
import { TurnOverCoreModule } from "../turnover/turnover.module";
import { AccountModule } from "../useraccount/account/account.module";
import { CardModule } from "../useraccount/card/card.module";
import { CampaignProviders } from "./campaign.providers";
import { CampaignCoreCommonService } from "./services/common.service";
import { CamapignHistoryCoreService } from "./services/history.service";
import { CampaignCoreLoginService } from "./services/login.service";
import { CampaignCoreManageService } from "./services/manage.service";

@Module({
  imports: [
    DatabaseModule,
    AccountModule,
    MerchantcoreModule,
    TurnOverCoreModule,
    CardModule
  ],
  providers: [
    ...CampaignProviders,
    CampaignCoreCommonService,
    CampaignCoreManageService,
    CampaignCoreLoginService,
    CamapignHistoryCoreService
  ],
  exports: [
    CampaignCoreManageService,
    CampaignCoreCommonService,
    CamapignHistoryCoreService,
    AccountModule
  ]
})
export class CampaignCoreModule { }