import { Module } from "@vision/common";
import { CampaignCoreModule } from "../../Core/campaign/campaign.module";
import { SendtoallModule } from "../../Core/sendtoall/sendtoall.module";
import { GeneralService } from "../../Core/service/general.service";
import { AccountModule } from "../../Core/useraccount/account/account.module";
import { UserModule } from "../../Core/useraccount/user/user.module";
import { CampaignApiService } from "./campaign.service";
import { CamapignBranchApiController } from "./controller/branch.controller";
import { CamapignBulkApiController } from "./controller/bulk.controller";
import { CamapignApiController } from "./controller/campaign.controller";
import { SendToAllAccounttingApiService } from "./sendtoall/services/accounting.service";
import { SendToAllManualApiService } from "./sendtoall/services/manual.service";
import { SendToAllMelliPayamakApiService } from "./sendtoall/services/melli-payamak.service";

@Module({
  imports: [CampaignCoreModule, AccountModule, SendtoallModule, UserModule],
  controllers: [
    CamapignApiController,
    CamapignBulkApiController,
    CamapignBranchApiController
  ],
  providers: [
    CampaignApiService,
    SendToAllManualApiService,
    SendToAllMelliPayamakApiService,
    SendToAllAccounttingApiService,
    GeneralService]
})
export class CampaignApiModule { }