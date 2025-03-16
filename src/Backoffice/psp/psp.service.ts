import { Injectable } from '@vision/common';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class PspService {
  constructor() {}
  static successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }
  checkDeleteHeader(req) {
    const terminalid = req.header('terminalid');
    if (isEmpty(terminalid)) throw new FillFieldsException();
    return terminalid;
  }
}
