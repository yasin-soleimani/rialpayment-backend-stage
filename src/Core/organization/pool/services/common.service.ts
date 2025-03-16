import { Inject, Injectable } from '@vision/common';

@Injectable()
export class OrganizationPoolCoreCommonService {
  constructor(
    @Inject('OrganizationPoolModel') private readonly poolModel: any,
    @Inject('OrganizationPoolPoolTurnModel') private readonly turnOverModel: any,
    @Inject('OrganizationPoolHistoryModel') private readonly historyModel: any
  ) {}

  async submitTurnover(
    user: string,
    pool: string,
    input: number,
    out: number,
    remain: number,
    description: string,
    card: string,
    ref: string
  ): Promise<any> {
    return this.turnOverModel.create({ pool, user, in: input, out, remain, description, card, ref });
  }

  async changeTurnOverVisiblity(id: string, visiblity: boolean): Promise<any> {
    return this.turnOverModel.findOneAndUpdate({ _id: id }, { $set: { visible: visiblity } });
  }

  async getLastTurnOver(pool: string): Promise<any> {
    return this.turnOverModel.findOne({ pool }).sort({ createdAt: -1 });
  }
  async listTurnOver(query: any, page: number): Promise<any> {
    return this.turnOverModel.paginate(query, { page: page, sort: { createdAt: -1 }, limit: 50 });
  }

  async getPoolInfo(id: string): Promise<any> {
    return this.poolModel.findOne({ _id: id }).populate('user');
  }
  async addPool(groups: any, user: string, title: string, minremain: number): Promise<any> {
    return this.poolModel.create({ groups, user, title, minremain });
  }

  async editPool(id: string, title: string, minremain: number): Promise<any> {
    return this.poolModel.findOneAndUpdate({ _id: id }, { $set: { title, minremain } });
  }

  async updatePoolMinRemain(id: string, minremain: number): Promise<any> {
    return this.poolModel.findOneAndUpdate({ _id: id }, { $set: { minremain } });
  }

  async updatePoolSettingsQuery(id: string, query): Promise<any> {
    return this.poolModel.findOneAndUpdate({ _id: id }, query);
  }

  async getPoolInfoByGroupId(groupid: string): Promise<any> {
    return this.poolModel.findOne({ groups: groupid });
  }
  async listPool(query: any, page: number): Promise<any> {
    return this.poolModel.paginate(query, {
      page: page,
      populate: { path: 'turnover groups' },
      sort: { createdAt: -1 },
      limit: 50,
    });
  }

  async changeStatus(id: string, status: Boolean): Promise<any> {
    return this.poolModel.findOneAndUpdate({ _id: id }, { $set: { status } });
  }

  async addHistory(pool: string, user: string, description: string): Promise<any> {
    return this.historyModel.create({ pool, user, description });
  }

  async changeHistoryVisibility(id: string, visible: boolean): Promise<any> {
    return this.historyModel.findOneAndUpdate({ _id: id }, { $set: { visible } });
  }

  async listHistory(query: any, page: number): Promise<any> {
    return this.historyModel.paginate(query, { page: page, sort: { createdAt: -1 }, limit: 50 });
  }
}
