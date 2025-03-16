import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class SessionService {
  constructor(@Inject('SessionModel') private readonly sessionModel: Model<any>) {}

  async getStatusById(id: string): Promise<any> {
    return this.sessionModel.findOne({
      _id: id,
    });
  }
}
