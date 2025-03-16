import { Inject, Injectable } from '@vision/common';
import { MipgDirectCoreDto } from '../dto/mipg-direct.dto';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { MipgFromMrsDto } from '../../../Backoffice/mipg/dto/from-mrs.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class MipgDirectCoreService {
  constructor(
    @Inject('MipgDirectModel') private readonly directModel: any,
    @Inject('MipgModel') private readonly mipgModel: any
  ) {}

  async addnew(getInfo: MipgDirectCoreDto): Promise<any> {
    const data = await this.mipgModel.findOne({ _id: getInfo.mipg });
    if (!data) throw new UserNotfoundException('درگاه نامعتبر');
    return this.directModel.create(getInfo);
  }

  async addNewFromMrs(getInfo: MipgFromMrsDto): Promise<any> {
    const terminalInfo = await this.mipgModel.findOne({ terminalid: getInfo.terminalid });
    if (!terminalInfo) throw new UserCustomException('ترمینال یافت نشد', false, 404);

    getInfo.mipg = terminalInfo._id;

    return this.mipgModel.findOneAndUpdate(
      {
        acceptorcode: getInfo.acceptorcode,
        psp: getInfo.psp,
      },
      getInfo
    );
  }

  async edit(getInfo: MipgDirectCoreDto): Promise<any> {
    const data = await this.mipgModel.findOne({ _id: getInfo.mipg });
    if (!data) throw new UserNotfoundException('درگاه نامعتبر');

    return this.directModel.findOneAndUpdate({ _id: getInfo.id }, getInfo);
  }

  async chanegStatus(id: string, status: any): Promise<any> {
    return this.directModel.findOneAndUpdate(
      {
        _id: id,
      },
      { status: status }
    );
  }

  async getList(mipg: string): Promise<any> {
    return this.directModel.find({ mipg: mipg });
  }
}
