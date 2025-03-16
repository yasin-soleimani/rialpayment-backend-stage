import { HttpException } from '@vision/common/exceptions/http.exception';
import { HttpStatus } from '@vision/common/enums/http-status.enum';
import { createHttpExceptionBody } from '@vision/common/utils/http-exception-body.util';

export class UnprocessableEntityException extends HttpException {
  constructor(message?: string | object | any, error = 'Unprocessable Entity') {
    super(
      createHttpExceptionBody(message, error, HttpStatus.UNPROCESSABLE_ENTITY),
      HttpStatus.OK,
    );
  }
}
