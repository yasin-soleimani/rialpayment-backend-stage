import { ArgumentsHost } from '@vision/common';
import { ExceptionFilterMetadata } from '@vision/common/interfaces/exceptions/exception-filter-metadata.interface';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { InvalidExceptionFilterException } from '@vision/core/errors/exceptions/invalid-exception-filter.exception';
import { WsException } from '@vision/websockets/exceptions/ws-exception';
import { BaseWsExceptionFilter } from '@vision/websockets/exceptions/base-ws-exception-filter';

export class WsExceptionsHandler extends BaseWsExceptionFilter {
  private filters: ExceptionFilterMetadata[] = [];

  public handle(exception: Error | WsException | any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    if (this.invokeCustomFilters(exception, host) || !client.emit) {
      return void 0;
    }
    super.catch(exception, host);
  }

  public setCustomFilters(filters: ExceptionFilterMetadata[]) {
    if (!Array.isArray(filters)) {
      throw new InvalidExceptionFilterException();
    }
    this.filters = filters;
  }

  public invokeCustomFilters(exception, args: ArgumentsHost): boolean {
    if (isEmpty(this.filters)) return false;

    const filter = this.filters.find(({ exceptionMetatypes, func }) => {
      const hasMetatype =
        !exceptionMetatypes.length ||
        !!exceptionMetatypes.find(
          ExceptionMetatype => exception instanceof ExceptionMetatype,
        );
      return hasMetatype;
    });
    filter && filter.func(exception, args);
    return !!filter;
  }
}
