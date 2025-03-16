import { Injectable } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { SendToAllFilterTypeConst } from "../../Backoffice/sendtoall/const/filter.const";
import { SendToAllBackofficeDto } from "../../Backoffice/sendtoall/dto/send.dto";
import { SendToAllLoginApiService } from "./services/login-history.service";

@Injectable()
export class SendtoAllApiService {

  constructor(
    private readonly loginService: SendToAllLoginApiService
  ) { }


  async getFilter(getInfo: SendToAllBackofficeDto, ref: string): Promise<any> {
    if (getInfo.type == SendToAllFilterTypeConst.AppLogin) {
      return this.loginService.getLoginSystem('mobile', ref);
    } else if (getInfo.type == SendToAllFilterTypeConst.PwaLogin) {
      return this.loginService.getLoginSystem('pwa', ref);
    } else if (getInfo.type == SendToAllFilterTypeConst.WebLogin) {
      return this.loginService.getLoginSystem('web', ref);
    } else {
      throw new UserCustomException('نوع تعریف نشده')
    }
  }
}