import { Injectable, faildOpt, NotFoundException } from '@vision/common';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { isNil } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class IpgFactoryService {
  constructor(private readonly ipgService: IpgCoreService, private readonly mipgService: MipgCoreService) {}

  async getInformation(getInfo): Promise<any> {
    const info = await this.ipgService.findByUserInvoice(getInfo.ref);
    if (!info) return faildOpt();
    const terminalInfo = await this.mipgService.getInfo(info.terminalid);
    if (!terminalInfo) return faildOpt();
    return {
      status: 200,
      title: terminalInfo.title,
      terminalid: info.terminalid,
      amount: info.amount,
      ref: 'IPG_' + info.ref,
      logo: imageTransform(terminalInfo.logo),
    };
  }

  async getIpgInfo(terminalid): Promise<any> {
    if (isNil(terminalid)) throw new FillFieldsException();
    return this.mipgService.getInfo(terminalid).then((res) => {
      if (!res) throw new NotFoundException();
      return res;
    });
  }
}
