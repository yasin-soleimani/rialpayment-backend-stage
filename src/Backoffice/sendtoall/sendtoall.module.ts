import { Module } from "@vision/common";
import { ClubCoreModule } from "../../Core/customerclub/club.module";
import { GroupCoreModule } from "../../Core/group/group.module";
import { SendtoallModule } from "../../Core/sendtoall/sendtoall.module";
import { GeneralService } from "../../Core/service/general.service";
import { UserModule } from "../../Core/useraccount/user/user.module";
import { BackofficeSendToAllUserController } from "./controller/user.controller";
import { BackofficeSendToAllFilterService } from "./services/filter.service";
import { BackofficeSendToAllSendMessageService } from "./services/send.service";
import { BackofficeSendToAllUserService } from "./services/user.service";
import { BackofficeSendToAllReportController } from './controller/report.controller'
import { LoginHistoryModule } from "../../Core/useraccount/history/login-history.module";
@Module({
  imports: [
    UserModule,
    GroupCoreModule,
    SendtoallModule,
    ClubCoreModule,
    LoginHistoryModule
  ],
  controllers: [
    BackofficeSendToAllUserController,
    BackofficeSendToAllReportController
  ],
  providers: [
    BackofficeSendToAllUserService,
    BackofficeSendToAllFilterService,
    BackofficeSendToAllSendMessageService,
    GeneralService
  ]
})
export class BackOfficeSendToAllModule { }