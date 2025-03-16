import { Injectable } from '@vision/common';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { ApiPermDto } from './dto/apiPerm.dto';
import { ApiPermCoreService } from '../../Core/apiPerm/apiPerm.service';

@Injectable()
export class ApiPermService {
  constructor(private readonly apiPermCoreService: ApiPermCoreService) {}

  async newPermission(getInfo: ApiPermDto): Promise<any> {
    if (
      isEmpty(getInfo.user) ||
      isEmpty(getInfo.auth) ||
      isEmpty(getInfo.authamount) ||
      isEmpty(getInfo.username) ||
      isEmpty(getInfo.password) ||
      isEmpty(getInfo.ip)
    )
      throw new FillFieldsException();
    const acl = await this.apiPermCoreService.newPerm(getInfo);
    if (!acl) throw new UserCustomException('متاسفانه خطایی در عملیات رخ داده است', false, 400);
    return this.successOpt();
  }

  successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }
}
