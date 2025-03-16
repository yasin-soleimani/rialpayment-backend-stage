import { HttpException } from '@vision/common/exceptions/http.exception';
import { HttpStatus } from '@vision/common/enums/http-status.enum';
import { createHttpExceptionBody } from '@vision/common/utils/http-exception-body.util';
import { VisionStatus } from '@vision/common/enums';

export class DuplicateException extends HttpException {
  constructor(message= 'متاسفانه قبلا در سیستم ثبت شده است', success = false) {
    super(
      createHttpExceptionBody(message, success, VisionStatus.Duplicate),
      HttpStatus.OK,
    );
  }
}
