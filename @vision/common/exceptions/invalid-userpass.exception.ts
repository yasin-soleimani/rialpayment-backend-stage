import { HttpException } from '@vision/common/exceptions/http.exception';
import { HttpStatus } from '@vision/common/enums/http-status.enum';
import { createHttpExceptionBody } from '@vision/common/utils/http-exception-body.util';
import { VisionStatus } from "@vision/common/enums";

export class invalidUserPassException extends HttpException {
  constructor(message= 'کلمه عبور اشتباه می باشد', success = false) {
    super(
      createHttpExceptionBody(message, success, VisionStatus.wrongPassword),
      HttpStatus.OK,
    );
  }
}
