import { Injectable, NotFoundException, successOptWithDataNoValidation, successOpt } from '@vision/common';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { IpgListBackofficeDto } from './dto/ipg-list.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class IpgBackofficeService {
  constructor(private readonly ipgCoreService: IpgCoreService) {}

  async getList(): Promise<any> {
    const data = await this.ipgCoreService.getIpgList();
    // const xy = '1,2';
    // const splited = xy.split(',');
    // let rand = Math.round(Math.random() * (splited.length - 1) + 1);
    // console.log( rand, 'rand');
    // console.log( data[rand], 'my rand')
    if (!data) throw new NotFoundException();
    return successOptWithDataNoValidation(data);
  }

  async addNew(getInfo: IpgListBackofficeDto): Promise<any> {
    console.log(getInfo);
    if (isEmpty(getInfo.title) || isEmpty(getInfo.code)) throw new FillFieldsException();
    const data = await this.ipgCoreService.ipgListAdd(getInfo);
    if (!data) throw new UserCustomException('عملیات با خطا مواجه شده است');
    return successOpt();
  }
}
