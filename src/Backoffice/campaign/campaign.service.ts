import { Injectable, InternalServerErrorException, successOpt, successOptWithPagination } from "@vision/common";
import { CampaignDto } from "../../Core/campaign/dto/campaign.dto";
import { CampaignCoreManageService } from "../../Core/campaign/services/manage.service";
import { CampaignFilterDto } from "./dto/filter.dto";
import { CampaignQueryBuilder } from "./functions/query.func";

@Injectable()
export class BackofficeCampaignService {
  constructor(
    private readonly manageService: CampaignCoreManageService
  ) { }

  async addNew(getInfo: CampaignDto): Promise<any> {
    const data = await this.manageService.addNew(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async edit(getInfo: CampaignDto): Promise<any> {
    const data = await this.manageService.edit(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    const data = await this.manageService.disable(id, status);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async getList(getInfo: CampaignFilterDto, page: number): Promise<any> {
    const query = CampaignQueryBuilder(getInfo);
    const data = await this.manageService.getList(query, page);

    return successOptWithPagination(data);
  }
}