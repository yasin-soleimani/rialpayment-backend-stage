import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

export function CashoutAutomaticValidation(getInfo) {
  console.log(getInfo, 'gg');
  if (isEmpty(getInfo.account) || isEmpty(getInfo.from) || isEmpty(getInfo.hour) || isEmpty(getInfo.user))
    throw new FillFieldsException();

  if (getInfo.hour < 7 || getInfo.hour > 13) throw new UserCustomException('باز زمانی نامعتبر');
}
