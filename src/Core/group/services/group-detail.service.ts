import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class GroupDetailCoreService {
  constructor(@Inject('GroupDetailsModel') private readonly detailModel: Model<any>) {}

  async addDetails(): Promise<any> {}

  async getDetails(groupid: string): Promise<any> {
    return this.detailModel.findOne({ group: groupid });
  }

  async checkIfTerminalExistsInGroupDetails(terminalid: string): Promise<any> {
    const terminals = [terminalid];

    return this.detailModel.findOne({ terminals: { $in: terminals } });
  }
}
