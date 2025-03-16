import { Module } from "@vision/common";
import { CampaignCoreModule } from "../../Core/campaign/campaign.module";
import { GeneralService } from "../../Core/service/general.service";
import { DatabaseModule } from "../../Database/database.module";
import { BackofficeCampaignController } from "./campaign.controller";
import { BackofficeCampaignService } from "./campaign.service";

@Module({
  imports: [
    CampaignCoreModule
  ],
  controllers: [
    BackofficeCampaignController
  ],
  providers: [
    GeneralService,
    BackofficeCampaignService
  ]
})
export class BackofficeCampaignModule { }