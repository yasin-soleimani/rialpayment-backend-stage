import { Injectable, successOpt } from '@vision/common';
import { AclCoreService } from '../../Core/acl/acl.service';
import { AcelBackOfficeDto } from './dto/acl.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { addYearToExpire, timestamoToISO } from '@vision/common/utils/month-diff.util';

@Injectable()
export class AclBackOfficeService {
  constructor(private readonly aclService: AclCoreService) {}

  async newPermission(getInfo: AcelBackOfficeDto): Promise<any> {
    if (isEmpty(getInfo.user) || isEmpty(getInfo.agentnewuser)) throw new FillFieldsException();
    // getInfo.expire = timestamoToISO(getInfo.expire * 1000);
    getInfo.expire = timestamoToISO(getInfo.expire);
    const acl = await this.aclService.newAcl(getInfo);
    if (!acl) throw new UserCustomException('متاسفانه خطایی در عملیات رخ داده است', false, 400);
    return successOpt();
  }
}
