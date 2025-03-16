import { Injectable, Inject } from "@vision/common";

@Injectable()
export class CamapignHistoryCoreService {

  constructor(
    @Inject('CampaignModel') private readonly campaignModel: any
  ) { }


  async getList(query: any, page: string): Promise<any> {
    return this.campaignModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 10 });
  }


  async addNew(campaign: string, user: string, amount: number, ref: string): Promise<any> {
    return this.campaignModel.create({
      campaign, user, amount, ref
    });
  }

  async getCount(campaignId: string): Promise<any> {
    return this.campaignModel.count({ campaign: campaignId });
  }


}