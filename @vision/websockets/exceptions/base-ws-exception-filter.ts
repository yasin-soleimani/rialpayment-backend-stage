import { ArgumentsHost, WsExceptionFilter } from '@vision/common';
import { isObject } from '@vision/common/utils/shared.utils';
import { messages } from '@vision/core/constants';
import { WsException } from '@vision/websockets/exceptions/ws-exception';

export class BaseWsExceptionFilter<T = any> implements WsExceptionFilter<T> {
  catch(exception: T, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const status = 'error';

    if (!(exception instanceof WsException)) {
      const errorMessage = messages.UNKNOWN_EXCEPTION_MESSAGE;
      return client.emit('exception', { status, message: errorMessage });
    }
    const result = exception.getError();
    const message = isObject(result)
      ? result
      : {
          status,
          message: result,
        };
    client.emit('exception', message);
  }
}
