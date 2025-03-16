import { Injectable, InternalServerErrorException, successOpt, successOptWithPagination } from "@vision/common";
import { notEnoughMoneyException } from "@vision/common/exceptions/notEnoughMoney.exception";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { CampaignFilterDto } from "../../Backoffice/campaign/dto/filter.dto";
import { CampaignDto } from "../../Core/campaign/dto/campaign.dto";
import { CampaignCoreManageService } from "../../Core/campaign/services/manage.service";
import { AccountService } from "../../Core/useraccount/account/account.service";
import { CampaignApiFilter } from "./function/filter.func";
import { CampaignCalcPrice } from "./function/price.func";

@Injectable()
export class CampaignApiService {

  constructor(
    private readonly manageService: CampaignCoreManageService,
    private readonly accountService: AccountService
  ) { }

  async addNew(getInfo: CampaignDto): Promise<any> {
    if (Number(getInfo.maxUser) < 1) throw new UserCustomException('تعداد کاربران مجاز کمتر از ۱ نمی تواند باشد');

    const price = CampaignCalcPrice(getInfo);
    if (price < 1) throw new InternalServerErrorException();

    const wallet = await this.accountService.getBalance(getInfo.user, 'wallet');

    if (!wallet) throw new InternalServerErrorException();
    if (wallet.balance < price) throw new notEnoughMoneyException();
    this.accountService.dechargeAccount(getInfo.user, 'wallet', price);

    const data = await this.manageService.addNew(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async getList(getInfo: CampaignFilterDto, page: number, userId: string): Promise<any> {
    const query = CampaignApiFilter(getInfo, userId);
    const data = await this.manageService.getList(query, page);

    return successOptWithPagination(data);
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    const data = await this.manageService.disable(id, status);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

}