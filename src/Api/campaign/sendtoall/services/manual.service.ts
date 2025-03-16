import { Injectable, successOpt, faildOptWithData } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { isEmpty } from "@vision/common/utils/shared.utils";
import xlsx from 'node-xlsx';
import * as persianize from 'persianize';
import { notEnoughMoneyException } from "@vision/common/exceptions/notEnoughMoney.exception";
import { SendToAllAccounttingApiService } from "./accounting.service";
import { SendToAllMelliPayamakApiService } from "./melli-payamak.service";
import { SendtoallCommonService } from "../../../../Core/sendtoall/services/common.service";
import { SendtoallType } from "../../../../Core/sendtoall/const/sendtoall-types.const";
import { UserService } from "../../../../Core/useraccount/user/user.service";
import { mobileNoValidator } from "../../function/mobile.func";

@Injectable()
export class SendToAllManualApiService {

  constructor(
    private readonly melliPayamakService: SendToAllMelliPayamakApiService,
    private readonly accountingService: SendToAllAccounttingApiService,
    private readonly sendtoallCommonService: SendtoallCommonService,
    private readonly userService: UserService
  ) { }


  async excel(req, message, title, userId: string): Promise<any> {
    const excelFile = req.files.file;
    if (isEmpty(excelFile.data)) throw new UserCustomException('متاسفانه قالب بندی فایل شما درست نمی باشد', false, 500);
    const workSheetsFromBuffer = xlsx.parse(excelFile.data);

    const returnData = await this.submitForEach(workSheetsFromBuffer[0].data, message, title, userId);
    if (returnData.length > 0) {
      return faildOptWithData(returnData);
    } else {
      return successOpt();
    }
  }

  async sendAll(mobiles, message, title, userId: string): Promise<any> {
    let mobile = Array();
    for (const item of mobiles) {
      if (mobileNoValidator(item)) {
        mobile.push(item)
      }
    }

    if (mobiles.length > 100) throw new UserCustomException('تعداد مجاز موبایل 100 می باشد');
    if (mobiles.length < 1) throw new UserCustomException('شماره موبایل را وارد نمایید');

    const wallet = await this.accountingService.checkBalance(userId, message, mobiles.length);
    if (!wallet) throw new notEnoughMoneyException();

    this.melliPayamakService.sendMultiSms(mobiles, message);

    for (const item of mobile) {
      const userInfo = await this.userService.getInfoByMobile(item);
      let currentId = null;
      if (userInfo) currentId = userInfo._id;
      this.sendtoallCommonService.addNew(currentId, message, SendtoallType.Sms, item, null, 'ارسال همگانی', null, userId, 'MelliPayamak', '', '', '50004001460636', '0')
    }
    return successOpt();
  }

  private async submitForEach(data, message, title, userid: string): Promise<any> {
    let mobiles = Array();
    // filter out all empty arrays
    const filteredXlsxData = data.filter((element) => element.length > 0);
    // filter first row of xlsx file, cause it's just header
    const actualXlsxData = filteredXlsxData.slice(0, filteredXlsxData.length);

    for (const item of actualXlsxData) {
      if (mobileNoValidator(item[0])) {
        mobiles.push(item[0])
      }
    }

    if (mobiles.length > 100) throw new UserCustomException('تعداد مجاز موبایل 100 می باشد');
    const wallet = await this.accountingService.checkBalance(userid, message, mobiles.length);
    if (!wallet) throw new notEnoughMoneyException();

    this.melliPayamakService.sendMultiSms(mobiles, message);

    for (const item of mobiles) {
      const userInfo = await this.userService.getInfoByMobile(item);
      let currentId = null;
      if (userInfo) currentId = userInfo._id;
      this.sendtoallCommonService.addNew(currentId, message, SendtoallType.Sms, item, null, 'Excel ارسال همگانی', null, userid, 'MelliPayamak', '', '', '50004001460636', '0')
    }

    return successOpt();
  }




}