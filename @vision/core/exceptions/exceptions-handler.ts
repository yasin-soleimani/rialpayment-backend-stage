import { HttpException, HttpServer, Logger } from '@vision/common';
import { ExceptionFilterMetadata } from '@vision/common/interfaces/exceptions/exception-filter-metadata.interface';
import { ArgumentsHost } from '@vision/common/interfaces/features/arguments-host.interface';
import { isEmpty, isObject } from '@vision/common/utils/shared.utils';
import { messages } from '@vision/core/constants';
import { InvalidExceptionFilterException } from '@vision/core/errors/exceptions/invalid-exception-filter.exception';

export class ExceptionsHandler {
  private static readonly logger = new Logger(ExceptionsHandler.name);
  private filters: ExceptionFilterMetadata[] = [];

  constructor(private readonly applicationRef: HttpServer) {}

  public next(exception: Error | HttpException | any, ctx: ArgumentsHost) {
    if (this.invokeCustomFilters(exception, ctx)) return;

    if (!(exception instanceof HttpException)) {
      const body = {
        status: 500,
        success : false,
        message: messages.UNKNOWN_EXCEPTION_MESSAGE,
      };
      this.applicationRef.reply(ctx.getArgByIndex(1), body, body.status);
      if (this.isExceptionObject(exception)) {
        return ExceptionsHandler.logger.error(
          exception.message,
          exception.stack,
        );
      }
      return ExceptionsHandler.logger.error(exception);
    }
    const res = exception.getResponse();
    const message = isObject(res)
      ? res
      : {
          status: exception.getStatus(),
          message: res,
        };

    this.applicationRef.reply(
      ctx.getArgByIndex(1),
      message,
      exception.getStatus(),
    );
  }

  public setCustomFilters(filters: ExceptionFilterMetadata[]) {
    if (!Array.isArray(filters)) {
      throw new InvalidExceptionFilterException();
    }
    this.filters = filters;
  }

  public invokeCustomFilters(exception, response): boolean {
    if (isEmpty(this.filters)) return false;

    const filter = this.filters.find(({ exceptionMetatypes, func }) => {
      const hasMetatype =
        !exceptionMetatypes.length ||
        !!exceptionMetatypes.find(
          ExceptionMetatype => exception instanceof ExceptionMetatype,
        );
      return hasMetatype;
    });
    filter && filter.func(exception, response);
    return !!filter;
  }

  public isExceptionObject(err): err is Error {
    return isObject(err) && !!(err as Error).message;
  }
}
