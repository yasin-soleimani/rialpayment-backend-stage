import { Injectable } from '@vision/common';
import { NewOperatorCoreDto } from '../dto/operator.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { OperatorLoginCoreDto } from '../dto/login.dto';

@Injectable()
export class OperatorCommonService {
  constructor() {}

  async regValidation(getInfo: NewOperatorCoreDto): Promise<any> {
    if (isEmpty(getInfo.username) || isEmpty(getInfo.password)) throw new FillFieldsException();
  }

  async loginValidation(getInfo: OperatorLoginCoreDto): Promise<any> {
    if (isEmpty(getInfo.username) || isEmpty(getInfo.username)) throw new FillFieldsException();
  }
}
