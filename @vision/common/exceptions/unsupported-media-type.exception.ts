import { HttpException } from '@vision/common/exceptions/http.exception';
import { HttpStatus } from '@vision/common/enums/http-status.enum';
import { createHttpExceptionBody } from '@vision/common/utils/http-exception-body.util';

export class UnsupportedMediaTypeException extends HttpException {
  constructor(
    message?: string | object | any,
    error = 'Unsupported Media Type',
  ) {
    super(
      createHttpExceptionBody(
        message,
        error,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      HttpStatus.OK,
    );
  }
}
