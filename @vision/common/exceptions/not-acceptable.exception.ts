import { HttpException } from '@vision/common/exceptions/http.exception';
import { HttpStatus } from '@vision/common/enums/http-status.enum';
import { createHttpExceptionBody } from '@vision/common/utils/http-exception-body.util';

export class NotAcceptableException extends HttpException {
  constructor(message?: string | object | any, success = false) {
    super(
      createHttpExceptionBody(message, success, HttpStatus.NOT_ACCEPTABLE),
      HttpStatus.OK,
    );
  }
}
