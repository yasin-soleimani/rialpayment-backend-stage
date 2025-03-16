import { HttpException } from '@vision/common/exceptions/http.exception';
import { HttpStatus } from '@vision/common/enums/http-status.enum';
import { createHttpExceptionBody } from '@vision/common/utils/http-exception-body.util';
import { VisionStatus } from "@vision/common/enums";

export class notEnoughMoneyException extends HttpException {
  constructor(message= 'موجودی کافی نمی باشد', success = false) {
    super(
      createHttpExceptionBody(message, success, VisionStatus.notEnoughBalance),
      HttpStatus.OK,
    );
  }
}
