import {
  Injectable,
  successOpt,
  successOptWithDataNoValidation,
  faildOpt,
  InternalServerErrorException,
} from '@vision/common';
import { StrategyApiDto } from './dto/strategy-api.dto';
import { MerchantDiscountStrategyService } from '../../Core/merchant/services/merchant-strategy.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MerchantCreditCoreService } from '../../Core/credit/merchantcredit/merchantcredit.service';
import { OrganizationStrategyDto } from './dto/strategy-organization.dto';
import { GroupCoreService } from '../../Core/group/group.service';
import { OrganizationStrategyService } from '../../Core/organization/startegy/organization-strategy.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class StrategyApiService {
  constructor(
    private readonly strategyService: MerchantDiscountStrategyService,
    private readonly creditStrategyService: MerchantCreditCoreService,
    private readonly groupService: GroupCoreService,
    private readonly orgStrategyService: OrganizationStrategyService
  ) {}

  async new(getInfo: StrategyApiDto): Promise<any> {
    const days = await this.daysOfWeek(getInfo);
    getInfo.daysofweek = days;
    const data = await this.strategyService.newStrategy(getInfo);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return successOpt();
  }

  async getList(terminalid: string, userid: string, type?: number): Promise<any> {
    const data = await this.strategyService.getList(terminalid, userid);
    if (!data) throw new UserCustomException('متاسفانه استراتژی یافت نشد', false, 404);
    let tmp = Array();
    for (const info of data) {
      if (!info.group) {
        tmp.push({
          automaticwage: info.automaticwage,
          bankdisc: info.bankdisc,
          group: null,
          nonebankdisc: info.nonebankdisc,
          opt: info.opt,
          percentpertime: info.percentpertime,
          type: info.type,
          wage: null,
          wagetime: info.wagetime,
          _id: info._id,
        });
      }
    }
    return successOptWithDataNoValidation(tmp);
  }

  async getGroupDetails(userid: string, groupid: string): Promise<any> {
    const data = await this.strategyService.getDetails(groupid);
    if (!data) throw new UserCustomException('متاسفانه استراتژی یافت نشد', false, 404);
    return successOptWithDataNoValidation(data);
  }

  async getGroupList(gid, userid): Promise<any> {
    const data = await this.strategyService.getGroupList(gid, userid);
    if (!data) throw new UserCustomException('متاسفانه استراتژی یافت نشد', false, 404);
    return successOptWithDataNoValidation(data);
  }

  async getSettingsList(terminalid, userid): Promise<any> {
    const data = await this.strategyService.getSettings(userid, terminalid);
    return successOptWithDataNoValidation(data);
  }

  async creditGetList(terminalid: string, userid: string): Promise<any> {
    let data = await this.creditStrategyService.getList(terminalid, userid);
    if (!data) data = '';
    return successOptWithDataNoValidation(data);
  }

  async remove(id, userid): Promise<any> {
    const data = await this.strategyService.remove(id, userid);
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return successOpt();
  }

  private async daysOfWeek(getInfo: StrategyApiDto): Promise<any> {
    let daysofweek = Array();
    if (new Boolean(getInfo.saturday)) daysofweek.push(6);
    if (new Boolean(getInfo.sunday)) daysofweek.push(0);
    if (new Boolean(getInfo.monday)) daysofweek.push(1);
    if (new Boolean(getInfo.tuesday)) daysofweek.push(2);
    if (new Boolean(getInfo.wednesday)) daysofweek.push(3);
    if (new Boolean(getInfo.thursday)) daysofweek.push(4);
    if (new Boolean(getInfo.friday)) daysofweek.push(5);
    return daysofweek;
  }

  async orgNewStrategy(getInfo: OrganizationStrategyDto, userid, role): Promise<any> {
    if (
      isEmpty(getInfo.group) ||
      isEmpty(getInfo.customercharge) ||
      isEmpty(getInfo.expire) ||
      isEmpty(getInfo.refresh) ||
      isEmpty(getInfo.terminal)
    )
      throw new FillFieldsException();
    const terminals = getInfo.terminal.split(',');
    const daysofweek = await this.daysOfWeekOrg(getInfo);
    getInfo.daysofweek = daysofweek;
    getInfo.terminal = terminals;
    getInfo.user = userid;
    const data = await this.orgStrategyService.newItem(getInfo);
    if (!data) return faildOpt();
    return successOpt();
  }

  async getOrgList(userid: string, groupid: string): Promise<any> {
    const data = await this.orgStrategyService.list(userid, groupid);
    return successOptWithDataNoValidation(data);
  }

  async removeOrgSt(id: string): Promise<any> {
    const data = await this.orgStrategyService.remove(id);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  private async daysOfWeekOrg(getInfo: OrganizationStrategyDto): Promise<any> {
    let daysofweek = Array();
    if (new Boolean(getInfo.saturday)) daysofweek.push(6);
    if (new Boolean(getInfo.sunday)) daysofweek.push(0);
    if (new Boolean(getInfo.monday)) daysofweek.push(1);
    if (new Boolean(getInfo.tuesday)) daysofweek.push(2);
    if (new Boolean(getInfo.wednesday)) daysofweek.push(3);
    if (new Boolean(getInfo.thursday)) daysofweek.push(4);
    if (new Boolean(getInfo.friday)) daysofweek.push(5);
    return daysofweek;
  }

  async getOrgan(): Promise<any> {
    let group = Array();
    let terminal = Array();
    group.push('5c852e11b9719167d5d5b8db');
    terminal.push('5c17416b32847d7be37e5ebc');
    const data = await this.orgStrategyService.getOrganStrategy(group, terminal);
    return data;
  }
}
