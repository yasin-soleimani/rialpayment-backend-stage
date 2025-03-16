import { Injectable } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { CampaignIncTypeConst, CampaignTypeConst } from "../const/type.const";
import { CampaignDto } from "../dto/campaign.dto";
import { CampaignCoreCommonService } from "./common.service";
import { CampaignCoreLoginService } from "./login.service";

@Injectable()
export class CampaignCoreManageService {

  constructor(
    private readonly commonService: CampaignCoreCommonService,
    private readonly loginService: CampaignCoreLoginService
  ) { }

  async addNew(getInfo: CampaignDto): Promise<any> {
    if (getInfo.type == CampaignTypeConst.CampaignBIS) {
      if (!getInfo.terminals || getInfo.terminals.length < 1) throw new UserCustomException('ترمینال انتخاب شود')
      const users = await this.loginService.getLoggedInUsers(getInfo.campStart, getInfo.campEnd);

      const data = await this.commonService.addNew(getInfo);
      this.loginService.chargeBis(getInfo.campStart, getInfo.campEnd, getInfo.terminals, getInfo.title, getInfo.amount, getInfo.expire, getInfo.type);

      return data
    } else {
      if (getInfo.incType == CampaignIncTypeConst.Bis) {
        if (!getInfo.terminals || getInfo.terminals.length < 1) throw new UserCustomException('ترمینال انتخاب شود')
      }
      return this.commonService.addNew(getInfo);
    }
  }

  async edit(getInfo: CampaignDto): Promise<any> {
    return this.commonService.edit(getInfo);
  }

  async disable(id: string, status: boolean): Promise<any> {
    return this.commonService.disable(id, status);
  }

  async getList(query: any, page: number): Promise<any> {
    return this.commonService.getList(query, page);
  }

  async getCampaign(date, type): Promise<any> {
    return this.commonService.findOne({
      start: { $gte: date },
      expire: { $lte: date },
      type: type
    });
  }

  async getCampaignAndCmp(date, type, cmpDate): Promise<any> {
    return this.commonService.findOne({
      start: { $gte: date },
      expire: { $lte: date },
      type: type,
      campStart: { $gte: cmpDate },
      campEnd: { $gte: cmpDate }
    })
  }
}