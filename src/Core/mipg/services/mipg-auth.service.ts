import { Inject, Injectable } from '@vision/common';

@Injectable()
export class MipgAuthService {
  constructor(@Inject('MipgAuthModel') private readonly mipgAuthModel: any) {}

  async addNew(nationalcode, mobile, shahkar, nahab, mipg, status): Promise<any> {
    let nationalcodex,
      mobilex,
      shahkarx,
      nahabx = false;
    if (nationalcode == 'true') nationalcodex = true;
    if (mobile == 'true') mobilex = true;
    if (shahkar == 'true') shahkarx = true;
    if (nahab == 'true') nahabx = true;
    return this.mipgAuthModel.findOneAndUpdate(
      { mipg: mipg },
      {
        status: status,
        sitad: nationalcodex,
        mobile: mobilex,
        shahkar: shahkarx,
        nahab: nahabx,
        mipg: mipg,
      },
      { new: true, upsert: true }
    );
  }

  async getInfo(id: string): Promise<any> {
    return this.mipgAuthModel.findOne({ _id: id });
  }

  async getInfoByMipg(mipg: string): Promise<any> {
    return this.mipgAuthModel.findOne({
      mipg: mipg,
    });
  }

  async update(nationalcode, mobile, shahkar, nahab, mipg): Promise<any> {
    let nationalcodex,
      mobilex,
      shahkarx,
      nahabx = false;
    if (nationalcode == 'true') nationalcodex = true;
    if (mobile == 'true') mobilex = true;
    if (shahkar == 'true') shahkarx = true;
    if (nahab == 'true') nahabx = true;
    return this.mipgAuthModel.findOneAndUpdate(
      {
        mipg: mipg,
      },
      {
        sitad: nationalcodex,
        mobile: mobilex,
        shahkar: shahkarx,
        nahab: nahabx,
      }
    );
  }
}
