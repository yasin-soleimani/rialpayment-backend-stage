import { Inject, Injectable } from "@vision/common";
import { CampaignDto } from "../dto/campaign.dto";

@Injectable()
export class CampaignCoreCommonService {

  constructor(
    @Inject('CampaignModel') private readonly campaignModel: any
  ) { }

  async addNew(getInfo: CampaignDto): Promise<any> {
    delete getInfo.id;
    return this.campaignModel.create(getInfo);
  }

  async edit(getInfo: CampaignDto): Promise<any> {
    const id = getInfo.id;
    delete getInfo.id;
    return this.campaignModel.findOneAndUpdate({ _id: id }, getInfo);
  }

  async disable(id: string, status: boolean): Promise<any> {
    return this.campaignModel.findOneAndUpdate({ _id: id }, { status })
  }

  async getList(query: any, page: number): Promise<any> {
    return this.campaignModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async findOne(query: any): Promise<any> {
    return this.campaignModel.findOne(query).sort({ createdAt: -1 })
  }
}