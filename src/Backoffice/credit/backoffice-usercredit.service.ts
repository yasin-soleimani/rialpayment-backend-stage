import { Injectable } from '@vision/common';
import { BackofficeUserCreditDto } from './dto/backoffice-usercredit.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class BackofficeUserCreditService {
  constructor() {}

  async increaseCredit(getInfo: BackofficeUserCreditDto): Promise<any> {
    this.checkInputs(getInfo);
  }

  private checkInputs(getInfo: BackofficeUserCreditDto) {
    if (isEmpty(getInfo.amount) || isEmpty(getInfo.user) || isEmpty(getInfo.start)) throw new FillFieldsException();
  }
}
