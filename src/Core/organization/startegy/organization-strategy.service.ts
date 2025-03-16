import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { OrgStrategyDto } from './dto/organization-strategy.dto';

@Injectable()
export class OrganizationStrategyService {
  constructor(@Inject('OrganizationStrategyModel') private readonly orgStrategyModel: Model<any>) {}

  async newItem(getInfo: OrgStrategyDto): Promise<any> {
    return this.orgStrategyModel.create(getInfo);
  }

  async list(userid: string, groupid: string): Promise<any> {
    return this.orgStrategyModel
      .find({ user: userid, group: groupid })
      .populate({ path: 'terminal', select: { title: 1 } });
  }

  async remove(sid: string): Promise<any> {
    return this.orgStrategyModel.findOneAndRemove({ _id: sid });
  }

  async getOrganStrategy(group, terminal): Promise<any> {
    return this.orgStrategyModel.findOne({
      $and: [{ terminal: { $in: terminal } }, { group: { $in: group } }],
    });
  }
}
