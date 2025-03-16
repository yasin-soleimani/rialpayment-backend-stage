import { Module } from "@vision/common";
import { GeneralService } from "../../Core/service/general.service";
import { LoginHistoryModule } from "../../Core/useraccount/history/login-history.module";
import { UserModule } from "../../Core/useraccount/user/user.module";
import { SendToAllApiController } from "./sendtoall.controller";
import { SendtoAllApiService } from "./sendtoall.service";
import { SendToAllLoginApiService } from "./services/login-history.service";

@Module({
  imports: [UserModule, LoginHistoryModule],
  controllers: [SendToAllApiController],
  providers: [SendtoAllApiService, SendToAllLoginApiService, GeneralService]
})
export class SendToAllApiModule { }