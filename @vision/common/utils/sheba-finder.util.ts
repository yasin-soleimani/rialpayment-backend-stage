import * as Sheba from 'iran-sheba';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

export function shebaFinder(sheba) {
  if (Sheba.isValid(sheba)){
    return Sheba.recognize(sheba);
  } else {
    throw new UserCustomException('شماره شبا صحیح نمی باشد');
  }
}