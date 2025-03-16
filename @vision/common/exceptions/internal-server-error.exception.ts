import { HttpException } from '@vision/common/exceptions/http.exception';
import { HttpStatus } from '@vision/common/enums/http-status.enum';
import { createHttpExceptionBody } from '@vision/common/utils/http-exception-body.util';

export class InternalServerErrorException extends HttpException {
  constructor(
    message = 'خطا در برقراری ارتباط',
    success = false,
  ) {
    super(
      createHttpExceptionBody(message, success, HttpStatus.INTERNAL_SERVER_ERROR),
      HttpStatus.OK,
    );
  }
}
