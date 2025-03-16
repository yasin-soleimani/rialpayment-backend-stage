import { Injectable } from '@vision/common';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import * as Sheba from 'iran-sheba';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class ShabaService {
  constructor() {}
  static successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  checkDeleteHeader(req) {
    const id = req.header('id');
    if (isEmpty(id)) throw new FillFieldsException();
    return id;
  }

  async getBankname(sheba: string): Promise<any> {
    if (Sheba.isValid(sheba)) {
      return Sheba.recognize(sheba);
    } else {
      throw new UserCustomException('متاسفانه شبا وارد شده صحیح نمی باشد', false, 202);
    }
  }
}
