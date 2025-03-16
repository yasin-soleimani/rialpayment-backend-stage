import { Model } from 'mongoose';
import { Injectable, Inject, InternalServerErrorException } from '@vision/common';
import { SitadCoreReqDto } from './dto/sitad-req.dto';

@Injectable()
export class SitadCoreService {
  constructor(@Inject('SitadReqModel') private readonly sitadReqModel: Model<any>) {}

  async submitReq(getInfo: SitadCoreReqDto): Promise<any> {
    return this.sitadReqModel.create(getInfo);
  }
}
