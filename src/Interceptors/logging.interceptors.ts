import { Injectable, VisionInterceptor, ExecutionContext } from '@vision/common';
import { Observable } from 'rxjs';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { map } from 'rxjs/operators';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class TransformInterceptor<T> implements VisionInterceptor<T, any> {
  intercept(context: ExecutionContext, call$: Observable<T>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    if (request.method == 'OPTIONS') {
      res.setHeader({ 'Access-Control-Max-Age': '600' });
    }
    if (!isEmpty(request.headers.authorization)) {
      console.log(request.headers.authorization);
    }
    const clientName = request.headers['user-agent'];
    checkClientIncep(clientName);
    return call$.pipe(map((data) => data));
  }
}

function checkClientIncep(client: string) {
  const title = 'درخواست شما معتبر نمی باشد';
  const regex = /(postman|Postman|insomnia|Insomnia|curl|Curl|CURL)/;
  if (regex.test(client)) throw new UserCustomException(title, false, 401);
}
